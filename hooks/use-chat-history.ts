import { useState, useEffect } from 'react';
import type { Message } from 'ai';
import { chatManageFetch } from '@/lib/chat-api-client';

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  timestamp: number;
}

export interface ChatHistory {
  [date: string]: ChatSession[];
}

/**
 * Load and sync chat history for signed-in users only.
 * Pass `undefined` for userId when the user is anonymous or not authenticated.
 */
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
        const response = await chatManageFetch(
          `/api/chat/manage?userId=${encodeURIComponent(userId)}`
        );

        if (response.status === 401) {
          setChatHistory({});
          return;
        }

        if (!response.ok) {
          const errorText = await response.text().catch(() => 'No error details available');
          console.error(`Chat history fetch failed: ${response.status} ${response.statusText}`, errorText);
          throw new Error(`Failed to fetch chat history: ${response.status} ${response.statusText}`);
        }

        const chats = await response.json();
        const history: ChatHistory = {};

        chats.forEach((chat: ChatSession & { userId: string }) => {
          const date = new Date(chat.timestamp).toISOString().split('T')[0];
          if (!history[date]) {
            history[date] = [];
          }
          history[date].push({
            id: chat.id,
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
    if (!userId || messages.length === 0) {
      return null;
    }

    try {
      const title = messages[0].content.slice(0, 30) + (messages[0].content.length > 30 ? '...' : '');
      const chatData = {
        userId,
        title,
        messages,
        timestamp: Date.now(),
      };

      const response = await chatManageFetch('/api/chat/manage', {
        method: 'POST',
        body: JSON.stringify(chatData),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error(`Failed to save chat: ${response.status}`, data);
        throw new Error(`Failed to save chat: ${data.error || response.statusText}`);
      }

      const date = new Date().toISOString().split('T')[0];
      const updatedHistory = { ...chatHistory };

      if (!updatedHistory[date]) {
        updatedHistory[date] = [];
      }

      updatedHistory[date].unshift({
        id: data.id,
        title,
        messages,
        timestamp: Date.now(),
      });

      setChatHistory(updatedHistory);

      return data.id;
    } catch (error) {
      console.error('Error saving chat:', error);
      return null;
    }
  };

  const updateChat = async (chatId: string, messages: Message[]) => {
    if (!userId || messages.length === 0) return;

    try {
      const title = messages[0].content.slice(0, 30) + (messages[0].content.length > 30 ? '...' : '');

      const response = await chatManageFetch('/api/chat/manage', {
        method: 'PUT',
        body: JSON.stringify({
          chatId,
          messages,
          title,
          timestamp: Date.now(),
        }),
      });

      if (!response.ok) throw new Error('Failed to update chat');

      const date = new Date().toISOString().split('T')[0];
      const updatedHistory = { ...chatHistory };

      Object.keys(updatedHistory).forEach((oldDate) => {
        updatedHistory[oldDate] = updatedHistory[oldDate].filter((chat) => chat.id !== chatId);
        if (updatedHistory[oldDate].length === 0) {
          delete updatedHistory[oldDate];
        }
      });

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

  const renameChat = async (chatId: string, newTitle: string) => {
    if (!userId || !newTitle.trim()) return;

    const originalTitle = chatHistory[Object.keys(chatHistory).find(date => chatHistory[date].some(chat => chat.id === chatId)) || '']?.find(chat => chat.id === chatId)?.title;

    const updatedHistory = { ...chatHistory };
    let updated = false;
    Object.keys(updatedHistory).forEach((date) => {
      const chatIndex = updatedHistory[date].findIndex((chat) => chat.id === chatId);
      if (chatIndex !== -1) {
        updatedHistory[date][chatIndex] = { ...updatedHistory[date][chatIndex], title: newTitle.trim() };
        updated = true;
      }
    });
    if (updated) {
      setChatHistory(updatedHistory);
    }

    try {
      const response = await chatManageFetch('/api/chat/manage', {
        method: 'PUT',
        body: JSON.stringify({ chatId, title: newTitle.trim() }),
      });

      if (!response.ok) throw new Error('Failed to rename chat');
    } catch (error) {
      console.error('Error renaming chat:', error);
      if (updated && originalTitle) {
        const revertedHistory = { ...chatHistory };
         Object.keys(revertedHistory).forEach((date) => {
          const chatIndex = revertedHistory[date].findIndex((chat) => chat.id === chatId);
          if (chatIndex !== -1) {
            revertedHistory[date][chatIndex] = { ...revertedHistory[date][chatIndex], title: originalTitle };
          }
        });
        setChatHistory(revertedHistory);
      }
    }
  };

  const deleteChat = async (chatId: string) => {
    if (!userId) return;

    try {
      const response = await chatManageFetch('/api/chat/manage', {
        method: 'DELETE',
        body: JSON.stringify({ chatId }),
      });

      if (!response.ok) throw new Error('Failed to delete chat');

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
    renameChat,
  };
}
