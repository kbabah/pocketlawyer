import { adminDb } from '@/lib/firebase-admin';
import type { Message } from 'ai';

export interface ChatData {
  userId: string;
  title: string;
  messages: Message[];
  timestamp: number;
}

export async function saveChat(chatData: ChatData) {
  // Validate required fields
  if (!chatData.userId || !chatData.messages || !Array.isArray(chatData.messages)) {
    throw new Error('Invalid chat data');
  }

  // Set default title if not provided
  if (!chatData.title && chatData.messages.length > 0) {
    chatData.title = chatData.messages[0].content.slice(0, 30) + 
      (chatData.messages[0].content.length > 30 ? '...' : '');
  }

  // Ensure timestamp
  chatData.timestamp = chatData.timestamp || Date.now();

  const docRef = await adminDb.collection('chats').add(chatData);
  return docRef.id;
}

export async function updateChat(chatId: string, data: Partial<ChatData>) {
  // Validate chat ID
  if (!chatId) throw new Error('Chat ID is required');

  // Get existing chat
  const chatRef = adminDb.collection('chats').doc(chatId);
  const chat = await chatRef.get();

  if (!chat.exists) {
    throw new Error('Chat not found');
  }

  // Update timestamp
  const updateData = {
    ...data,
    timestamp: Date.now()
  };

  await chatRef.update(updateData);
}

export async function deleteChat(chatId: string) {
  // Validate chat ID
  if (!chatId) throw new Error('Chat ID is required');

  const chatRef = adminDb.collection('chats').doc(chatId);
  const chat = await chatRef.get();

  if (!chat.exists) {
    throw new Error('Chat not found');
  }

  await chatRef.delete();
}

export async function getChat(chatId: string) {
  // Validate chat ID
  if (!chatId) throw new Error('Chat ID is required');

  const doc = await adminDb.collection('chats').doc(chatId).get();
  if (!doc.exists) return null;

  return {
    id: doc.id,
    ...doc.data()
  } as ChatData & { id: string };
}

export async function getUserChats(userId: string) {
  // Validate user ID
  if (!userId) throw new Error('User ID is required');

  const snapshot = await adminDb
    .collection('chats')
    .where('userId', '==', userId)
    .orderBy('timestamp', 'desc')
    .limit(100) // Limit for performance
    .get();

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as (ChatData & { id: string })[];
}