import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { logger } from "@/lib/logger";
import { openai, OPENAI_MODELS } from '@/lib/openai'
import { adminAuth } from '@/lib/firebase-admin';

/** Verify the request has a valid, non-anonymous Firebase session cookie */
async function getAuthenticatedUid(req: NextRequest): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('firebase-session')?.value;
    if (!sessionCookie) return null;
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    if (decoded.firebase?.sign_in_provider === 'anonymous') return null;
    return decoded.uid;
  } catch {
    return null;
  }
}

export const maxDuration = 60

// gpt-4o supports 128k context. Leave headroom for the system prompt and answer.
// ~4 chars per token → reserve 3000 tokens for prompt scaffolding + 2000 for answer = 5000 tokens = ~20k chars
const MAX_DOCUMENT_CHARS = 100_000; // ~25k tokens, well inside 128k window

/** Truncate document text to fit the model's context window */
function truncateDocument(text: string, maxChars: number): { text: string; truncated: boolean } {
  if (text.length <= maxChars) return { text, truncated: false };
  // Try to break at a paragraph boundary
  const slice = text.slice(0, maxChars);
  const lastPara = slice.lastIndexOf('\n\n');
  const cutAt = lastPara > maxChars * 0.8 ? lastPara : maxChars;
  return { text: text.slice(0, cutAt).trim(), truncated: true };
}

export async function POST(req: NextRequest) {
  const uid = await getAuthenticatedUid(req);
  if (!uid) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  try {
    const body = await req.json()
    const { text: rawText, documentContent, question, model = OPENAI_MODELS.GPT4O } = body
    const fullText = (rawText || documentContent || '').trim()

    if (!fullText || !question) {
      return NextResponse.json(
        { error: 'Please provide both the document text and a question.' },
        { status: 400 }
      )
    }
    if (fullText.length < 20) {
      return NextResponse.json(
        { error: 'The document text is too short to analyze meaningfully.' },
        { status: 400 }
      )
    }
    if (question.trim().length < 3) {
      return NextResponse.json(
        { error: 'Please provide a more specific question.' },
        { status: 400 }
      )
    }

    const { text, truncated } = truncateDocument(fullText, MAX_DOCUMENT_CHARS);

    const systemPrompt = `You are an expert legal assistant specializing in Cameroonian law, including both Common Law (Northwest and Southwest regions) and Civil Law (Francophone regions), as well as OHADA business law.

When analyzing documents:
- Identify the document type and its legal context (contract, judgment, statute, etc.)
- Extract and explain key legal provisions, obligations, and rights
- Highlight important dates, deadlines, and parties involved
- Flag any potentially problematic clauses or legal risks
- Explain legal terminology in plain language
- Reference applicable Cameroonian laws, OHADA acts, or international conventions where relevant

Respond in the same language the user asks in (English or French).${truncated ? '\n\nNote: The document was truncated due to length. Analysis is based on the first portion.' : ''}`

    const userPrompt = `Document:\n\n${text}\n\n---\n\nQuestion: ${question}`

    try {
      const completion = await openai.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 2048,
        temperature: 0.2
      })

      const answer = completion.choices[0]?.message?.content?.trim()
      if (!answer) {
        return NextResponse.json(
          { error: 'The AI could not generate an answer. Please try rephrasing your question.' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        answer,
        truncated,
        documentLength: fullText.length,
        analyzedLength: text.length
      })

    } catch (error: any) {
      logger.error('OpenAI API error:', { status: error.status, code: error.code, message: error.message })

      let errorMessage = 'Failed to analyze the document due to an AI service issue.';
      if (error.code === 'context_length_exceeded') {
        errorMessage = 'The document is too long to process. Please try with a shorter section.';
      } else if (error.status === 429) {
        errorMessage = 'The AI service is busy. Please try again in a moment.';
      } else if (error.status === 401) {
        errorMessage = 'AI service authentication failed. Please contact support.';
      } else if (error.status === 404) {
        errorMessage = 'The AI model is currently unavailable. Please try again later.';
      }

      const details = process.env.NODE_ENV === 'development'
        ? ` [HTTP ${error.status ?? 'unknown'}: ${error.message ?? ''}]`
        : ''

      return NextResponse.json({ error: errorMessage + details }, { status: 500 })
    }

  } catch (outerError: any) {
    logger.error('Request parsing error:', outerError)
    return NextResponse.json(
      { error: 'Invalid request format. Please ensure the data is correctly structured.' },
      { status: 400 }
    )
  }
}
