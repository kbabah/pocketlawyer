import { useState, useEffect } from 'react';
import type { Message } from 'ai';
import { toast } from 'sonner';

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  timestamp: number;
}

export interface ChatHistory {
  [date: string]: ChatSession[];
}

interface ApiError extends Error {
  status?: number;
  code?: string;
}

const validateMessages = (messages: Message[]): boolean => {
  return Array.isArray(messages) && 
    messages.every(msg => 
      msg && 
      typeof msg.content === 'string' && 
      typeof msg.role === 'string' && 
      ['user', 'assistant'].includes(msg.role)
    );
};

export function useChatHistory(userId: string | undefined) {
  const [chatHistory, setChatHistory] = useState<ChatHistory>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApiError = (error: ApiError, operation: string) => {
    console.error(`Chat history ${operation} error:`, error);
    const message = error.status === 404 ? 'Chat not found' :
                   error.status === 403 ? 'Unauthorized access' :
                   error.message || `Failed to ${operation}`;
    setError(message);
    toast.error(message);
    return null;
  };

  useEffect(() => {
    if (!userId) {
      setChatHistory({});
      return;
    }

    const loadChatHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/chat/manage?userId=${userId}`);
        if (!response.ok) {
          throw Object.assign(new Error('Failed to fetch chat history'), {
            status: response.status
          });
        }
        
        const chats = await response.json();
        if (!Array.isArray(chats)) {
          throw new Error('Invalid chat history format');
        }

        const history: ChatHistory = {};
        chats.forEach((chat: ChatSession & { userId: string }) => {
          if (!chat?.id || !chat?.messages || !chat?.timestamp) {
            console.warn('Skipping invalid chat entry:', chat);
            return;
          }

          const date = new Date(chat.timestamp).toISOString().split('T')[0];
          if (!history[date]) {
            history[date] = [];
          }
          history[date].push({
            id: chat.id,
            title: chat.title || chat.messages[0]?.content?.slice(0, 30) || 'Untitled Chat',
            messages: chat.messages,
            timestamp: chat.timestamp,
          });
        });

        setChatHistory(history);
      } catch (error: any) {
        handleApiError(error, 'loading');
        setChatHistory({});
      } finally {
        setLoading(false);
      }
    };

    loadChatHistory();
  }, [userId]);

  const saveChat = async (messages: Message[]): Promise<string | null> => {
    if (!userId || !validateMessages(messages)) {
      toast.error('Invalid message format');
      return null;
    }

    try {
      const title = messages[0]?.content?.slice(0, 30) + (messages[0]?.content?.length > 30 ? '...' : '') || 'New Chat';
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

      if (!response.ok) {
        throw Object.assign(new Error('Failed to save chat'), {
          status: response.status
        });
      }

      const { id } = await response.json();
      return id;
    } catch (error: any) {
      return handleApiError(error, 'saving');
    }
  };

  const updateChat = async (chatId: string, messages: Message[]): Promise<boolean> => {
    if (!userId || !validateMessages(messages)) {
      toast.error('Invalid message format');
      return false;
    }

    try {
      const title = messages[0]?.content?.slice(0, 30) + (messages[0]?.content?.length > 30 ? '...' : '') || 'Updated Chat';
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

      if (!response.ok) {
        throw Object.assign(new Error('Failed to update chat'), {
          status: response.status
        });
      }

      // Update local state
      const date = new Date().toISOString().split('T')[0];
      const updatedHistory = { ...chatHistory };
      
      // Remove chat from old date
      Object.keys(updatedHistory).forEach((oldDate) => {
        updatedHistory[oldDate] = updatedHistory[oldDate].filter((chat) => chat.id !== chatId);
        if (updatedHistory[oldDate].length === 0) {
          delete updatedHistory[oldDate];
        }
      });

      // Add chat to new date
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
      return true;
    } catch (error: any) {
      handleApiError(error, 'updating');
      return false;
    }
  };

  const deleteChat = async (chatId: string): Promise<boolean> => {
    if (!userId) return false;

    try {
      const response = await fetch('/api/chat/manage', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId }),
      });

      if (!response.ok) {
        throw Object.assign(new Error('Failed to delete chat'), {
          status: response.status
        });
      }
      
      // Update local state
      const newHistory = { ...chatHistory };
      Object.keys(newHistory).forEach((date) => {
        newHistory[date] = newHistory[date].filter((chat) => chat.id !== chatId);
        if (newHistory[date].length === 0) {
          delete newHistory[date];
        }
      });
      setChatHistory(newHistory);
      return true;
    } catch (error: any) {
      handleApiError(error, 'deleting');
      return false;
    }
  };

  return {
    chatHistory,
    loading,
    error,
    saveChat,
    updateChat,
    deleteChat,
  };
}