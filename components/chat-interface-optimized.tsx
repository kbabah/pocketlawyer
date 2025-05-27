"use client"

import { useState, useEffect, memo, useRef } from "react"
import { useChat } from "@ai-sdk/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar } from "@/components/ui/avatar"
import { 
  User, Search, Sparkles, Scale, FileText, Send, Loader2, AlertTriangle, 
  MessageCircle, ChevronUp, ChevronDown, X, HelpCircle, 
  BookOpen, Keyboard, Info, ArrowRight, Check, Copy, Share, ThumbsUp,
  ThumbsDown, MoreHorizontal, ArrowDown, Paperclip
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { 
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger 
} from "@/components/ui/tooltip"
import { useLanguage } from "@/contexts/language-context"
import { useChatHistory } from "@/hooks/use-chat-history"
import { useIsMobile } from "@/hooks/use-mobile"
import { useSearchParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import type { Message } from 'ai'
import { Skeleton } from "@/components/ui/skeleton"
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { ChatErrorBoundary } from "@/components/error-boundaries"

// ...react-window import removed (unused)

// Import the fuzzy search library
import Fuse from 'fuse.js'
import { HighlightMatches } from '@/components/ui/highlight-matches'
import { useChatFeedback } from '@/hooks/use-chat-feedback'

// Define interface for ChatMessage props
interface ChatMessageProps {
  message: any;
  isMobile: boolean;
  t: (key: string, options?: any) => string;
  highlight?: boolean;
  searchTerms?: string[];
  isLastInGroup?: boolean;
  isFirstInGroup?: boolean;
  onReaction?: (messageId: string, reaction: 'like' | 'dislike') => void;
  chatId?: string;
}

// Enhanced memoized chat message component with better styling and grouping
const ChatMessage = memo(({ 
  message, 
  isMobile, 
  t, 
  highlight = false, 
  searchTerms = [],
  isFirstInGroup = true,
  isLastInGroup = true,
  onReaction,
  chatId
}: ChatMessageProps) => {
  // Improved content rendering with better highlighting
  const content = searchTerms.length > 0 ? 
    <HighlightMatches text={message.content} terms={searchTerms} /> : 
    message.content;
  
  const [showActions, setShowActions] = useState(false);
  const { submitFeedback, getFeedbackState } = useChatFeedback();
  
  // Get current feedback state for this message
  const feedbackState = getFeedbackState(message.id);
  
  // Handle copy message content
  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    toast.success(t("Message copied to clipboard"));
  };

  // Handle feedback submission
  const handleFeedback = async (feedbackType: 'like' | 'dislike') => {
    try {
      await submitFeedback({
        messageId: message.id,
        chatId: chatId,
        feedbackType,
      });
      
      // Also call the original onReaction callback if provided
      onReaction?.(message.id, feedbackType);
    } catch (error) {
      // Error is already handled in the hook
      console.error('Failed to submit feedback:', error);
    }
  };
  
  return (
    <div 
      className={`message ${message.role} ${highlight ? 'search-highlight bg-yellow-100 dark:bg-yellow-800/20 rounded-md' : ''} 
        ${isFirstInGroup ? 'mt-6' : 'mt-1'} ${isLastInGroup ? 'mb-2' : 'mb-0'}`}
      role="listitem"
      aria-label={`${message.role === 'user' ? 'You' : 'Assistant'}: ${message.content}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-center justify-center">
        <div 
          className={`flex items-start gap-3 sm:gap-4 max-w-3xl w-full ${message.role === "user" ? "flex-row-reverse" : ""}`}
          aria-label={message.role === 'user' ? 'User message' : 'Assistant message'}
        >
          {/* Only show avatar for first message in group */}
          {isFirstInGroup && (
            <Avatar 
              className={`${isMobile ? "h-8 w-8" : "h-10 w-10"} 
                ${message.role === "user" ? "bg-primary/10" : "bg-secondary/30"}
                transition-all duration-200 ease-in-out
                ${isFirstInGroup ? 'opacity-100' : 'opacity-0 h-0 w-0'}`}
            >
              {message.role === "user" ? <User className="p-1.5" /> : <Scale className="p-1.5" />}
            </Avatar>
          )}
          
          {/* Spacer when avatar is hidden */}
          {!isFirstInGroup && (
            <div className={`${isMobile ? "w-8" : "w-10"} ${message.role === "user" ? "order-last" : "order-first"}`}></div>
          )}
          
          <div 
            className={`relative rounded-lg px-3.5 py-2.5 sm:px-4 sm:py-3 max-w-[85%] sm:max-w-[90%] 
              ${message.role === "user" 
                ? "bg-primary text-primary-foreground dark:shadow-md ml-2 rounded-tr-none" 
                : "bg-secondary/40 dark:bg-secondary/20 border border-slate-200 dark:border-slate-700 mr-2 rounded-tl-none"
              }
              ${!isLastInGroup && message.role === "user" ? "rounded-br-none" : ""}
              ${!isLastInGroup && message.role !== "user" ? "rounded-bl-none" : ""}
              shadow-sm hover:shadow transition-all duration-200`}
          >
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{content}</p>
            
            {/* Message timestamp - visible on hover */}
            <div className={`absolute ${message.role === "user" ? "right-2" : "left-2"} -bottom-5 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity`}>
              {new Date(parseInt(message.id, 10)).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </div>
            
            {/* Message actions - visible on hover */}
            {showActions && (
              <div className={`absolute ${message.role === "user" ? "left-0" : "right-0"} -bottom-8 flex items-center gap-1 bg-background/80 backdrop-blur-sm rounded-full px-1 py-0.5 shadow-sm border border-border/50 transition-all duration-200`}>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCopy}>
                  <Copy className="h-3 w-3" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`h-6 w-6 ${feedbackState.feedbackType === 'like' ? 'text-green-600 bg-green-100 dark:bg-green-900/30' : ''}`}
                  onClick={() => handleFeedback('like')}
                  disabled={feedbackState.isSubmitting}
                >
                  {feedbackState.isSubmitting && feedbackState.feedbackType === 'like' ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <ThumbsUp className="h-3 w-3" />
                  )}
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`h-6 w-6 ${feedbackState.feedbackType === 'dislike' ? 'text-red-600 bg-red-100 dark:bg-red-900/30' : ''}`}
                  onClick={() => handleFeedback('dislike')}
                  disabled={feedbackState.isSubmitting}
                >
                  {feedbackState.isSubmitting && feedbackState.feedbackType === 'dislike' ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <ThumbsDown className="h-3 w-3" />
                  )}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleCopy}>
                      <Copy className="h-4 w-4 mr-2" />
                      {t("Copy")}
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Share className="h-4 w-4 mr-2" />
                      {t("Share")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
})
ChatMessage.displayName = 'ChatMessage'

// Sub-component: Message Search Panel
const MessageSearchPanel = ({
  messageSearchQuery,
  setMessageSearchQuery,
  handleMessageSearch,
  navigateSearchResults,
  searchResults,
  currentSearchResultIndex,
  messageSearchInputRef,
  t,
  setShowMessageSearch
}: {
  messageSearchQuery: string;
  setMessageSearchQuery: (q: string) => void;
  handleMessageSearch: () => void;
  navigateSearchResults: (dir: 'previous' | 'next') => void;
  searchResults: number[];
  currentSearchResultIndex: number;
  messageSearchInputRef: React.RefObject<HTMLInputElement | null>;
  t: (key: string) => string;
  setShowMessageSearch: (show: boolean) => void;
}) => (
  <div className="sticky top-[57px] z-10 flex items-center gap-2 p-2 bg-background/95 backdrop-blur border-b animate-slideDown">
    <div className="relative flex-1">
      <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        ref={messageSearchInputRef}
        className="pl-8 pr-16"
        placeholder={t("Search messages...")}
        value={messageSearchQuery}
        onChange={(e) => setMessageSearchQuery(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleMessageSearch(); } }}
      />
      {searchResults.length > 0 && (
        <span className="absolute right-16 top-1/2 -translate-y-1/2 text-xs text-muted-foreground bg-background/90 px-2 py-0.5 rounded-md">
          {currentSearchResultIndex + 1} / {searchResults.length}
        </span>
      )}
      <Button
        size="sm"
        variant="ghost"
        onClick={handleMessageSearch}
        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground"
      >
        {t("Find")}
      </Button>
    </div>
    <div className="flex gap-1">
      <Button variant="ghost" size="icon" onClick={() => navigateSearchResults('previous')} disabled={searchResults.length === 0} className="h-8 w-8">
        <ChevronUp className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={() => navigateSearchResults('next')} disabled={searchResults.length === 0} className="h-8 w-8">
        <ChevronDown className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={() => { setShowMessageSearch(false); setMessageSearchQuery(''); }} className="h-8 w-8">
        <X className="h-4 w-4" />
      </Button>
    </div>
  </div>
);

export default function ChatInterface() {
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [messageSearchQuery, setMessageSearchQuery] = useState<string>("")
  const [searchResults, setSearchResults] = useState<number[]>([])
  const [currentSearchResultIndex, setCurrentSearchResultIndex] = useState<number>(-1)
  const [highlightTerms, setHighlightTerms] = useState<string[]>([])
  const [fuzzySearchInstance, setFuzzySearchInstance] = useState<Fuse<Message> | null>(null)
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
  const [focusedMessageIndex, setFocusedMessageIndex] = useState(-1)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [showMessageSearch, setShowMessageSearch] = useState(false)
  const messageSearchInputRef = useRef<HTMLInputElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const [searchIsActive, setSearchIsActive] = useState(false)
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

  const { saveChat, updateChat } = useChatHistory(user?.id)

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
    
    if (user?.isAnonymous && !hasStartedConversation) {
      if (isTrialLimitReached()) {
        toast.error("Trial limit reached. Please sign up to continue.")
        return
      }
      setHasStartedConversation(true)
      incrementTrialConversations()
    }
    
    try {
      setIsSubmitting(true)
      setError(null)
      
      // Store the input value for later use with chat saving
      const userInput = input
      
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
        const response = await fetch(`/api/chat/manage?chatId=${chatId}`)
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

  // Clear messages when starting a new conversation (chatId undefined)
  useEffect(() => {
    if (!chatId) {
      setMessages([])
      setInitialLoadComplete(false)
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
        if (chatId) {
          await updateChat(chatId, newMessages)
        } else {
          const newChatId = await saveChat(newMessages)
          if (newChatId) {
            router.replace(`/?chatId=${newChatId}`, { scroll: false })
            toast.success("Chat saved successfully")
          }
        }
      } catch (error) {
        console.error("Failed to save document analysis:", error)
        toast.error("Failed to save chat")
      }
    }

    setActiveTab("chat")
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

  // Trial limit reached alert component
  const TrialLimitAlert = () => {
    if (!user?.isAnonymous || !isTrialLimitReached()) return null;
    
    return (
      <div className="mb-4 p-4 border border-amber-200 dark:border-amber-800 rounded-lg bg-amber-50 dark:bg-amber-900/30 animate-in fade-in duration-300">
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-amber-800 dark:text-amber-400 mb-1">
                {t("Trial Access Complete")}
              </h3>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                {t("You've reached your free trial limit. Create an account to continue receiving unlimited legal assistance and save your conversation history.")}
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full">
            <Button 
              size="sm" 
              onClick={() => router.push("/sign-up")} 
              className="bg-amber-600 hover:bg-amber-700 w-full transition-all duration-200"
            >
              {t("Create Free Account")}
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => router.push("/sign-in")} 
              className="border-amber-600 text-amber-600 hover:bg-amber-50 dark:border-amber-500 dark:text-amber-400 dark:hover:bg-amber-950/50 w-full transition-all duration-200"
            >
              {t("Sign In")}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // Trial information component with clearer messaging
  const TrialInfo = () => {
    if (!user?.isAnonymous || hasStartedConversation || messages.length > 0) return null;
    
    const remaining = getTrialConversationsRemaining();
    
    return (
      <div className="mt-6 p-4 border border-blue-200 dark:border-blue-800 rounded-lg bg-blue-50 dark:bg-blue-950/30 animate-in fade-in duration-300">
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-2">
            <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-blue-700 dark:text-blue-300">
                {t("Try Our Legal Assistant")}
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                {t(`You have ${remaining} free conversations available.`)}
              </p>
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                {t("Create an account for unlimited access and to save your conversation history.")}
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full">
            <Button 
              size="sm" 
              onClick={() => router.push("/sign-up")} 
              className="w-full transition-all duration-200"
            >
              {t("Create Free Account")}
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => router.push("/sign-in")} 
              className="w-full transition-all duration-200"
            >
              {t("Sign In")}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // Typing indicator component
  const TypingIndicator = () => {
    if (!isTyping) return null;
    
    return (
      <div className="flex items-center gap-3 sm:gap-4 max-w-3xl w-full mb-4">
        <Avatar className={`${isMobile ? "h-8 w-8" : "h-10 w-10"} bg-secondary/30`}>
          <Scale className="p-1.5" />
        </Avatar>
        <div className="rounded-lg px-3.5 py-2.5 sm:px-4 sm:py-3 bg-secondary/40 dark:bg-secondary/20 border border-slate-200 dark:border-slate-700 mr-2 rounded-tl-none">
          <div className="flex space-x-2">
            <div className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    );
  };

  // Use regular rendering for messages
  const renderMessages = () => {
    if (messages.length === 0 && !isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center px-4 pt-10">
          <WelcomeTutorial />
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
                    console.log(`Feedback ${reaction} for message ${messageId} stored in database`)
                  }}
                />
              )
            })}
          </div>
        ))}
        
        {/* Typing indicator */}
        {isTyping && <TypingIndicator />}
        
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

  // Welcome Tutorial component
  const WelcomeTutorial = () => {
    // Don't show tutorial if user already has messages or it's been dismissed
    if (messages.length > 0 || !showWelcomeTutorial) return null;

    // Example queries for the chat
    const exampleQueries = [
      "What are my rights as a tenant?",
      "How do I form an LLC?",
      "Explain employment discrimination laws",
      "What are the steps for filing a patent?"
    ];

    // Tutorial steps content
    const tutorialSteps = [
      {
        icon: <MessageCircle className="h-5 w-5 text-blue-500" />,
        title: t("Get Legal Assistance"),
        description: t("Ask any legal question and get clear, informative responses from our AI legal assistant.")
      },
      {
        icon: <Search className="h-5 w-5 text-blue-500" />,
        title: t("Research Legal Topics"),
        description: t("Search legal databases and trusted sources for detailed information.")
      },
      {
        icon: <FileText className="h-5 w-5 text-blue-500" />,
        title: t("Document Analysis"),
        description: t("Upload legal documents for expert analysis and get detailed explanations.")
      },
      {
        icon: <Keyboard className="h-5 w-5 text-blue-500" />,
        title: t("Quick Access"),
        description: t("Use keyboard shortcuts for faster navigation and improved workflow.")
      }
    ];

    // Welcome section with proper translations
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-primary">{t("Your Legal Assistant")}</h2>
          <p className="text-lg text-muted-foreground">
            {t("Get expert legal guidance with our AI-powered assistant")}
          </p>
        </div>

        {/* Tutorial steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {tutorialSteps.map((step, index) => (
            <div 
              key={index} 
              className={`p-4 border rounded-lg transition-all duration-300 ${
                tutorialStep === index ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20 shadow-sm" : "border-border hover:border-blue-300 dark:hover:border-blue-700"
              }`}
              onClick={() => setTutorialStep(index)}
            >
              <div className="flex items-center gap-3">
                <div className="shrink-0 p-2 rounded-full bg-primary/10">
                  {step.icon}
                </div>
                <div>
                  <h3 className="font-medium">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Example queries section */}
        <div className="space-y-3 border-t pt-3">
          <h3 className="font-medium text-center">{t("What would you like to know?")}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {exampleQueries.map((query, index) => (
              <button
                key={index}
                className="p-2 text-left text-sm border rounded-md hover:bg-primary/5 hover:border-primary/30 transition-colors"
                onClick={() => {
                  handleInputChange({ target: { value: query } } as React.ChangeEvent<HTMLInputElement>)
                  setTimeout(() => inputRef.current?.focus(), 100)
                }}
              >
                <span className="flex items-center gap-2">
                  <ArrowRight className="h-3 w-3 text-primary" />
                  {query}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Keyboard shortcuts guide */}
        {tutorialStep === 3 && (
          <div className="border rounded-lg p-4 bg-secondary/10 space-y-3">
            <h3 className="font-medium flex items-center gap-2">
              <Keyboard className="h-4 w-4" />
              {t("Keyboard Shortcuts")}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <div className="flex items-center justify-between">
                <span>/ (Slash)</span>
                <span className="text-muted-foreground">{t("Focus input")}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Ctrl+Enter / ⌘+Enter</span>
                <span className="text-muted-foreground">{t("Send message")}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Ctrl+F / ⌘+F</span>
                <span className="text-muted-foreground">{t("Search in chat")}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>F3</span>
                <span className="text-muted-foreground">{t("Next result")}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Alt+N</span>
                <span className="text-muted-foreground">{t("New message")}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Esc</span>
                <span className="text-muted-foreground">{t("Close input")}</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-center pt-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowWelcomeTutorial(false)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Check className="h-4 w-4 mr-1" />
            {t("Got it, let's begin")}
          </Button>
        </div>
      </div>
    );
  };

  // Initialize fuzzy search instance when messages change
  useEffect(() => {
    if (messages.length) {
      setFuzzySearchInstance(new Fuse(messages, { keys: ['content'], threshold: 0.4 }));
    }
  }, [messages]);

  // Message search handler
  const handleMessageSearch = () => {
    const query = messageSearchQuery.trim();
    if (!query) {
      setSearchResults([]);
      setCurrentSearchResultIndex(-1);
      setHighlightTerms([]);
      setSearchIsActive(false);
      return;
    }
    let results: number[];
    if (fuzzySearchInstance) {
      results = fuzzySearchInstance.search(query).map(res => res.refIndex);
    } else {
      const lower = query.toLowerCase();
      results = messages.map((m, i) => m.content.toLowerCase().includes(lower) ? i : -1).filter(i => i >= 0);
    }
    setSearchResults(results);
    setCurrentSearchResultIndex(results.length > 0 ? 0 : -1);
    setHighlightTerms(query.split(/\s+/));
    setSearchIsActive(true);
    if (results.length) {
      const elem = document.getElementById(`message-${results[0]}`);
      if (elem) {
        const scrollContainer = document.querySelector('.chat-messages-container')
        if (scrollContainer) {
          const containerRect = scrollContainer.getBoundingClientRect()
          const messageRect = elem.getBoundingClientRect()
          const scrollTop = scrollContainer.scrollTop + messageRect.top - containerRect.top - 20
          scrollContainer.scrollTo({ top: scrollTop, behavior: 'smooth' })
        } else {
          elem.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        }
      }
    }
  };

  // Navigate between search results
  const navigateSearchResults = (direction: 'previous' | 'next') => {
    if (!searchResults.length) return;
    let idx = currentSearchResultIndex;
    if (direction === 'previous') {
      idx = idx <= 0 ? searchResults.length - 1 : idx - 1;
    } else {
      idx = idx >= searchResults.length - 1 ? 0 : idx + 1;
    }
    setCurrentSearchResultIndex(idx);
    const resultIndex = searchResults[idx];
    const elem = document.getElementById(`message-${resultIndex}`);
    if (elem) {
      const scrollContainer = document.querySelector('.chat-messages-container')
      if (scrollContainer) {
        const containerRect = scrollContainer.getBoundingClientRect()
        const messageRect = elem.getBoundingClientRect()
        const scrollTop = scrollContainer.scrollTop + messageRect.top - containerRect.top - 20
        scrollContainer.scrollTo({ top: scrollTop, behavior: 'smooth' })
      } else {
        elem.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }
    }
  };

  // Auto-scroll when typing indicator changes
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
        className="flex flex-col h-[calc(100vh-4rem)] max-h-[calc(100vh-4rem)] overflow-hidden"
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

          {/* Chat content with proper scroll containment */}
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden p-4">
            <Card className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <CardContent className="flex flex-col h-full p-0 overflow-hidden">
                {/* Fixed message search panel */}
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

                {/* Fixed trial limit alert */}
                {isTrialLimitReached() && (
                  <div className="flex-shrink-0 p-4">
                    <TrialLimitAlert />
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

                {/* Fixed input area at bottom */}
                <div className="flex-shrink-0 bg-background/95 backdrop-blur border-t">
                  <div className="p-3 sm:p-4">
                    <form onSubmit={handleSubmit} className="flex gap-2 w-full max-w-4xl mx-auto">
                      <div className="relative flex-1 flex items-center">
                        <Textarea
                          ref={inputRef}
                          value={input}
                          onChange={handleInputChange}
                          placeholder={t("Type your legal question...")}
                          className="flex-1 min-h-[44px] max-h-[200px] pr-10 resize-none py-3 text-base sm:text-sm"
                          disabled={isSubmitting}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                              e.preventDefault()
                              handleSubmit()
                            }
                          }}
                        />
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => {
                            // Document upload functionality would go here
                            toast.info("Document upload coming soon")
                          }}
                        >
                          <Paperclip className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button 
                        type="submit" 
                        disabled={isSubmitting || !input.trim()} 
                        className={`h-11 w-11 sm:h-9 sm:w-9 p-0 flex-shrink-0 rounded-full transition-all duration-200 ${
                          isSubmitting ? 'bg-muted' : ''
                        }`}
                      >
                        {isSubmitting ? (
                          <Loader2 className="h-5 w-5 sm:h-4 sm:w-4 animate-spin" />
                        ) : (
                          <Send className="h-5 w-5 sm:h-4 sm:w-4" />
                        )}
                      </Button>
                    </form>

                    {user?.isAnonymous && !isTrialLimitReached() && (
                      <div className="text-xs text-muted-foreground mt-2 flex items-center justify-between">
                        <span>
                          {getTrialConversationsRemaining()} {t("trial conversations remaining")}
                        </span>
                        <Button variant="link" className="px-1 py-0 h-auto text-xs" onClick={() => router.push("/sign-up")}>
                          {t("Sign up for unlimited access")}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </TooltipProvider>
    </div>
    </ChatErrorBoundary>
  );
}
