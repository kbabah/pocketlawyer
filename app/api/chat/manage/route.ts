import { NextResponse } from 'next/server';
import { saveChat, updateChat, deleteChat, getChat, getUserChats } from '../admin';

export async function POST(request: Request) {
  try {
    const chatData = await request.json();
    const chatId = await saveChat(chatData);
    return NextResponse.json({ id: chatId });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: 'Failed to save chat' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { chatId, ...data } = await request.json();
    
    // Check if chat exists first
    const existingChat = await getChat(chatId);
    if (!existingChat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }
    
    await updateChat(chatId, data);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Chat API Error:', error);
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

    if (chatId) {
      const chat = await getChat(chatId);
      if (!chat) {
        return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
      }
      return NextResponse.json(chat);
    } else if (userId) {
      const chats = await getUserChats(userId);
      return NextResponse.json(chats);
    }

    return NextResponse.json({ error: 'Missing chatId or userId' }, { status: 400 });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch chat' }, { status: 500 });
  }
}