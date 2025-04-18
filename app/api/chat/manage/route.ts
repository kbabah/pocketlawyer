import { NextResponse } from 'next/server';
import { auth } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';
import { saveChat, updateChat, deleteChat, getChat, getUserChats } from '../admin';

interface ApiError extends Error {
  status?: number;
  code?: string;
}

// Helper to verify authentication
async function verifyAuth(request: Request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('session')?.value;
    
    if (!token) {
      throw Object.assign(new Error('Unauthorized - No token'), { status: 401 });
    }

    const decodedToken = await auth.verifySessionCookie(token);
    return decodedToken.uid;
  } catch (error: any) {
    throw Object.assign(new Error('Unauthorized'), { 
      status: error.status || 401,
      code: error.code
    });
  }
}

// Helper to handle API errors
function handleApiError(error: any) {
  console.error('Chat API Error:', error);
  
  const status = error.status || 
                 (error.code === 'permission-denied' ? 403 : 
                 error.code === 'not-found' ? 404 : 500);
                 
  const message = error.message || 'Internal server error';
  
  return NextResponse.json(
    { 
      error: message,
      code: error.code,
      details: process.env.NODE_ENV === 'development' ? error : undefined 
    },
    { status }
  );
}

export async function POST(request: Request) {
  try {
    const userId = await verifyAuth(request);
    const chatData = await request.json();
    
    if (!chatData?.messages?.length) {
      throw Object.assign(new Error('Invalid chat data'), { status: 400 });
    }
    
    // Ensure the chat belongs to the authenticated user
    if (chatData.userId !== userId) {
      throw Object.assign(new Error('Unauthorized'), { status: 403 });
    }

    const chatId = await saveChat(chatData);
    return NextResponse.json({ id: chatId });
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function PUT(request: Request) {
  try {
    const userId = await verifyAuth(request);
    const { chatId, messages, title } = await request.json();
    
    if (!chatId || !messages?.length) {
      throw Object.assign(new Error('Invalid update data'), { status: 400 });
    }

    // Verify chat ownership
    const existingChat = await getChat(chatId);
    if (!existingChat) {
      throw Object.assign(new Error('Chat not found'), { status: 404 });
    }
    if (existingChat.userId !== userId) {
      throw Object.assign(new Error('Unauthorized'), { status: 403 });
    }

    await updateChat(chatId, { messages, title, timestamp: Date.now() });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const userId = await verifyAuth(request);
    const { chatId } = await request.json();
    
    if (!chatId) {
      throw Object.assign(new Error('Chat ID required'), { status: 400 });
    }

    // Verify chat ownership
    const chat = await getChat(chatId);
    if (!chat) {
      throw Object.assign(new Error('Chat not found'), { status: 404 });
    }
    if (chat.userId !== userId) {
      throw Object.assign(new Error('Unauthorized'), { status: 403 });
    }

    await deleteChat(chatId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function GET(request: Request) {
  try {
    const userId = await verifyAuth(request);
    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get('chatId');
    const requestedUserId = searchParams.get('userId');

    // If requesting specific chat
    if (chatId) {
      const chat = await getChat(chatId);
      if (!chat) {
        throw Object.assign(new Error('Chat not found'), { status: 404 });
      }
      
      // Ensure user can only access their own chats
      if (chat.userId !== userId) {
        throw Object.assign(new Error('Unauthorized'), { status: 403 });
      }
      
      return NextResponse.json(chat);
    }
    
    // If requesting user's chats
    if (requestedUserId) {
      // Ensure user can only access their own chats
      if (requestedUserId !== userId) {
        throw Object.assign(new Error('Unauthorized'), { status: 403 });
      }
      
      const chats = await getUserChats(userId);
      return NextResponse.json(chats);
    }
    
    throw Object.assign(new Error('Invalid request parameters'), { status: 400 });
  } catch (error: any) {
    return handleApiError(error);
  }
}