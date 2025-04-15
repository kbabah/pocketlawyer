import { useState, useEffect } from 'react';
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
        const response = await fetch(`/api/chat/manage?userId=${userId}`);
        if (!response.ok) throw new Error('Failed to fetch chat history');
        
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
    if (!userId || messages.length === 0) return null;

    try {
      const title = messages[0].content.slice(0, 30) + (messages[0].content.length > 30 ? '...' : '');
      const chatData = {
        userId,
        title,
        messages,
        timestamp: Date.now(),
      };

      const response = await fetch('/api/chat/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(chatData),
      });

      if (!response.ok) throw new Error('Failed to save chat');
      const { id } = await response.json();
      return id;
    } catch (error) {
      console.error('Error saving chat:', error);
      return null;
    }
  };

  const updateChat = async (chatId: string, messages: Message[]) => {
    if (!userId || messages.length === 0) return;

    try {
      const title = messages[0].content.slice(0, 30) + (messages[0].content.length > 30 ? '...' : '');
      
      const response = await fetch('/api/chat/manage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId,
          messages,
          title,
          timestamp: Date.now(),
        }),
      });

      if (!response.ok) throw new Error('Failed to update chat');

      // Update local state
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

  const deleteChat = async (chatId: string) => {
    if (!userId) return;

    try {
      const response = await fetch('/api/chat/manage', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId }),
      });

      if (!response.ok) throw new Error('Failed to delete chat');
      
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