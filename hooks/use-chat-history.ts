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
    if (!userId || messages.length === 0) {
      console.warn("Cannot save chat: missing userId or no messages");
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

      console.log("Attempting to save chat:", { userId, messageCount: messages.length });
      const response = await fetch('/api/chat/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(chatData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error(`Failed to save chat: ${response.status}`, data);
        throw new Error(`Failed to save chat: ${data.error || response.statusText}`);
      }
      
      console.log(`Chat saved successfully with ID: ${data.id}`);
      
      // Update local state with the new chat
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

  const renameChat = async (chatId: string, newTitle: string) => {
    if (!userId || !newTitle.trim()) return;

    const originalTitle = chatHistory[Object.keys(chatHistory).find(date => chatHistory[date].some(chat => chat.id === chatId)) || '']?.find(chat => chat.id === chatId)?.title;

    // Optimistic UI update
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
      const response = await fetch('/api/chat/manage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId, title: newTitle.trim() }),
      });

      if (!response.ok) throw new Error('Failed to rename chat');
      // No need to update state again if successful

    } catch (error) {
      console.error('Error renaming chat:', error);
      // Revert optimistic update on error
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
      // Optionally show an error toast
      // toast.error("Failed to rename chat"); 
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
    renameChat, // Export renameChat
  };
}