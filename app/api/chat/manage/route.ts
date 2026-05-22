import { NextResponse } from 'next/server';
import type { Message } from 'ai';
import { saveChat, updateChat, deleteChat, getChat, getUserChats, updateChatTitle } from '../admin';
import { logger } from '@/lib/logger';
import {
  requireAuth,
  assertUserCanAccessChat,
  forbiddenResponse,
} from '@/lib/api-auth';

export async function POST(request: Request) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const chatData = await request.json();

    if (!chatData.userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    if (chatData.userId !== user.uid && !user.isAdmin) {
      return forbiddenResponse();
    }

    if (!chatData.messages || !Array.isArray(chatData.messages) || chatData.messages.length === 0) {
      return NextResponse.json({ error: 'Valid messages array is required' }, { status: 400 });
    }

    const chatId = await saveChat(chatData);
    logger.info('Chat saved successfully', { chatId, userId: chatData.userId });

    return NextResponse.json({ id: chatId });
  } catch (error: unknown) {
    const err = error as Error;
    logger.error('Failed to save chat', err);
    return NextResponse.json({
      error: 'Failed to save chat',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined,
    }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const { chatId, messages, title, timestamp } = await request.json();

    if (!chatId) {
      return NextResponse.json({ error: 'Chat ID is required' }, { status: 400 });
    }

    const canAccess = await assertUserCanAccessChat(chatId, user.uid, user.isAdmin);
    if (!canAccess) {
      const existing = await getChat(chatId);
      if (!existing) {
        return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
      }
      return forbiddenResponse();
    }

    if (title && !messages) {
      await updateChatTitle(chatId, title);
    } else if (messages) {
      const dataToUpdate: { messages: Message[]; title?: string; timestamp?: number } = { messages };
      if (title) dataToUpdate.title = title;
      if (timestamp) dataToUpdate.timestamp = timestamp;
      await updateChat(chatId, dataToUpdate);
    } else {
      return NextResponse.json({ error: 'No valid update data provided (messages or title required)' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    logger.error('Failed to update chat', error as Error);
    return NextResponse.json({ error: 'Failed to update chat' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const { chatId } = await request.json();

    if (!chatId) {
      return NextResponse.json({ error: 'Chat ID is required' }, { status: 400 });
    }

    const canAccess = await assertUserCanAccessChat(chatId, user.uid, user.isAdmin);
    if (!canAccess) {
      const existing = await getChat(chatId);
      if (!existing) {
        return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
      }
      return forbiddenResponse();
    }

    await deleteChat(chatId);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    logger.error('Failed to delete chat', error as Error);
    return NextResponse.json({ error: 'Failed to delete chat' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get('chatId');
    const userId = searchParams.get('userId');

    if (chatId) {
      const canAccess = await assertUserCanAccessChat(chatId, user.uid, user.isAdmin);
      if (!canAccess) {
        const chat = await getChat(chatId);
        if (!chat) {
          return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
        }
        return forbiddenResponse();
      }

      const chat = await getChat(chatId);
      return NextResponse.json(chat);
    }

    if (userId) {
      if (userId !== user.uid && !user.isAdmin) {
        return forbiddenResponse();
      }
      const chats = await getUserChats(userId);
      return NextResponse.json(chats);
    }

    return NextResponse.json({ error: 'Missing chatId or userId' }, { status: 400 });
  } catch (error: unknown) {
    const err = error as Error;
    logger.error('Failed to fetch chat', err);
    return NextResponse.json({
      error: 'Failed to fetch chat',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined,
    }, { status: 500 });
  }
}
