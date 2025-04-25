"use client"

import { useState, useEffect } from "react"
import { useChat } from "@ai-sdk/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar } from "@/components/ui/avatar"
import { User, Search, Sparkles, Scale, FileText, Send, Loader2 } from "lucide-react"
import WebBrowser from "@/components/web-browser"
import DocumentAnalysis from "@/components/document-analysis"
import { Card } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useLanguage } from "@/contexts/language-context"
import { useChatHistory } from "@/hooks/use-chat-history"
import { useIsMobile } from "@/hooks/use-mobile" // Add mobile detection
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import type { Message } from 'ai'
import { Skeleton } from "@/components/ui/skeleton"

export default function ChatInterface() {
  const [activeTab, setActiveTab] = useState<string>("chat")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const { user } = useAuth()
  const { t, language } = useLanguage()
  const params = useParams()
  const chatId = params?.id as string | undefined
  const [initialLoadComplete, setInitialLoadComplete] = useState(false)
  const router = useRouter()
  const isMobile = useIsMobile() // Use mobile detection

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading || isMessageLimitReached) return

    try {
      await originalHandleSubmit(e)
    } catch (error) {
      console.error('Chat error:', error)
      toast.error(t("chat.error.sending"))
    }
  }

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
        console.error('Error loading chat:', error)
        toast.error(t("chat.error.loading"))
        router.push("/")
      } finally {
        setInitialLoadComplete(true)
      }
    }

    loadExistingChat()
  }, [chatId, user?.id, initialLoadComplete, setMessages, router, t])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messages.length) {
      const scrollContainer = document.querySelector('.ScrollAreaViewport')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages])

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
        console.error("Failed to save document analysis:", error)
        toast.error(t("chat.error.saving") || "Failed to save chat")
      }
    }

    setActiveTab("chat")
  }

  // Check if message limit is reached for non-authenticated users
  const isMessageLimitReached = !user && messages.length >= messageLimit

  return (
    <div className="flex flex-col min-h-full">
      <TooltipProvider>
        <Tabs defaultValue="chat" className="flex flex-col flex-1">
          <div className="sticky top-0 z-10 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="px-2 sm:px-4 py-2 border-b border-primary/10 w-full flex justify-center">
              <div className="w-full max-w-xl">
                <TabsList className="grid w-full grid-cols-3 bg-primary/5">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <TabsTrigger value="chat" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                        <Scale className="mr-2 h-4 w-4" />
                        {t("chat.tab.chat")}
                      </TabsTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t("chat.tooltip.chat") || "Start a conversation with the AI assistant"}</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <TabsTrigger value="web" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                        <Search className="mr-2 h-4 w-4" />
                        {t("chat.tab.web")}
                      </TabsTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t("chat.tooltip.web") || "Search the web for information"}</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <TabsTrigger value="document" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                        <FileText className="mr-2 h-4 w-4" />
                        {t("chat.tab.document")}
                      </TabsTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t("chat.tooltip.document") || "Analyze uploaded documents"}</p>
                    </TooltipContent>
                  </Tooltip>
                </TabsList>
              </div>
            </div>
          </div>

          <TabsContent value="chat" className="flex-1 flex flex-col px-2 sm:px-4 md:px-0">
            <div className="mx-auto w-full max-w-xl flex-1 flex flex-col">
              <ScrollArea className="flex-1 pr-2 sm:pr-4">
                {/* Use role="log" for chat history container */}
                <div role="log" className="py-4 space-y-4 sm:space-y-6">
                  {messages.length === 0 && !isLoading ? ( // Ensure not loading when showing empty state
                    <div className="flex flex-col items-center justify-center h-full text-center px-4 pt-10">
                      <Scale size={48} className="mb-4 text-primary opacity-80" />
                      <h2 className="text-2xl font-semibold mb-2">{t("chat.welcome.title") || "Welcome to Pocket Lawyer"}</h2>
                      <p className="text-muted-foreground mb-6 max-w-md">
                        {t("chat.welcome.subtitle") || "Ask legal questions, analyze documents, or search the web. How can I assist you today?"}
                      </p>
                      <Card className="p-4 w-full border-primary/10 bg-background shadow-sm dark:shadow-md dark:border-primary/5">
                        <p className="font-medium mb-3 text-left text-sm">{t("chat.try.asking") || "Try asking something like:"}</p>
                        <ul className="space-y-2 text-sm text-left text-muted-foreground">
                          <li className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-primary flex-shrink-0" />
                            <span>{t("chat.example1") || "Explain the concept of 'force majeure' in contracts."}</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-primary flex-shrink-0" />
                            <span>{t("chat.example2") || "What are the requirements for forming an LLC?"}</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-primary flex-shrink-0" />
                            <span>{t("chat.example3") || "Summarize the main points of GDPR."}</span>
                          </li>
                        </ul>
                      </Card>

                      {!user && (
                        <div className="mt-6 p-3 border border-amber-200 dark:border-amber-800 rounded-lg bg-amber-50 dark:bg-amber-950/30 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                          <Sparkles className="h-5 w-5" />
                          <p className="text-sm">
                            <span className="font-medium">{t("auth.signin")}</span> {t("chat.signin.prompt") || "to save your chat history and get more features."}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div key={message.id} className="flex items-center justify-center">
                        <div 
                          className={`flex items-start gap-2 sm:gap-3 max-w-xl w-full ${message.role === "user" ? "flex-row-reverse" : ""}`}
                          // Add aria-label to distinguish messages
                          aria-label={message.role === 'user' ? t('chat.aria.user_message') || 'User message' : t('chat.aria.assistant_message') || 'Assistant message'}
                        >
                          <Avatar className={isMobile ? "h-7 w-7" : "h-9 w-9"}>
                            {message.role === "user" ? <User className="p-2" /> : <Scale className="p-2" />}
                          </Avatar>
                          <div 
                            className={`rounded-lg px-3 py-2 sm:px-4 sm:py-2 max-w-[75%] sm:max-w-[85%] ${
                              message.role === "user" 
                                ? "bg-primary text-primary-foreground dark:shadow-md" 
                                : "bg-secondary/30 dark:bg-secondary/20 dark:border dark:border-slate-700"
                            }`}
                          >
                            <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  {/* Add a skeleton loader for initial chat loading */}
                  {isLoading && messages.length === 0 && (
                    <div className="space-y-4 pt-4">
                      <div className="flex items-start gap-3 max-w-xl w-full">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                        </div>
                      </div>
                      <div className="flex items-start gap-3 max-w-xl w-full flex-row-reverse">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2 flex-1 items-end flex flex-col">
                          <Skeleton className="h-4 w-3/4" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              <div className="py-2 sm:py-4 flex flex-col gap-2">
                <form onSubmit={handleSubmit} className="flex items-center gap-2">
                  <Input
                    placeholder={isMobile ? "Ask something..." : t("chat.input.placeholder")}
                    value={input}
                    onChange={handleInputChange}
                    disabled={isLoading || isMessageLimitReached}
                    className="flex-1 dark:bg-slate-900 dark:border-slate-700"
                  />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button type="submit" disabled={isLoading || isMessageLimitReached} size={isMobile ? "sm" : "default"}>
                        {isLoading ? 
                          (isMobile ? <Loader2 className="h-4 w-4 animate-spin" /> : t("chat.sending")) : 
                          (isMobile ? <Send className="h-4 w-4" /> : t("chat.send"))}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {isMessageLimitReached ? (
                        <p>{t("chat.limit.reached")}</p>
                      ) : (
                        <p>{t("chat.tooltip.send") || "Send your message"}</p>
                      )}
                    </TooltipContent>
                  </Tooltip>
                </form>
                {!user && messages.length > 0 && (
                  <div className="text-xs text-center text-muted-foreground dark:text-slate-400">
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
      </TooltipProvider>
    </div>
  )
}
