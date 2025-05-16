"use client"

import { useState, useEffect, memo, useRef } from "react"
import { useChat } from "@ai-sdk/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar } from "@/components/ui/avatar"
import { User, Search, Sparkles, Scale, FileText, Send, Loader2, AlertTriangle, UserPlus, MessageCircle, ChevronUp, ChevronDown, X, HelpCircle, BookOpen, Keyboard, Info, ArrowRight, Check } from "lucide-react"
import WebBrowser from "@/components/web-browser"
import DocumentAnalysis from "@/components/document-analysis"
import { Card } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useLanguage } from "@/contexts/language-context"
import { useChatHistory } from "@/hooks/use-chat-history"
import { useIsMobile } from "@/hooks/use-mobile"
import { useSearchParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import type { Message } from 'ai'
import { Skeleton } from "@/components/ui/skeleton"

// Import the windowing library
import { FixedSizeList as List } from 'react-window';

// Import the fuzzy search library
import Fuse from 'fuse.js'
import { HighlightMatches } from '@/components/ui/highlight-matches'

// Define interface for ChatMessage props
interface ChatMessageProps {
  message: Message;
  isMobile: boolean;
  t: (key: string, options?: any) => string;
  highlight?: boolean;
  searchTerms?: string[];
}

// Enhanced memoized chat message component with better highlighting
const ChatMessage = memo(({ message, isMobile, t, highlight = false, searchTerms = [] }: ChatMessageProps) => {
  // Improved content rendering with better highlighting
  const content = searchTerms.length > 0 ? 
    <HighlightMatches text={message.content} terms={searchTerms} /> : 
    message.content;
    
  return (
    <div 
      className={`message ${message.role} ${highlight ? 'search-highlight bg-yellow-100 dark:bg-yellow-800/20 rounded-md' : ''}`}
      role="listitem"
      aria-label={`${message.role === 'user' ? 'You' : 'Assistant'}: ${message.content}`}
    >
      <div className="flex items-center justify-center mb-4">
        <div 
          className={`flex items-start gap-3 sm:gap-4 max-w-xl w-full ${message.role === "user" ? "flex-row-reverse" : ""}`}
          aria-label={message.role === 'user' ? 'User message' : 'Assistant message'}
        >
          <Avatar className={`${isMobile ? "h-8 w-8" : "h-10 w-10"} ${message.role === "user" ? "bg-primary/10" : "bg-secondary/30"}`}>
            {message.role === "user" ? <User className="p-1.5" /> : <Scale className="p-1.5" />}
          </Avatar>
          <div 
            className={`rounded-lg px-3.5 py-2.5 sm:px-4 sm:py-3 max-w-[80%] sm:max-w-[85%] shadow-sm ${
              message.role === "user" 
                ? "bg-primary text-primary-foreground dark:shadow-md ml-2" 
                : "bg-secondary/40 dark:bg-secondary/20 border border-slate-200 dark:border-slate-700 mr-2"
            }`}
          >
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{content}</p>
          </div>
        </div>
      </div>
    </div>
  )
})
ChatMessage.displayName = 'ChatMessage'

export default function ChatInterface() {
  const [activeTab, setActiveTab] = useState<string>("chat")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [messageSearchQuery, setMessageSearchQuery] = useState<string>("")
  const [searchResults, setSearchResults] = useState<number[]>([])
  const [currentSearchResultIndex, setCurrentSearchResultIndex] = useState<number>(-1)
  const [highlightTerms, setHighlightTerms] = useState<string[]>([])
  const [fuzzySearchInstance, setFuzzySearchInstance] = useState<Fuse<Message> | null>(null)
  const [error, setError] = useState<string | null>(null) // Add missing error state
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
  const listRef = useRef<List>(null)
  const [showMessageSearch, setShowMessageSearch] = useState(false)
  const messageSearchInputRef = useRef<HTMLInputElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [searchIsActive, setSearchIsActive] = useState(false)
  const [showWelcomeTutorial, setShowWelcomeTutorial] = useState(true)
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false)
  const [tutorialStep, setTutorialStep] = useState(0)

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

  // Improved virtualized message rendering
  const VirtualizedMessageList = () => {
    const itemSize = 100; // Adjust based on average message height
    
    // Add types for Row component props
    interface RowProps {
      index: number;
      style: React.CSSProperties;
    }
    
    const Row = ({ index, style }: RowProps) => {
      const message = messages[index];
      const isHighlighted = searchResults[currentSearchResultIndex] === index;
      
      return (
        <div style={style} className="py-1" id={`message-${index}`}>
          <ChatMessage 
            message={message} 
            isMobile={isMobile} 
            t={t} 
            highlight={isHighlighted}
          />
        </div>
      );
    };
    
    return (
      <div className="h-full w-full">
        {/* Fixed dimensions for virtualization to avoid AutoSizer parsing issues */}
        <List
          ref={listRef}
          height={500}
          itemCount={messages.length}
          itemSize={itemSize}
          width={350}
          overscanCount={3}
          className="scrollbar-hide"
        >
          {Row}
        </List>
        <div ref={messagesEndRef} />
      </div>
    );
  };

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
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
        
        // If using virtualized list
        if (listRef.current) {
          listRef.current.scrollToItem(messages.length, 'end')
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
      }
    } finally {
      setIsSubmitting(false)
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
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
      const scrollContainer = document.querySelector('.ScrollAreaViewport')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages])

  // Announce when assistant responds
  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].role === "assistant") {
      setAnnouncement("New response received")
    }
  }, [messages])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setActiveTab("web")
  }

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

  // Trial limit reached alert component
  const TrialLimitAlert = () => {
    if (!user?.isAnonymous || !isTrialLimitReached()) return null;
    
    return (
      <div className="mb-4 p-4 border border-amber-200 dark:border-amber-800 rounded-lg bg-amber-50 dark:bg-amber-900/30">
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
            <Button size="sm" onClick={() => router.push("/sign-up")} className="bg-amber-600 hover:bg-amber-700 w-full">
              {t("Create Free Account")}
            </Button>
            <Button size="sm" variant="outline" onClick={() => router.push("/sign-in")} 
              className="border-amber-600 text-amber-600 hover:bg-amber-50 dark:border-amber-500 dark:text-amber-400 dark:hover:bg-amber-950/50 w-full">
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
      <div className="mt-6 p-4 border border-blue-200 dark:border-blue-800 rounded-lg bg-blue-50 dark:bg-blue-950/30">
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
            <Button size="sm" onClick={() => router.push("/sign-up")} className="w-full">
              {t("Create Free Account")}
            </Button>
            <Button size="sm" variant="outline" onClick={() => router.push("/sign-in")} className="w-full">
              {t("Sign In")}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // Use virtualization for large message lists
  const renderMessages = () => {
    if (messages.length === 0 && !isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center px-4 pt-10">
          <WelcomeTutorial />
        </div>
      )
    }
    
    // Use virtualization for large message lists
    if (messages.length > 20) {
      // Use the dedicated VirtualizedMessageList component for virtualization
      return <VirtualizedMessageList />;
    }
    
    // Use regular rendering for smaller message lists
    return messages.map((message, index) => {
      const isHighlighted = searchResults[currentSearchResultIndex] === index;
      return (
        <div id={`message-${index}`} key={message.id}>
          <ChatMessage 
            message={message} 
            isMobile={isMobile} 
            t={t} 
            highlight={isHighlighted}
            searchTerms={searchIsActive ? highlightTerms : []}
          />
        </div>
      );
    });
  }

  // Keyboard handler for navigating messages
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault()
      
      if (e.key === 'ArrowUp') {
        setFocusedMessageIndex(prev => 
          prev <= 0 ? messages.length - 1 : prev - 1
        )
      } else if (e.key === 'ArrowDown') {
        setFocusedMessageIndex(prev => 
          prev >= messages.length - 1 ? 0 : prev + 1
        )
      }
    }
  }
  
  // Focus on message when focus index changes
  useEffect(() => {
    if (focusedMessageIndex >= 0) {
      const messageElement = document.getElementById(`message-${focusedMessageIndex}`)
      if (messageElement) {
        messageElement.focus()
        // Ensure the focused message is in view
        messageElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }
    }
  }, [focusedMessageIndex])

  // Enhanced keyboard accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt+N to focus on new message input
      if (e.altKey && e.key === 'n') {
        e.preventDefault()
        inputRef.current?.focus()
      }

      // Escape to blur input
      if (e.key === 'Escape' && document.activeElement === inputRef.current) {
        inputRef.current?.blur()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Enhanced mobile view handling
  useEffect(() => {
    const updateLayout = () => {
      if (isMobile) {
        // Adjust layout for mobile devices
        document.querySelector('.chat-container')?.classList.add('mobile-layout');
        document.querySelector('.input-area')?.classList.add('mobile-input');
      } else {
        document.querySelector('.chat-container')?.classList.remove('mobile-layout');
        document.querySelector('.input-area')?.classList.remove('mobile-input');
      }
    };
    
    updateLayout();
    window.addEventListener('resize', updateLayout);
    return () => window.removeEventListener('resize', updateLayout);
  }, [isMobile]);

  // Enhanced keyboard accessibility 
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Focus input when user presses / if input is not focused
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault()
        inputRef.current?.focus()
      }
      
      // Submit with Ctrl/Cmd + Enter
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && document.activeElement === inputRef.current) {
        e.preventDefault()
        handleSubmit()
      }
      
      // Escape key to blur input
      if (e.key === 'Escape' && document.activeElement === inputRef.current) {
        inputRef.current?.blur()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleSubmit])

  // Auto-resize textarea for input
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      // Reset height to get accurate scrollHeight
      textareaRef.current.style.height = 'auto'
      
      // Set new height based on content
      const newHeight = Math.min(
        textareaRef.current.scrollHeight,
        isMobile ? 150 : 200 // Max height
      )
      
      textareaRef.current.style.height = `${newHeight}px`
    }
  }, [input, isMobile])

  // Add message search functionality
  const searchMessages = () => {
    if (!messageSearchQuery.trim()) {
      setSearchResults([]);
      setCurrentSearchResultIndex(-1);
      return;
    }

    const query = messageSearchQuery.toLowerCase();
    const results = messages
      .map((message, index) => 
        message.content.toLowerCase().includes(query) ? index : -1
      )
      .filter(index => index !== -1);
    
    setSearchResults(results);
    setCurrentSearchResultIndex(results.length > 0 ? 0 : -1);
    
    if (results.length > 0) {
      // Scroll to first result
      const messageElement = document.getElementById(`message-${results[0]}`);
      messageElement?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  // Improved message search function with debounce
  const debouncedSearchRef = useRef<NodeJS.Timeout | null>(null)

  const handleMessageSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setMessageSearchQuery(query)
    
    // Clear previous debounce timer
    if (debouncedSearchRef.current) {
      clearTimeout(debouncedSearchRef.current)
    }
    
    // Set a new debounce timer for 300ms
    debouncedSearchRef.current = setTimeout(() => {
      performMessageSearch(query)
    }, 300)
  }

  const performMessageSearch = (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      setCurrentSearchResultIndex(-1)
      setHighlightTerms([])
      setSearchIsActive(false)
      return
    }
    
    setSearchIsActive(true)
    setHighlightTerms(query.trim().split(/\s+/))
    
    if (fuzzySearchInstance) {
      // Use fuzzy search for better matching
      const results = fuzzySearchInstance.search(query)
      const indices = results.map(result => messages.findIndex(m => m.id === result.item.id))
      
      setSearchResults(indices)
      
      if (indices.length > 0) {
        setCurrentSearchResultIndex(0)
        // Scroll to first result
        setTimeout(() => {
          const messageEl = document.getElementById(`message-${indices[0]}`)
          if (messageEl) {
            messageEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
          }
        }, 100)
      } else {
        setCurrentSearchResultIndex(-1)
      }
    } else {
      // Fallback to regular search
      const searchTerm = query.toLowerCase()
      const results = messages
        .map((message, index) => 
          message.content.toLowerCase().includes(searchTerm) ? index : -1)
        .filter(index => index !== -1)
      
      setSearchResults(results)
      
      if (results.length > 0) {
        setCurrentSearchResultIndex(0)
        setTimeout(() => {
          const messageEl = document.getElementById(`message-${results[0]}`)
          if (messageEl) messageEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        }, 100)
      } else {
        setCurrentSearchResultIndex(-1)
      }
    }
  }

  // Improve search result navigation
  const navigateSearchResults = (direction: 'next' | 'previous') => {
    if (searchResults.length === 0) return
    
    let newIndex = currentSearchResultIndex
    
    if (direction === 'next') {
      newIndex = (currentSearchResultIndex + 1) % searchResults.length
    } else {
      newIndex = currentSearchResultIndex - 1
      if (newIndex < 0) newIndex = searchResults.length - 1
    }
    
    setCurrentSearchResultIndex(newIndex)
    
    // Scroll to the message and add highlight animation
    const messageElement = document.getElementById(`message-${searchResults[newIndex]}`)
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      messageElement.classList.add('search-highlight-container')
      // Remove the highlight after a brief delay
      setTimeout(() => messageElement.classList.remove('search-highlight-container'), 1500)
    }
  }

  // Initialize fuzzy search when messages change
  useEffect(() => {
    if (messages.length > 0) {
      const options = {
        includeScore: true,
        threshold: 0.4,
        keys: ['content']
      }
      setFuzzySearchInstance(new Fuse(messages, options))
    }
  }, [messages])

  // Enhanced keyboard shortcuts for search
  useEffect(() => {
    const handleSearchKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + F to open search
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault()
        setShowMessageSearch(prev => !prev)
        if (!showMessageSearch) {
          setTimeout(() => messageSearchInputRef.current?.focus(), 100)
        } else {
          // Clear search when closing
          setMessageSearchQuery('')
          setSearchResults([])
          setHighlightTerms([])
          setSearchIsActive(false)
        }
      }
      
      // Escape to close search
      if (e.key === 'Escape' && showMessageSearch) {
        e.preventDefault()
        setShowMessageSearch(false)
        setMessageSearchQuery('')
        setSearchResults([])
        setHighlightTerms([])
        setSearchIsActive(false)
      }
      
      // Navigate through results with F3 or n/N
      if (searchIsActive && searchResults.length > 0) {
        if (e.key === 'F3' || (e.key.toLowerCase() === 'n' && (e.ctrlKey || e.metaKey))) {
          e.preventDefault()
          navigateSearchResults(e.shiftKey ? 'previous' : 'next')
        }
      }
    }

    window.addEventListener('keydown', handleSearchKeyDown)
    return () => window.removeEventListener('keydown', handleSearchKeyDown)
  }, [showMessageSearch, searchIsActive, searchResults, currentSearchResultIndex])

  // Add a search UI component in the chat interface
  const SearchPanel = () => {
    if (!showMessageSearch) return null
    
    return (
      <div className="sticky top-14 z-20 w-full bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70 shadow-sm">
        <div className="flex items-center p-2 gap-2 border-b border-primary/10">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            ref={messageSearchInputRef}
            type="text"
            placeholder={t("Search conversation history...")}
            value={messageSearchQuery}
            onChange={handleMessageSearchInput}
            className="h-8 flex-1"
            aria-label={t("Search in conversation history")}
          />
          <div className="flex gap-1 items-center">
            {searchResults.length > 0 && (
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {currentSearchResultIndex + 1} / {searchResults.length}
              </span>
            )}
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={handleMessageSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 px-2"
              aria-label={t("Find")}
            >
              {t("Find")}
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigateSearchResults('previous')}
              disabled={searchResults.length === 0}
              className="h-8 w-8"
              aria-label="Previous match"
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigateSearchResults('next')}
              disabled={searchResults.length === 0}
              className="h-8 w-8"
              aria-label="Next match"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => {
                setShowMessageSearch(false)
                setMessageSearchQuery('')
                setSearchResults([])
                setHighlightTerms([])
                setSearchIsActive(false)
              }}
              className="h-8 w-8"
              aria-label="Close search"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Define the missing handleMessageSearch function
  const handleMessageSearch = () => {
    searchMessages();
  };

  // Define handler for example queries from tutorial
  const useExampleQuery = (query: string) => {
    // Fill input with example query and focus
    handleInputChange({ target: { value: query } } as React.ChangeEvent<HTMLInputElement>);
    setActiveTab('chat');
    inputRef.current?.focus();
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
      <div className="space-y-6 animate-fadeIn">
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
              className={`p-4 border rounded-lg ${
                tutorialStep === index ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20" : "border-border"
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
                className="p-2 text-left text-sm border rounded-md hover:bg-primary/5 transition-colors"
                onClick={() => useExampleQuery(query)}
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
            className="text-muted-foreground hover:text-foreground"
          >
            <Check className="h-4 w-4 mr-1" />
            {t("Got it, let's begin")}
          </Button>
        </div>
      </div>
    );
  };

  // Store tutorial visibility in local storage
  useEffect(() => {
    // Check if user has seen tutorial before
    const hasSeenTutorial = localStorage.getItem('hasSeenChatTutorial');
    if (hasSeenTutorial === 'true') {
      setShowWelcomeTutorial(false);
    }

    // Save tutorial visibility when it changes
    if (!showWelcomeTutorial) {
      localStorage.setItem('hasSeenChatTutorial', 'true');
    }
  }, [showWelcomeTutorial]);

  // Persist chat sessions on message changes
  useEffect(() => {
    if (!messages.length || user?.isAnonymous || !user?.id) return;

    if (!chatId) {
      // New chat: save and update URL
      saveChat(messages)
        .then((newId) => {
          if (newId) {
            router.replace(`/?chatId=${newId}`, { scroll: false });
          }
        })
        .catch((e) => console.error('Error saving new chat:', e));
    } else {
      // Existing chat: update
      updateChat(chatId, messages).catch((e) => console.error('Error updating chat:', e));
    }
  }, [messages, chatId, user?.id]);

  return (
    <div 
      className="relative flex h-[calc(100vh-4rem)] flex-col items-center justify-between"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-live="polite"
      role="region"
      aria-label={t("Chat conversation")}
    >
      <TooltipProvider>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full">
          {/* Mobile-optimized header with centered tabs */}
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center justify-center px-2 sm:px-4 py-2 border-b">
              <TabsList className="w-full max-w-md mx-auto grid grid-cols-3 h-auto p-1 gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <TabsTrigger 
                      value="chat" 
                      className="py-2.5 px-3 min-h-[44px] sm:min-h-0 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      <MessageCircle className="h-5 w-5 sm:h-4 sm:w-4 sm:mr-2" />
                      <span className="hidden sm:inline">{t("Legal Chat")}</span>
                    </TabsTrigger>
                  </TooltipTrigger>
                  <TooltipContent>{t("Chat with our AI legal assistant")}</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <TabsTrigger 
                      value="web" 
                      className="py-2.5 px-3 min-h-[44px] sm:min-h-0 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      <Search className="h-5 w-5 sm:h-4 sm:w-4 sm:mr-2" />
                      <span className="hidden sm:inline">{t("Web Search")}</span>
                    </TabsTrigger>
                  </TooltipTrigger>
                  <TooltipContent>{t("Search legal resources online")}</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <TabsTrigger 
                      value="document" 
                      className="py-2.5 px-3 min-h-[44px] sm:min-h-0 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      <FileText className="h-5 w-5 sm:h-4 sm:w-4 sm:mr-2" />
                      <span className="hidden sm:inline">{t("Documents")}</span>
                    </TabsTrigger>
                  </TooltipTrigger>
                  <TooltipContent>{t("Analyze legal documents")}</TooltipContent>
                </Tooltip>
              </TabsList>
            </div>
          </div>

          {/* Chat content */}
          <TabsContent value="chat" className="flex-1 flex flex-col px-2 sm:px-4 md:px-0">
            {showMessageSearch && (
              <div className="sticky top-[57px] z-10 flex items-center gap-2 p-2 bg-background/95 backdrop-blur border-b">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    ref={messageSearchInputRef}
                    className="pl-8 pr-16"
                    placeholder={t("Search messages...")}
                    value={messageSearchQuery}
                    onChange={(e) => setMessageSearchQuery(e.target.value)}
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
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-7 px-2"
                  >
                    {t("Find")}
                  </Button>
                </div>
              </div>
            )}

            {/* Messages container */}
            <div className="flex-1 overflow-y-auto pb-[120px] sm:pb-[88px]">
              {messages.length === 0 && !isLoading ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-4 pt-10">
                  <WelcomeTutorial />
                </div>
              ) : (
                <div className="space-y-4 py-4">
                  {messages.map((message, index) => (
                    <ChatMessage
                      key={message.id}
                      message={message}
                      isMobile={isMobile}
                      t={t}
                      highlight={index === focusedMessageIndex}
                      searchTerms={highlightTerms}
                    />
                  ))}
                  {isLoading && (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Updated input area - positioned at base of page, full width */}
            <div className="sticky bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t p-3 sm:p-4 w-full">
              <form onSubmit={handleSubmit} className="flex gap-2 w-full">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={handleInputChange}
                  placeholder={t("Type your legal question...")}
                  className="flex-1 min-h-[44px] sm:min-h-[36px] text-base sm:text-sm"
                />
                <Button 
                  type="submit" 
                  disabled={isSubmitting || !input.trim()} 
                  className="h-11 w-11 sm:h-9 sm:w-9 p-0 flex-shrink-0"
                >
                  <Send className="h-5 w-5 sm:h-4 sm:w-4" />
                </Button>
              </form>

              {user?.isAnonymous && !isTrialLimitReached() && (
                <div className="text-xs text-muted-foreground mt-2">
                  {getTrialConversationsRemaining()} {t("trial conversations remaining")}. 
                  <Button variant="link" className="px-1 py-0 h-auto text-xs" onClick={() => router.push("/sign-up")}>
                    {t("Sign up for unlimited access")}
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Web search tab */}
          <TabsContent value="web" className="flex-1">
            <WebBrowser query={searchQuery} />
          </TabsContent>

          {/* Document analysis tab */}
          <TabsContent value="document" className="flex-1">
            <DocumentAnalysis onAnalysisComplete={handleDocumentAnalysis} />
          </TabsContent>
        </Tabs>
      </TooltipProvider>
    </div>
  );
}
