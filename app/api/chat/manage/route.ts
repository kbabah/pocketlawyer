import { NextResponse } from 'next/server';
import { saveChat, updateChat, deleteChat, getChat, getUserChats, updateChatTitle } from '../admin';

export async function POST(request: Request) {
  try {
    const chatData = await request.json();
    
    // Validate required fields
    if (!chatData.userId) {
      console.error('Chat API Error: Missing userId in request');
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }
    
    if (!chatData.messages || !Array.isArray(chatData.messages) || chatData.messages.length === 0) {
      console.error('Chat API Error: Invalid or empty messages array');
      return NextResponse.json({ error: 'Valid messages array is required' }, { status: 400 });
    }
    
    console.log(`Saving chat for user: ${chatData.userId}, message count: ${chatData.messages.length}`);
    const chatId = await saveChat(chatData);
    console.log(`Successfully saved chat with ID: ${chatId}`);
    
    return NextResponse.json({ id: chatId });
  } catch (error: any) {
    console.error('Chat API Error:', error);
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
    } else if (messages) {
      // Updating messages (and potentially title/timestamp)
      const dataToUpdate: { messages: any; title?: string; timestamp?: number } = { messages };
      if (title) dataToUpdate.title = title;
      if (timestamp) dataToUpdate.timestamp = timestamp;
      await updateChat(chatId, dataToUpdate);
    } else {
      return NextResponse.json({ error: 'No valid update data provided (messages or title required)' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Chat API Error (PUT):', error);
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
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Chat API Error:', error);
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

    console.log(`GET request received with params: chatId=${chatId}, userId=${userId}`);

    if (chatId) {
      console.log(`Attempting to fetch chat with ID: ${chatId}`);
      const chat = await getChat(chatId);
      
      if (!chat) {
        console.log(`Chat not found with ID: ${chatId}`);
        return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
      }
      
      console.log(`Successfully found chat: ${chatId}`);
      return NextResponse.json(chat);
    } else if (userId) {
      console.log(`Fetching chats for user: ${userId}`);
      const chats = await getUserChats(userId);
      console.log(`Found ${chats.length} chats for user ${userId}`);
      return NextResponse.json(chats);
    }

    console.log('Request missing both chatId and userId parameters');
    return NextResponse.json({ error: 'Missing chatId or userId' }, { status: 400 });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch chat' }, { status: 500 });
  }
}