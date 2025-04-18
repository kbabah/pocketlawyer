"use client"

import { useState, useEffect } from "react"
import { useChat } from "@ai-sdk/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar } from "@/components/ui/avatar"
import { User, Search, Sparkles, Scale, FileText } from "lucide-react"
import WebBrowser from "@/components/web-browser"
import DocumentAnalysis from "@/components/document-analysis"
import { Card } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useLanguage } from "@/contexts/language-context"
import { useChatHistory } from "@/hooks/use-chat-history"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import type { Message } from 'ai'

export default function ChatInterface() {
  const [activeTab, setActiveTab] = useState<string>("chat")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const { user } = useAuth()
  const { t, language } = useLanguage()
  const params = useParams()
  const chatId = params?.id as string | undefined
  const [initialLoadComplete, setInitialLoadComplete] = useState(false)
  const router = useRouter()

  // Set a higher message limit for authenticated users
  const messageLimit = user ? 50 : 10

  const { messages, input, handleInputChange, handleSubmit: originalHandleSubmit, isLoading, setMessages } = useChat({
    api: "/api/chat",
    initialMessages: [],
    id: chatId,
    body: {
      userId: user?.id,
      language
    }
  })

  const { saveChat, updateChat } = useChatHistory(user?.id)

  const [pendingMessages, setPendingMessages] = useState<Message[]>([]);
  const [loadingStates, setLoadingStates] = useState({
    saving: false,
    sending: false,
    loading: false
  });

  const [networkStatus, setNetworkStatus] = useState({
    isOnline: true,
    isRetrying: false,
    retryCount: 0
  });

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => setNetworkStatus(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setNetworkStatus(prev => ({ ...prev, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Retry logic for failed operations
  const retryOperation = async (operation: () => Promise<any>, maxRetries = 3) => {
    setNetworkStatus(prev => ({ ...prev, isRetrying: true }));
    
    try {
      return await operation();
    } catch (error) {
      if (networkStatus.retryCount < maxRetries) {
        setNetworkStatus(prev => ({ ...prev, retryCount: prev.retryCount + 1 }));
        await new Promise(resolve => setTimeout(resolve, 1000 * (networkStatus.retryCount + 1)));
        return retryOperation(operation, maxRetries);
      }
      throw error;
    } finally {
      setNetworkStatus(prev => ({ ...prev, isRetrying: false, retryCount: 0 }));
    }
  };

  // Show all messages including pending ones
  const allMessages = [...messages, ...pendingMessages];

  // Enhance scroll behavior
  const scrollToBottom = (smooth = true) => {
    const scrollContainer = document.querySelector('.ScrollAreaViewport');
    if (scrollContainer) {
      scrollContainer.scrollTo({
        top: scrollContainer.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto'
      });
    }
  };

  // Auto-scroll when messages change
  useEffect(() => {
    if (allMessages.length) {
      scrollToBottom();
    }
  }, [allMessages]);

  // Enhanced error handling
  const handleError = (error: any, operation: string) => {
    console.error(`${operation} error:`, error);
    const errorMessage = error?.message || t(`chat.error.${operation}`);
    toast.error(errorMessage);
  };

  // Enhanced message submission with retry
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loadingStates.sending || isMessageLimitReached) return;

    if (!networkStatus.isOnline) {
      toast.error(t("chat.error.offline"));
      return;
    }

    setLoadingStates(prev => ({ ...prev, sending: true }));
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim()
    };

    try {
      setPendingMessages(prev => [...prev, userMessage]);
      // Wrap the void return in a Promise
      await retryOperation(() => new Promise<void>((resolve) => {
        originalHandleSubmit(e);
        resolve();
      }));
      scrollToBottom();
    } catch (error) {
      handleError(error, 'sending');
      setPendingMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
    } finally {
      setLoadingStates(prev => ({ ...prev, sending: false }));
    }
  };

  // Enhanced batch save with retry
  const batchSaveMessages = async (messagesToSave: Message[]) => {
    if (!user?.id || loadingStates.saving) return;
    
    if (!networkStatus.isOnline) {
      // Store messages locally if offline
      localStorage.setItem('pendingMessages', JSON.stringify(messagesToSave));
      return;
    }
    
    setLoadingStates(prev => ({ ...prev, saving: true }));
    try {
      await retryOperation(async () => {
        if (chatId) {
          await updateChat(chatId, messagesToSave);
        } else {
          const newChatId = await saveChat(messagesToSave);
          if (newChatId) {
            router.replace(`/?chatId=${newChatId}`, { scroll: false });
            toast.success(t("chat.saved"));
          }
        }
        setPendingMessages([]);
        localStorage.removeItem('pendingMessages');
      });
    } catch (error) {
      handleError(error, 'saving');
      // Keep messages in local storage to retry later
      localStorage.setItem('pendingMessages', JSON.stringify(messagesToSave));
    } finally {
      setLoadingStates(prev => ({ ...prev, saving: false }));
    }
  };

  // Debounced save
  useEffect(() => {
    if (pendingMessages.length === 0) return;
    
    const timer = setTimeout(() => {
      batchSaveMessages([...messages, ...pendingMessages]);
    }, 2000); // 2 second debounce

    return () => clearTimeout(timer);
  }, [pendingMessages]);

  // Try to sync pending messages when coming back online
  useEffect(() => {
    if (networkStatus.isOnline) {
      const pendingMessages = localStorage.getItem('pendingMessages');
      if (pendingMessages) {
        try {
          const messages = JSON.parse(pendingMessages);
          batchSaveMessages(messages);
        } catch (error) {
          console.error('Error syncing pending messages:', error);
        }
      }
    }
  }, [networkStatus.isOnline]);

  // Load existing chat if chatId is provided
  useEffect(() => {
    const loadExistingChat = async () => {
      if (!chatId || !user?.id || initialLoadComplete) return

      try {
        const response = await fetch(`/api/chat/manage?chatId=${chatId}`)
        if (response.status === 404) {
          toast.error(t("chat.not.found"))
          router.push("/")
          return
        }
        if (!response.ok) throw new Error('Failed to fetch chat')
        
        const chat = await response.json()
        if (chat.userId === user.id) {
          setMessages(chat.messages)
        } else {
          toast.error(t("chat.unauthorized"))
          router.push("/")
        }
      } catch (error) {
        handleError(error, 'loading');
        router.push("/")
      } finally {
        setInitialLoadComplete(true)
      }
    }

    loadExistingChat()
  }, [chatId, user?.id, initialLoadComplete, setMessages, router, t])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setActiveTab("web")
  }

  const handleDocumentAnalysis = async (question: string, answer: string) => {
    const newMessages: Message[] = [
      ...messages,
      { id: Date.now().toString(), role: "user", content: `Document Question: ${question}` } as Message,
      { id: (Date.now() + 1).toString(), role: "assistant", content: answer } as Message
    ]
    setMessages(newMessages)

    // Save chat if user is authenticated
    if (user?.id) {
      try {
        if (chatId) {
          await updateChat(chatId, newMessages)
          // No navigation needed, we're updating the current chat
        } else {
          // Save as a new chat but stay on current page
          const newChatId = await saveChat(newMessages)
          if (newChatId) {
            // Use router.replace instead of window.history for better integration with Next.js
            router.replace(`/?chatId=${newChatId}`, { scroll: false })
            toast.success(t("chat.saved") || "Chat saved successfully")
          }
        }
      } catch (error) {
        handleError(error, 'saving');
      }
    }

    setActiveTab("chat")
  }

  // Check if message limit is reached for non-authenticated users
  const isMessageLimitReached = !user && messages.length >= messageLimit

  return (
    <div className="flex flex-col min-h-full">
      {!networkStatus.isOnline && (
        <div className="bg-yellow-500/10 border-b border-yellow-500/20 px-4 py-2 text-sm text-center">
          {t("chat.offline.warning")}
        </div>
      )}
      {networkStatus.isRetrying && (
        <div className="bg-blue-500/10 border-b border-blue-500/20 px-4 py-2 text-sm text-center">
          {t("chat.retrying")} ({networkStatus.retryCount})
        </div>
      )}
      <Tabs defaultValue="chat" className="flex flex-col flex-1">
        <div className="sticky top-0 z-10 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="px-4 py-2 border-b border-primary/10 w-full flex justify-center">
            <div className="w-full max-w-xl">
              <TabsList className="grid w-full grid-cols-3 bg-primary/5">
                <TabsTrigger value="chat" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Scale className="mr-2 h-4 w-4" />
                  {t("chat.tab.chat")}
                </TabsTrigger>
                <TabsTrigger value="web" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Search className="mr-2 h-4 w-4" />
                  {t("chat.tab.web")}
                </TabsTrigger>
                <TabsTrigger value="document" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <FileText className="mr-2 h-4 w-4" />
                  {t("chat.tab.document")}
                </TabsTrigger>
              </TabsList>
            </div>
          </div>
        </div>

        <TabsContent value="chat" className="flex-1 flex flex-col px-4 md:px-0">
          <div className="mx-auto w-full max-w-xl flex-1 flex flex-col">
            <ScrollArea className="flex-1 pr-4">
              <div className="py-4 space-y-6">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center max-w-xl text-center px-4">
                    <Scale size={48} className="mb-4 text-primary" />
                    <h2 className="text-2xl font-bold mb-2">{t("chat.welcome.title")}</h2>
                    <p className="text-muted-foreground mb-4">{t("chat.welcome.subtitle")}</p>
                    <Card className="p-4 w-full border-primary/20">
                      <p className="font-medium mb-2">{t("chat.try.asking")}:</p>
                      <ul className="space-y-2 text-sm">
                        <li>{t("chat.example1")}</li>
                        <li>{t("chat.example2")}</li>
                        <li>{t("chat.example3")}</li>
                      </ul>
                    </Card>

                    {!user && (
                      <div className="mt-6 p-3 border border-primary/20 rounded-lg bg-primary/5 flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        <p className="text-sm">
                          <span className="font-medium">{t("auth.signin")}</span> {t("chat.signin.prompt")}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  allMessages.map((message) => (
                    <div key={message.id} className="flex items-center justify-center">
                      <div className={`flex items-start gap-3 max-w-xl w-full ${message.role === "user" ? "flex-row-reverse" : ""}`}>
                        <Avatar>
                          {message.role === "user" ? <User className="p-2" /> : <Scale className="p-2" />}
                        </Avatar>
                        <div className={`rounded-lg px-4 py-2 max-w-[85%] ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary/30"}`}>
                          <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>

            <div className="py-4 flex flex-col gap-2">
              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <Input
                  placeholder={t("chat.input.placeholder")}
                  value={input}
                  onChange={handleInputChange}
                  disabled={loadingStates.sending || isMessageLimitReached}
                  className="flex-1"
                />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button type="submit" disabled={loadingStates.sending || isMessageLimitReached}>
                        {loadingStates.sending ? t("chat.sending") : t("chat.send")}
                      </Button>
                    </TooltipTrigger>
                    {isMessageLimitReached && (
                      <TooltipContent>
                        <p>{t("chat.limit.reached")}</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              </form>
              {!user && messages.length > 0 && (
                <div className="text-xs text-center text-muted-foreground">
                  {t("chat.remaining.messages").replace("{remaining}", String(Math.max(0, messageLimit - messages.length)))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="web" className="flex-1">
          <WebBrowser query={searchQuery} />
        </TabsContent>

        <TabsContent value="document" className="flex-1">
          <DocumentAnalysis onAnalysisComplete={handleDocumentAnalysis} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
