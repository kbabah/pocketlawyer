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
import { useParams } from "next/navigation"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Message } from 'ai'

export default function ChatInterface() {
  const [activeTab, setActiveTab] = useState<string>("chat")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const { user } = useAuth()
  const { t, language } = useLanguage()
  const params = useParams()
  const chatId = params?.id as string | undefined
  const [initialLoadComplete, setInitialLoadComplete] = useState(false)

  // Set a higher message limit for authenticated users
  const messageLimit = user ? 50 : 10

  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages } = useChat({
    api: "/api/chat",
    initialMessages: [],
    id: chatId || user?.id,
    body: {
      userId: user?.id,
    },
    onFinish: async (message) => {
      const updatedMessages = [...messages, message];
      if (user?.id) {
        if (chatId) {
          // Update existing chat
          await updateChat(chatId, updatedMessages);
        } else {
          // Create new chat
          await saveChat(updatedMessages);
        }
      }
    },
  });

  const { saveChat, updateChat } = useChatHistory(user?.id);

  // Load existing chat if chatId is provided
  useEffect(() => {
    const loadExistingChat = async () => {
      if (!chatId || !user?.id || initialLoadComplete) return;

      try {
        const chatRef = doc(db, 'chats', chatId);
        const chatSnap = await getDoc(chatRef);

        if (chatSnap.exists() && chatSnap.data().userId === user.id) {
          setMessages(chatSnap.data().messages as Message[]);
        }
      } catch (error) {
        console.error('Error loading chat:', error);
      } finally {
        setInitialLoadComplete(true);
      }
    };

    loadExistingChat();
  }, [chatId, user?.id, initialLoadComplete, setMessages]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messages.length) {
      const scrollContainer = document.querySelector('.ScrollAreaViewport');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setActiveTab("web")
  }

  const handleDocumentAnalysis = async (question: string, answer: string) => {
    // Add the document question and AI response to the chat
    const newMessages: Message[] = [
      ...messages,
      { id: Date.now().toString(), role: "user", content: `Document Question: ${question}` } as Message,
      { id: (Date.now() + 1).toString(), role: "assistant", content: answer } as Message
    ];
    setMessages(newMessages);

    // Save chat if user is authenticated and this is not an existing chat
    if (user?.id && !chatId) {
      await saveChat(newMessages);
    }

    // Switch to chat tab to show the results
    setActiveTab("chat")
  }

  // Check if message limit is reached for non-authenticated users
  const isMessageLimitReached = !user && messages.length >= messageLimit

  return (
    <div className="flex flex-col h-screen transition-all duration-300 ease-in-out md:pl-[16rem]">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full flex flex-col items-center transition-all duration-300 ease-in-out"
      >
        <div className="px-4 py-2 border-b border-primary/10 w-full flex justify-center">
          <div className="w-full max-w-xl">
            <TabsList className="grid w-full grid-cols-3 bg-primary/5 hover:bg-primary/5">
              <TabsTrigger
                value="chat"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Scale className="mr-2 h-4 w-4" />
                {t("chat.tab.chat")}
              </TabsTrigger>
              <TabsTrigger
                value="web"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Search className="mr-2 h-4 w-4" />
                {t("chat.tab.web")}
              </TabsTrigger>
              <TabsTrigger
                value="document"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <FileText className="mr-2 h-4 w-4" />
                {t("chat.tab.document")}
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <TabsContent value="chat" className="flex-1 flex flex-col items-center w-full relative z-10">
          <ScrollArea className="flex-1 p-4 w-full max-w-xl relative max-h-[calc(100vh-12rem)]">
            <div className="max-w-2xl mx-auto">
              <div className="bg-secondary/30 p-4 rounded-t-lg">
                <p className="text-sm text-muted-foreground">
                  {language === "fr" 
                    ? "Cet assistant juridique est spécialisé uniquement dans le droit camerounais. Pour toute autre question juridique, veuillez consulter un professionnel du droit qualifié."
                    : "This legal assistant specializes exclusively in Cameroonian law. For any other legal matters, please consult a qualified legal professional."}
                </p>
              </div>
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
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
                <div className="space-y-6">
                  {messages.map((message) => (
                    <div key={message.id} className="flex items-center justify-center">
                      <div
                        className={`flex items-start gap-3 max-w-xl w-full ${
                          message.role === "user" ? "flex-row-reverse" : ""
                        }`}
                      >
                        <Avatar>
                          {message.role === "user" ? (
                            <User className="p-2" />
                          ) : (
                            <Scale className="p-2" />
                          )}
                        </Avatar>
                        <div
                          className={`rounded-lg px-4 py-2 max-w-[85%] ${
                            message.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary/30"
                          }`}
                        >
                          <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="w-full max-w-xl p-4 flex flex-col gap-2">
            <form
              onSubmit={handleSubmit}
              className="flex items-center gap-2"
            >
              <Input
                placeholder={t("chat.input.placeholder")}
                value={input}
                onChange={handleInputChange}
                disabled={isLoading || isMessageLimitReached}
              />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button type="submit" disabled={isLoading || isMessageLimitReached}>
                      {isLoading ? t("chat.sending") : t("chat.send")}
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
        </TabsContent>

        <TabsContent value="web" className="flex-1 w-full">
          <WebBrowser query={searchQuery} />
        </TabsContent>

        <TabsContent value="document" className="flex-1 w-full">
          <DocumentAnalysis onAnalysisComplete={handleDocumentAnalysis} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
