import { type Message } from 'ai';
import { createParser } from 'eventsource-parser';
import OpenAI from 'openai';
import { openai } from '@/lib/openai';
import { auth } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { rateLimitRequest, getRateLimitContext } from '../../../lib/rate-limit';

// Cache for concurrent request handling
const requestCache = new Map<string, Promise<Response>>();

// Helper to create a streaming response
function createStream(response: AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>) {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  return new ReadableStream({
    async start(controller) {
      for await (const chunk of response) {
        const text = chunk.choices[0]?.delta?.content || '';
        if (text) {
          controller.enqueue(encoder.encode(text));
        }
      }
      controller.close();
    },
  });
}

export async function POST(request: Request): Promise<Response> {
  try {
    // Verify authentication
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');
    let userId: string | undefined;

    if (sessionCookie?.value) {
      try {
        const decodedClaim = await auth.verifySessionCookie(sessionCookie.value);
        userId = decodedClaim.uid;
      } catch (error) {
        console.warn('Invalid session token:', error);
        // Continue as anonymous user
      }
    }

    // Apply rate limiting
    const rateLimitContext = getRateLimitContext(request, userId);
    const rateLimitResult = await rateLimitRequest(rateLimitContext, {
      maxRequests: userId ? 30 : 10, // Higher limit for authenticated users
      windowMs: 60000 // 1 minute window
    });

    if (!rateLimitResult.success) {
      return rateLimitResult.response!;
    }

    // Parse request data
    const { messages, language = 'en' } = await request.json();

    // Generate cache key for concurrent requests
    const cacheKey = JSON.stringify({ messages, language });
    
    // Check if there's already an ongoing request for this input
    if (requestCache.has(cacheKey)) {
      return requestCache.get(cacheKey)!;
    }

    // Create the response promise
    const responsePromise = createChatResponse(messages, language, userId);
    
    // Cache the promise
    requestCache.set(cacheKey, responsePromise);

    // Remove from cache after completion
    responsePromise.finally(() => {
      requestCache.delete(cacheKey);
    });

    return responsePromise;

  } catch (error: any) {
    console.error('Chat API Error:', error);
    
    // Handle different types of errors
    if (error.code === 'context_length_exceeded') {
      return new NextResponse('Message is too long', { status: 413 });
    }
    if (error.code === 'rate_limit_exceeded') {
      return new NextResponse('Rate limit exceeded', { status: 429 });
    }
    if (error.code === 'invalid_request_error') {
      return new NextResponse('Invalid request', { status: 400 });
    }
    
    return new NextResponse('Internal server error', { status: 500 });
  }
}

async function createChatResponse(messages: Message[], language: string, userId?: string): Promise<Response> {
  try {
    // Prepare system message based on language
    const systemMessage: OpenAI.ChatCompletionMessageParam = {
      role: "system",
      content: `You are PocketLawyer, a legal assistant. Communicate in ${language}. ${
        !userId ? 'For unauthenticated users, provide brief responses.' : ''
      } Always cite relevant laws and regulations.`
    };

    // Prepare messages for the API call - ensure correct typing
    const apiMessages: OpenAI.ChatCompletionMessageParam[] = [
      systemMessage,
      ...messages.slice(-10).map(msg => {
        const role = msg.role === 'user' ? 'user' as const :
                    msg.role === 'assistant' ? 'assistant' as const :
                    msg.role === 'system' ? 'system' as const : 'user' as const;
        return {
          role,
          content: msg.content
        };
      })
    ];

    // Create chat completion with streaming
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: apiMessages,
      temperature: 0.7,
      max_tokens: userId ? 2000 : 500,
      stream: true
    });

    // Create streaming response
    const stream = createStream(response);
    
    // Return the streaming response
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    throw error; // Let the main handler deal with errors
  }
}
