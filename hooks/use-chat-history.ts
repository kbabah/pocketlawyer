import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, addDoc, deleteDoc, getDocs, doc, updateDoc } from 'firebase/firestore';
import type { Message } from 'ai';

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  timestamp: number;
}

export interface ChatHistory {
  [date: string]: ChatSession[];
}

export function useChatHistory(userId: string | undefined) {
  const [chatHistory, setChatHistory] = useState<ChatHistory>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) {
      setChatHistory({});
      return;
    }

    const loadChatHistory = async () => {
      setLoading(true);
      try {
        const chatsRef = collection(db, 'chats');
        const q = query(
          chatsRef,
          where('userId', '==', userId),
          orderBy('timestamp', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const history: ChatHistory = {};

        querySnapshot.forEach((doc) => {
          const chat = doc.data() as ChatSession & { userId: string };
          const date = new Date(chat.timestamp).toISOString().split('T')[0];

          if (!history[date]) {
            history[date] = [];
          }

          history[date].push({
            id: doc.id,
            title: chat.title,
            messages: chat.messages,
            timestamp: chat.timestamp,
          });
        });

        setChatHistory(history);
      } catch (error) {
        console.error('Error loading chat history:', error);
        setChatHistory({});
      } finally {
        setLoading(false);
      }
    };

    loadChatHistory();
  }, [userId]);

  const saveChat = async (messages: Message[]) => {
    if (!userId || messages.length === 0) return null;

    try {
      const title = messages[0].content.slice(0, 30) + (messages[0].content.length > 30 ? '...' : '');
      const chatData = {
        userId,
        title,
        messages,
        timestamp: Date.now(),
      };

      const docRef = await addDoc(collection(db, 'chats'), chatData);
      return docRef.id;
    } catch (error) {
      console.error('Error saving chat:', error);
      return null;
    }
  };

  const updateChat = async (chatId: string, messages: Message[]) => {
    if (!userId || messages.length === 0) return;

    try {
      const chatRef = doc(db, 'chats', chatId);
      const title = messages[0].content.slice(0, 30) + (messages[0].content.length > 30 ? '...' : '');
      
      await updateDoc(chatRef, {
        messages,
        title,
        timestamp: Date.now(),
      });

      // Update local state
      const date = new Date().toISOString().split('T')[0];
      const updatedHistory = { ...chatHistory };
      
      // Remove the chat from its old date if it exists
      Object.keys(updatedHistory).forEach((oldDate) => {
        updatedHistory[oldDate] = updatedHistory[oldDate].filter((chat) => chat.id !== chatId);
        if (updatedHistory[oldDate].length === 0) {
          delete updatedHistory[oldDate];
        }
      });

      // Add the updated chat to today's date
      if (!updatedHistory[date]) {
        updatedHistory[date] = [];
      }

      updatedHistory[date].unshift({
        id: chatId,
        title,
        messages,
        timestamp: Date.now(),
      });

      setChatHistory(updatedHistory);
    } catch (error) {
      console.error('Error updating chat:', error);
    }
  };

  const deleteChat = async (chatId: string) => {
    if (!userId) return;

    try {
      await deleteDoc(doc(db, 'chats', chatId));
      
      // Update local state
      const newHistory = { ...chatHistory };
      Object.keys(newHistory).forEach((date) => {
        newHistory[date] = newHistory[date].filter((chat) => chat.id !== chatId);
        if (newHistory[date].length === 0) {
          delete newHistory[date];
        }
      });
      setChatHistory(newHistory);
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  return {
    chatHistory,
    loading,
    saveChat,
    updateChat,
    deleteChat,
  };
}