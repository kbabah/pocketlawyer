import { adminDb } from '@/lib/firebase-admin';
import type { Message } from 'ai';

export interface ChatData {
  userId: string;
  title: string;
  messages: Message[];
  timestamp: number;
  lastUpdated?: number;
  messageCount?: number;
  summary?: string;
  tags?: string[];
  category?: string;
  language?: string;
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

  // Enhance chat metadata
  const enhancedChatData = {
    ...chatData,
    timestamp: Date.now(),
    lastUpdated: Date.now(),
    messageCount: chatData.messages.length,
    summary: generateSummary(chatData.messages),
    tags: extractTags(chatData.messages),
    category: determineCategory(chatData.messages)
  };

  const docRef = await adminDb.collection('chats').add(enhancedChatData);
  
  // Create search index document
  await adminDb.collection('chatSearchIndex').doc(docRef.id).set({
    userId: chatData.userId,
    title: enhancedChatData.title,
    summary: enhancedChatData.summary,
    tags: enhancedChatData.tags,
    category: enhancedChatData.category,
    messageCount: enhancedChatData.messageCount,
    timestamp: enhancedChatData.timestamp,
    lastUpdated: enhancedChatData.lastUpdated
  });

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

  // Update metadata
  const updateData = {
    ...data,
    lastUpdated: Date.now(),
    messageCount: data.messages?.length || chat.data()?.messageCount,
  };

  if (data.messages) {
    updateData.summary = generateSummary(data.messages);
    updateData.tags = extractTags(data.messages);
    updateData.category = determineCategory(data.messages);
  }

  await chatRef.update(updateData);

  // Update search index
  await adminDb.collection('chatSearchIndex').doc(chatId).update({
    title: data.title || chat.data()?.title,
    summary: updateData.summary,
    tags: updateData.tags,
    category: updateData.category,
    messageCount: updateData.messageCount,
    lastUpdated: updateData.lastUpdated
  });
}

export async function deleteChat(chatId: string) {
  // Validate chat ID
  if (!chatId) throw new Error('Chat ID is required');

  const chatRef = adminDb.collection('chats').doc(chatId);
  const chat = await chatRef.get();

  if (!chat.exists) {
    throw new Error('Chat not found');
  }

  // Delete both chat and its search index
  await Promise.all([
    chatRef.delete(),
    adminDb.collection('chatSearchIndex').doc(chatId).delete()
  ]);
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

  try {
    // Try the optimized query first (with index)
    const snapshot = await adminDb
      .collection('chatSearchIndex')
      .where('userId', '==', userId)
      .orderBy('lastUpdated', 'desc')
      .limit(100)
      .get();

    // If no chats found, return empty array
    if (snapshot.empty) {
      return [];
    }

    // Get full chat data for chats that need it
    const chatIds = snapshot.docs.map(doc => doc.id);
    
    if (chatIds.length === 0) {
      return [];
    }

    // Split into chunks of 10 to avoid potential Firestore limitations
    const chunkSize = 10;
    const chatIdsChunks = [];
    for (let i = 0; i < chatIds.length; i += chunkSize) {
      chatIdsChunks.push(chatIds.slice(i, i + chunkSize));
    }

    // Query each chunk and combine results
    const chatsPromises = chatIdsChunks.map(chunk =>
      adminDb
        .collection('chats')
        .where('__name__', 'in', chunk)
        .get()
    );

    const chatsSnapshots = await Promise.all(chatsPromises);
    
    // Combine all results and sort by lastUpdated
    const allChats = chatsSnapshots.flatMap(snapshot => 
      snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ChatData & { id: string }))
    ).sort((a, b) => ((b as ChatData).lastUpdated || (b as ChatData).timestamp) - 
                     ((a as ChatData).lastUpdated || (a as ChatData).timestamp));

    return allChats;
  } catch (error: any) {
    // If the error is about missing index
    if (error.code === 9 || (error.details && error.details.includes('index'))) {
      console.warn('Index not ready, falling back to simple query');
      
      // Fallback to simple query without ordering
      const simpleSnapshot = await adminDb
        .collection('chatSearchIndex')
        .where('userId', '==', userId)
        .limit(100)
        .get();

      if (simpleSnapshot.empty) {
        return [];
      }

      const chatIds = simpleSnapshot.docs.map(doc => doc.id);
      const chatsSnapshot = await adminDb
        .collection('chats')
        .where('__name__', 'in', chatIds)
        .get();

      // Sort in memory instead
      const chats = chatsSnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        } as ChatData & { id: string }))
        .sort((a, b) => (b.lastUpdated || b.timestamp) - (a.lastUpdated || a.timestamp));

      return chats;
    }
    
    // If it's any other error, throw it
    throw error;
  }
}

// Helper functions
function generateSummary(messages: Message[]): string {
  // Get the first user message or return empty string if none exists
  const firstUserMessage = messages.find(m => m.role === 'user');
  return firstUserMessage ? firstUserMessage.content.slice(0, 100) : '';
}

function extractTags(messages: Message[]): string[] {
  const tags = new Set<string>();
  
  // Extract potential tags from user messages
  messages.forEach(msg => {
    if (msg.role === 'user') {
      // Extract words that might be meaningful tags
      const words = msg.content.toLowerCase()
        .split(/\s+/)
        .filter(word => word.length > 3) // Filter out short words
        .slice(0, 5); // Take first 5 potential tags
      
      words.forEach(word => tags.add(word));
    }
  });

  return Array.from(tags).slice(0, 10); // Limit to 10 tags
}

function determineCategory(messages: Message[]): string {
  // Simple category determination based on first user message
  const firstUserMessage = messages.find(m => m.role === 'user')?.content.toLowerCase() || '';
  
  if (firstUserMessage.includes('legal') || firstUserMessage.includes('law')) return 'legal';
  if (firstUserMessage.includes('document') || firstUserMessage.includes('contract')) return 'documents';
  if (firstUserMessage.includes('consult') || firstUserMessage.includes('advice')) return 'consultation';
  
  return 'general';
}