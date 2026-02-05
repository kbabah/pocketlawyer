import { NextResponse } from 'next/server';
import { saveChat, updateChat, deleteChat, getChat, getUserChats, updateChatTitle } from '../admin';
import { logger } from '@/lib/logger';

export async function POST(request: Request) {
  try {
    const chatData = await request.json();
    
    // Validate required fields
    if (!chatData.userId) {
      logger.warn('Chat API: Missing userId in request');
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }
    
    if (!chatData.messages || !Array.isArray(chatData.messages) || chatData.messages.length === 0) {
      logger.warn('Chat API: Invalid or empty messages array');
      return NextResponse.json({ error: 'Valid messages array is required' }, { status: 400 });
    }
    
    logger.debug('Saving chat', { userId: chatData.userId, messageCount: chatData.messages.length });
    const chatId = await saveChat(chatData);
    logger.info('Chat saved successfully', { chatId, userId: chatData.userId });
    
    return NextResponse.json({ id: chatId });
  } catch (error: any) {
    logger.error('Failed to save chat', error);
    return NextResponse.json({ 
      error: 'Failed to save chat',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined 
    }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { chatId, messages, title, timestamp } = await request.json();

    if (!chatId) {
      return NextResponse.json({ error: 'Chat ID is required' }, { status: 400 });
    }

    // Check if chat exists first
    const existingChat = await getChat(chatId);
    if (!existingChat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    // Determine if it's a rename operation or a full update
    if (title && !messages) {
      // Only renaming the chat
      await updateChatTitle(chatId, title);
      logger.info('Chat renamed', { chatId, title });
    } else if (messages) {
      // Updating messages (and potentially title/timestamp)
      const dataToUpdate: { messages: any; title?: string; timestamp?: number } = { messages };
      if (title) dataToUpdate.title = title;
      if (timestamp) dataToUpdate.timestamp = timestamp;
      await updateChat(chatId, dataToUpdate);
      logger.info('Chat updated', { chatId, messageCount: messages.length });
    } else {
      return NextResponse.json({ error: 'No valid update data provided (messages or title required)' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    logger.error('Failed to update chat', error, { operation: 'PUT' });
    return NextResponse.json({ error: 'Failed to update chat' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { chatId } = await request.json();
    
    if (!chatId) {
      return NextResponse.json({ error: 'Chat ID is required' }, { status: 400 });
    }

    // Check if chat exists first
    const existingChat = await getChat(chatId);
    if (!existingChat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }
    
    await deleteChat(chatId);
    logger.info('Chat deleted', { chatId });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    logger.error('Failed to delete chat', error);
    return NextResponse.json(
      { error: 'Failed to delete chat', details: process.env.NODE_ENV === 'development' ? error.message : undefined },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get('chatId');
    const userId = searchParams.get('userId');

    if (chatId) {
      logger.debug('Fetching chat by ID', { chatId });
      const chat = await getChat(chatId);
      
      if (!chat) {
        logger.warn('Chat not found', { chatId });
        return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
      }
      
      return NextResponse.json(chat);
    } else if (userId) {
      logger.debug('Fetching user chats', { userId });
      try {
        const chats = await getUserChats(userId);
        logger.debug('User chats retrieved', { userId, count: chats.length });
        return NextResponse.json(chats);
      } catch (err: any) {
        logger.error('Failed to fetch user chats', err, { userId });
        return NextResponse.json(
          { 
            error: 'Failed to fetch user chats',
            details: process.env.NODE_ENV === 'development' ? err.message : undefined,
            code: err.code 
          }, 
          { status: 500 }
        );
      }
    }

    logger.warn('Chat API: Missing chatId and userId parameters');
    return NextResponse.json({ error: 'Missing chatId or userId' }, { status: 400 });
  } catch (error: any) {
    logger.error('Failed to fetch chat', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch chat', 
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        code: error.code
      }, 
      { status: 500 }
    );
  }
}