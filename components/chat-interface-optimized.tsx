"use client"

import { useState, useEffect, useRef } from "react"
import { useChat } from "@ai-sdk/react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Search, Send, Loader2, ArrowDown, Paperclip } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { TooltipProvider } from "@/components/ui/tooltip"
import { useLanguage } from "@/contexts/language-context"
import { useChatHistory } from "@/hooks/use-chat-history"
import { useIsMobile } from "@/hooks/use-mobile"
import { useSearchParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import type { Message } from "ai"
import { ChatErrorBoundary } from "@/components/error-boundaries"
import { useChatFeedback } from "@/hooks/use-chat-feedback"
import { useMessageSearch } from "@/hooks/use-message-search"
import { ChatMessage } from "@/components/chat/chat-message"
import { MessageSearchPanel } from "@/components/chat/message-search-panel"
import { TrialLimitAlert, TrialInfo } from "@/components/chat/trial-gating"
import { TypingIndicator } from "@/components/chat/typing-indicator"
import { WelcomeTutorial } from "@/components/chat/welcome-tutorial"

export default function ChatInterface() {
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const { user, incrementTrialConversations, isTrialLimitReached, getTrialConversationsRemaining } = useAuth()
  const { t, language } = useLanguage()
  const searchParams = useSearchParams()
  const chatId = searchParams.get('chatId') || undefined
  const [initialLoadComplete, setInitialLoadComplete] = useState(false)
  const router = useRouter()
  const isMobile = useIsMobile()

  const [hasStartedConversation, setHasStartedConversation] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [announcement, setAnnouncement] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [showMessageSearch, setShowMessageSearch] = useState(false)
  const messageSearchInputRef = useRef<HTMLInputElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const [showWelcomeTutorial, setShowWelcomeTutorial] = useState(true)
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false)
  const [tutorialStep, setTutorialStep] = useState(0)
  const [isTyping, setIsTyping] = useState(false)
  const [scrollToBottomVisible, setScrollToBottomVisible] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Initialize chat feedback hook
  const { loadExistingFeedback } = useChatFeedback()

  const { messages, input, handleInputChange, handleSubmit: originalHandleSubmit, isLoading, setMessages } = useChat({
    api: "/api/chat",
    initialMessages: [],
    id: chatId,
    body: {
      userId: user?.id,
      language
    },
    onResponse: () => {
      // Show typing indicator when response starts
      setIsTyping(true)
    },
    onFinish: () => {
      // Hide typing indicator when response is complete
      setIsTyping(false)
    }
  })

  const {
    messageSearchQuery,
    setMessageSearchQuery,
    searchResults,
    currentSearchResultIndex,
    highlightTerms,
    focusedMessageIndex,
    handleMessageSearch,
    navigateSearchResults,
  } = useMessageSearch(messages)

  const { saveChat, updateChat } = useChatHistory(user?.id)

  // Ref to track the chatId of the conversation currently being edited, which may
  // differ from the URL param before the first save creates a Firestore document.
  const currentChatIdRef = useRef<string | undefined>(chatId)
  // Sync whenever the URL chatId changes (e.g. user navigates to an existing chat)
  useEffect(() => {
    currentChatIdRef.current = chatId
  }, [chatId])

  // Track previous isLoading to detect the moment the AI finishes responding
  const prevIsLoadingRef = useRef(false)

  // Persist chat after every AI response
  useEffect(() => {
    const wasLoading = prevIsLoadingRef.current
    prevIsLoadingRef.current = isLoading

    // Only act on the falling edge (loading just finished) with real content
    if (!wasLoading || isLoading) return
    // Only save for authenticated, non-anonymous users
    if (!user?.id || user?.isAnonymous) return
    // Need at least one user message + one assistant message
    if (messages.length < 2) return

    const persist = async () => {
      try {
        if (currentChatIdRef.current) {
          await updateChat(currentChatIdRef.current, messages)
        } else {
          const newId = await saveChat(messages)
          if (newId) {
            currentChatIdRef.current = newId
            router.replace(`/chat?chatId=${newId}`, { scroll: false })
          }
        }
      } catch (err) {
        console.error('Failed to persist chat:', err)
      }
    }
    persist()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading])

  // Group messages by sender for better visual presentation
  const groupedMessages = messages.reduce((groups: Message[][], message, index) => {
    const prevMessage = messages[index - 1]
    
    // Start a new group if:
    // 1. This is the first message
    // 2. The sender changed from the previous message
    // 3. More than 2 minutes passed since the last message (simulated)
    if (
      index === 0 || 
      prevMessage.role !== message.role
    ) {
      groups.push([message])
    } else {
      // Add to the last group
      groups[groups.length - 1].push(message)
    }
    
    return groups
  }, [])

  // ...VirtualizedMessageList removed (unused)

  // Add comprehensive error handling
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    
    if (!input.trim() || isLoading) return
    
    // Check guest message limit on every submission
    if (user?.isAnonymous) {
      if (isTrialLimitReached()) {
        toast.error(t("Free message limit reached. Create a free account to continue."))
        return
      }
      incrementTrialConversations()
      setHasStartedConversation(true)
    }
    
    try {
      setIsSubmitting(true)
      setError(null)
      
      // Clear the input right away for better UX
      handleInputChange({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>)
      
      // Submit the message using the original handler
      // This will automatically add the user message to the messages array
      originalHandleSubmit(e)
      
      // Scroll to bottom after user message is added
      setTimeout(() => {
        const scrollContainer = document.querySelector('.chat-messages-container')
        if (scrollContainer) {
          scrollContainer.scrollTop = scrollContainer.scrollHeight
        } else {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
        }
      }, 100)
  
      // Chat persistence is handled in effects based on message changes
      
    } catch (err) {
      console.error('Chat submission error:', err)
      setError(
        err instanceof Error 
          ? err.message 
          : 'An unexpected error occurred. Please try again.'
      )
      
      // Add system message about error
      setMessages(prev => [
        ...prev, 
        {
          id: Date.now().toString(),
          content: "Sorry, there was an error processing your request. Please try again.",
          role: 'system' as const
        }
      ])
      
      // Retry logic for network errors
      if (err instanceof TypeError && err.message.includes('network')) {
        toast.error("Network Error", {
          description: "Would you like to retry?",
          action: <button onClick={() => handleSubmit()}>Retry</button>,
        })
      }      } finally {
        setIsSubmitting(false)
        setTimeout(() => {
          const scrollContainer = document.querySelector('.chat-messages-container')
          if (scrollContainer) {
            scrollContainer.scrollTop = scrollContainer.scrollHeight
          } else {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
          }
        }, 100)
      }
  }

  // Load existing chat if chatId is provided
  useEffect(() => {
    const loadExistingChat = async () => {
      if (!chatId || !user?.id || initialLoadComplete) return

      try {
        const response = await fetch(`/api/chat/manage?chatId=${chatId}`, {
          credentials: 'include',
        })
        if (response.status === 404) {
          toast.error("Chat not found")
          router.push("/")
          return
        }
        if (!response.ok) throw new Error('Failed to fetch chat')
        
        const chat = await response.json()
        if (chat.userId === user.id) {
          setMessages(chat.messages)
          // Load existing feedback for this chat
          loadExistingFeedback(chatId)
        } else {
          toast.error("Unauthorized access")
          router.push("/")
        }
      } catch (error) {
        console.error('Error loading chat:', error)
        toast.error("Error loading chat")
        router.push("/")
      } finally {
        setInitialLoadComplete(true)
      }
    }

    loadExistingChat()
  }, [chatId, user?.id, initialLoadComplete, setMessages, router])

  // Clear messages and reset tracking ref when starting a new conversation
  useEffect(() => {
    if (!chatId) {
      setMessages([])
      setInitialLoadComplete(false)
      currentChatIdRef.current = undefined
    }
  }, [chatId, setMessages])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messages.length) {
      const scrollContainer = document.querySelector('.chat-messages-container')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      } else {
        // Fallback to messagesEndRef
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }, [messages])

  // Announce when assistant responds
  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].role === "assistant") {
      setAnnouncement("New response received")
    }
  }, [messages])

  // Handle scroll to bottom button visibility
  useEffect(() => {
    const handleScroll = () => {
      const scrollContainer = document.querySelector('.chat-messages-container')
      if (scrollContainer) {
        const { scrollTop, scrollHeight, clientHeight } = scrollContainer
        // Show button when scrolled up more than 200px from bottom
        setScrollToBottomVisible(scrollHeight - scrollTop - clientHeight > 200)
      }
    }
    
    const scrollContainer = document.querySelector('.chat-messages-container')
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll)
      return () => scrollContainer.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const handleDocumentAnalysis = async (question: string, answer: string) => {
    // Check for trial limit for anonymous users for document analysis too
    if (user?.isAnonymous && !hasStartedConversation) {
      if (isTrialLimitReached()) {
        toast.error("Trial limit reached. Please sign up to continue.")
        return
      }
      // Mark that we've started a conversation for this session
      setHasStartedConversation(true)
      // Increment the trial conversation count
      incrementTrialConversations()
    }

    const newMessages: Message[] = [
      ...messages,
      { id: Date.now().toString(), role: "user", content: `Document Question: ${question}` } as Message,
      { id: (Date.now() + 1).toString(), role: "assistant", content: answer } as Message
    ]
    setMessages(newMessages)

    // Save chat if user is authenticated
    if (user?.id && !user?.isAnonymous) {
      try {
        const activeChatId = currentChatIdRef.current || chatId
        if (activeChatId) {
          await updateChat(activeChatId, newMessages)
        } else {
          const newChatId = await saveChat(newMessages)
          if (newChatId) {
            currentChatIdRef.current = newChatId
            router.replace(`/chat?chatId=${newChatId}`, { scroll: false })
            toast.success("Chat saved successfully")
          }
        }
      } catch (error) {
        console.error("Failed to save document analysis:", error)
        toast.error("Failed to save chat")
      }
    }
  }

  // Scroll to bottom function
  const scrollToBottom = () => {
    const scrollContainer = document.querySelector('.chat-messages-container')
    if (scrollContainer) {
      scrollContainer.scrollTo({
        top: scrollContainer.scrollHeight,
        behavior: 'smooth'
      })
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const renderMessages = () => {
    if (messages.length === 0 && !isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center px-4 pt-10">
          {showWelcomeTutorial && (
            <WelcomeTutorial
              t={t}
              tutorialStep={tutorialStep}
              setTutorialStep={setTutorialStep}
              onDismiss={() => setShowWelcomeTutorial(false)}
              onExampleClick={(query) => {
                handleInputChange({ target: { value: query } } as React.ChangeEvent<HTMLInputElement>)
                setTimeout(() => inputRef.current?.focus(), 100)
              }}
            />
          )}
          {user?.isAnonymous && !hasStartedConversation && (
            <TrialInfo t={t} remaining={getTrialConversationsRemaining()} />
          )}
        </div>
      )
    }
    
    // Render grouped messages
    return (
      <div className="space-y-1 py-4">
        {groupedMessages.map((group, groupIndex) => (
          <div key={`group-${groupIndex}`} className="message-group">
            {group.map((message, messageIndex) => {
              // Determine global index for highlighting
              const globalIndex = messages.findIndex(m => m.id === message.id)
              return (
                <ChatMessage
                  key={message.id}
                  message={message}
                  isMobile={isMobile}
                  t={t}
                  highlight={globalIndex === focusedMessageIndex}
                  searchTerms={highlightTerms}
                  isFirstInGroup={messageIndex === 0}
                  isLastInGroup={messageIndex === group.length - 1}
                  chatId={chatId}
                  onReaction={(messageId, reaction) => {
                    // This callback is now mainly for backwards compatibility
                    // The actual database storage is handled within ChatMessage component
                    toast.success(`Feedback "${reaction}" for message "${messageId}" has been recorded.`)
                  }}
                />
              )
            })}
          </div>
        ))}
        
        {/* Typing indicator */}
        {isTyping && <TypingIndicator isMobile={isMobile} />}
        
        {/* Loading indicator */}
        {isLoading && !isTyping && (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
    )
  }

  useEffect(() => {
    if (isTyping) {
      // Scroll to bottom when typing starts
      setTimeout(() => {
        const scrollContainer = document.querySelector('.chat-messages-container')
        if (scrollContainer) {
          scrollContainer.scrollTo({
            top: scrollContainer.scrollHeight,
            behavior: 'smooth'
          })
        }
      }, 100)
    }
  }, [isTyping])

  return (
    <ChatErrorBoundary>
      <div 
        className="flex flex-col h-full"
        role="region"
        aria-label={t("Chat conversation")}
      >
      <TooltipProvider>
        {/* Chat Interface - No Tabs */}
        <div className="flex flex-col h-full overflow-hidden">
          {/* Search toggle button - only show when messages exist */}
          {messages.length > 0 && (
            <div className="flex-shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70">
              <div className="flex items-center justify-between px-4 py-2">
                <h2 className="text-lg font-medium">{t("Legal Chat")}</h2>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setShowMessageSearch(!showMessageSearch)
                    if (!showMessageSearch) {
                      setTimeout(() => messageSearchInputRef.current?.focus(), 100)
                    }
                  }}
                >
                  <Search className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">{t("Search")}</span>
                </Button>
              </div>
            </div>
          )}

          {/* Message search panel */}
          {showMessageSearch && (
            <div className="flex-shrink-0">
              <MessageSearchPanel
                messageSearchQuery={messageSearchQuery}
                setMessageSearchQuery={setMessageSearchQuery}
                handleMessageSearch={handleMessageSearch}
                navigateSearchResults={navigateSearchResults}
                searchResults={searchResults}
                currentSearchResultIndex={currentSearchResultIndex}
                messageSearchInputRef={messageSearchInputRef}
                t={t}
                setShowMessageSearch={setShowMessageSearch}
              />
            </div>
          )}

          {/* Scrollable messages container */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden chat-messages-container px-4">
            {renderMessages()}
          </div>

          {/* Scroll to bottom button */}
          {scrollToBottomVisible && (
            <div className="absolute bottom-20 right-8 z-10">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full shadow-lg bg-background hover:bg-background/90 transition-all duration-200 hover:scale-105"
                onClick={scrollToBottom}
                aria-label={t("Scroll to bottom")}
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Input area - blocked for guests who hit the limit */}
          <div className="flex-shrink-0 px-4 py-3 bg-background border-t border-border">
            {user?.isAnonymous && isTrialLimitReached() ? (
              <TrialLimitAlert t={t} />
            ) : (
            <form onSubmit={handleSubmit} className="max-w-3xl mx-auto w-full">
              <div className="rounded-2xl border border-border bg-background shadow-md flex flex-col">
                <Textarea
                  ref={inputRef}
                  value={input}
                  onChange={handleInputChange}
                  placeholder={t("Type your legal question...")}
                  className="border-0 focus-visible:ring-0 bg-transparent resize-none min-h-[52px] max-h-[200px] py-3.5 px-4 text-sm"
                  disabled={isSubmitting}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                      e.preventDefault()
                      handleSubmit()
                    }
                  }}
                />
                <div className="flex items-center justify-between px-3 pb-2.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg"
                    onClick={() => {
                      toast.info("Document upload coming soon")
                    }}
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || !input.trim()}
                    className={`h-9 w-9 p-0 rounded-xl transition-all duration-200 ${
                      isSubmitting ? 'bg-muted' : ''
                    }`}
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              {user?.isAnonymous && (
                <div className="text-xs text-muted-foreground mt-2 flex items-center justify-between">
                  <span className={getTrialConversationsRemaining() <= 3 ? 'text-amber-600 dark:text-amber-400 font-medium' : ''}>
                    {getTrialConversationsRemaining()} {t("free messages remaining")}
                  </span>
                  <Button variant="link" className="px-1 py-0 h-auto text-xs" onClick={() => router.push("/sign-up")}>
                    {t("Sign up for unlimited access")}
                  </Button>
                </div>
              )}
            </form>
            )}
          </div>
        </div>
      </TooltipProvider>
    </div>
    </ChatErrorBoundary>
  );
}
