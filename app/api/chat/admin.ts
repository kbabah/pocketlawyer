import { adminDb } from '@/lib/firebase-admin';
import type { Message } from 'ai';

export interface ChatData {
  userId: string;
  title: string;
  messages: Message[];
  timestamp: number;
}

export async function saveChat(chatData: ChatData) {
  const docRef = await adminDb.collection('chats').add(chatData);
  return docRef.id;
}

export async function updateChat(chatId: string, data: Partial<ChatData>) {
  await adminDb.collection('chats').doc(chatId).update(data);
}

// Add the missing updateChatTitle function
export async function updateChatTitle(chatId: string, title: string) {
  await adminDb.collection('chats').doc(chatId).update({ title });
}

export async function deleteChat(chatId: string) {
  await adminDb.collection('chats').doc(chatId).delete();
}

export async function getChat(chatId: string) {
  const doc = await adminDb.collection('chats').doc(chatId).get();
  return doc.exists ? { id: doc.id, ...doc.data() } as ChatData & { id: string } : null;
}

export async function getUserChats(userId: string) {
  const snapshot = await adminDb
    .collection('chats')
    .where('userId', '==', userId)
    .orderBy('timestamp', 'desc')
    .get();

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as (ChatData & { id: string })[];
}