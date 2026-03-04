"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { MessageSquare, Calendar, Loader2, Trash2, Pencil, MessageCircle, UserPlus, AlertTriangle, User, FileText, Home, Scale, Briefcase, Settings, BookOpen, ChevronDown, ChevronRight, Search, Database } from "lucide-react"
import { format } from "date-fns"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { ThemeLogo } from "@/components/theme-logo"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useChatHistory } from "@/hooks/use-chat-history"
import { FeedbackDialog } from "@/components/feedback-dialog"
import { QuickActions } from "@/components/quick-actions"
import { useRoleCheck } from "@/hooks/use-role-check"
import { 
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  useSidebar
} from "@/components/ui/sidebar"
import { toast } from "sonner"
import { useIsMobile } from "@/hooks/use-mobile"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"

export function AppSidebar() {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<{ date: string; id: string } | null>(null)
  const { user, signOut, getTrialConversationsRemaining } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()
  const { chatHistory, loading, deleteChat, renameChat } = useChatHistory(user?.id)
  const { isAdmin, isApprovedLawyer } = useRoleCheck()
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const isMobile = useIsMobile()
  const { toggleSidebar, openMobile, setOpenMobile } = useSidebar()
  const sidebarRef = useRef<HTMLDivElement>(null)
  const [sidebarHeight, setSidebarHeight] = useState<number>(0)
  const [userChatsCount, setUserChatsCount] = useState(0)
  const [userBookingsCount, setUserBookingsCount] = useState(0)
  const [loadingMetrics, setLoadingMetrics] = useState(false)
  const [chatHistoryExpanded, setChatHistoryExpanded] = useState(false)

  // Mobile navigation enhancements
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const [isPullToRefresh, setIsPullToRefresh] = useState(false)
  const [refreshOffset, setRefreshOffset] = useState(0)

  // Minimum distance for swipe gesture (in pixels)
  const minSwipeDistance = 50

  // Touch handlers for mobile swipe navigation
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!isMobile) return
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }, [isMobile])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isMobile || !touchStart) return
    setTouchEnd(e.targetTouches[0].clientX)
    
    // Handle pull-to-refresh gesture
    const currentTouch = e.targetTouches[0].clientY
    if (window.scrollY === 0 && currentTouch > 0) {
      const offset = Math.min(currentTouch, 100)
      setRefreshOffset(offset)
      if (offset > 60) {
        setIsPullToRefresh(true)
      }
    }
  }, [isMobile, touchStart])

  const handleTouchEnd = useCallback(() => {
    if (!isMobile || !touchStart || !touchEnd) return

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    // Directional swipe: left swipe closes if open, right swipe opens if closed
    if (isLeftSwipe && openMobile) {
      setOpenMobile(false)
    } else if (isRightSwipe && !openMobile) {
      setOpenMobile(true)
    }

    // Reset pull-to-refresh
    if (isPullToRefresh) {
      setIsPullToRefresh(false)
    }
    setRefreshOffset(0)
  }, [isMobile, touchStart, touchEnd, openMobile, setOpenMobile, isPullToRefresh])

  // Add touch event listeners for mobile swipe navigation
  useEffect(() => {
    if (!isMobile) return

    const handleTouchStartPassive = (e: TouchEvent) => handleTouchStart(e)
    const handleTouchMovePassive = (e: TouchEvent) => handleTouchMove(e)
    const handleTouchEndPassive = () => handleTouchEnd()

    document.addEventListener('touchstart', handleTouchStartPassive, { passive: true })
    document.addEventListener('touchmove', handleTouchMovePassive, { passive: true })
    document.addEventListener('touchend', handleTouchEndPassive, { passive: true })

    return () => {
      document.removeEventListener('touchstart', handleTouchStartPassive)
      document.removeEventListener('touchmove', handleTouchMovePassive)
      document.removeEventListener('touchend', handleTouchEndPassive)
    }
  }, [isMobile, handleTouchStart, handleTouchMove, handleTouchEnd])

  // Calculate available height for the chat history scrollable area
  useEffect(() => {
    const calculateHeight = () => {
      if (!sidebarRef.current) return;
      
      const headerHeight = sidebarRef.current.querySelector('[data-sidebar-header]')?.clientHeight || 0;
      const footerHeight = sidebarRef.current.querySelector('[data-sidebar-footer]')?.clientHeight || 0;
      const topButtonHeight = isMobile ? 64 : 56; // Larger on mobile
      const trialInfoHeight = user?.isAnonymous ? (isMobile ? 140 : 120) : 0;
      
      const availableHeight = window.innerHeight - headerHeight - footerHeight - topButtonHeight - trialInfoHeight - (isMobile ? 50 : 40);
      setSidebarHeight(Math.max(availableHeight, isMobile ? 250 : 300));
    };

    calculateHeight();
    window.addEventListener('resize', calculateHeight);
    return () => window.removeEventListener('resize', calculateHeight);
  }, [user?.isAnonymous, isMobile]);

  useEffect(() => {
    // Only run on the client side
    if (typeof window !== 'undefined') {
      // Read chatId from URL query parameters to determine current chat
      const params = new URLSearchParams(window.location.search)
      const id = params.get('chatId')
      setCurrentChatId(id)
    }
  }, [typeof window !== 'undefined' && window.location.search])

  // Fetch user-specific metrics
  useEffect(() => {
    if (!user || user.isAnonymous) {
      setUserChatsCount(0)
      setUserBookingsCount(0)
      return
    }

    const fetchUserMetrics = async () => {
      setLoadingMetrics(true)
      try {
        // Fetch user's chat count from root chats collection
        const chatsRef = collection(db, "chats")
        const chatsQuery = query(chatsRef, where("userId", "==", user.id))
        const chatsSnapshot = await getDocs(chatsQuery)
        setUserChatsCount(chatsSnapshot.size)

        // Fetch user's booking count
        const bookingsRef = collection(db, "bookings")
        const bookingsQuery = query(bookingsRef, where("userId", "==", user.id))
        const bookingsSnapshot = await getDocs(bookingsQuery)
        setUserBookingsCount(bookingsSnapshot.size)
      } catch (error) {
        console.error("Error fetching user metrics:", error)
        setUserChatsCount(0)
        setUserBookingsCount(0)
      } finally {
        setLoadingMetrics(false)
      }
    }

    fetchUserMetrics()
  }, [user])

  const handleDeleteChat = (date: string, id: string) => {
    setItemToDelete({ date, id })
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!itemToDelete) return
    try {
      await deleteChat(itemToDelete.id)
      setDeleteDialogOpen(false)
      setItemToDelete(null)
      
      // If current chat was deleted, navigate back to chat page
      if (typeof window !== 'undefined' && window.location.search.includes(`chatId=${itemToDelete.id}`)) {
        router.push("/chat")
      }
      toast.success(t("Chat deleted successfully"))
    } catch (error) {
      console.error('Error deleting chat:', error)
      toast.error(t("Failed to delete chat"))
    }
  }

  const handleRenameChat = async (id: string, currentTitle: string) => {
    const newTitle = prompt(t("Enter new chat name:"), currentTitle);
    if (newTitle && newTitle.trim() !== currentTitle) {
      try {
        await renameChat(id, newTitle.trim());
        toast.success(t("Chat renamed successfully"));
      } catch (error) {
        console.error('Error renaming chat:', error);
        toast.error(t("Failed to rename chat"));
      }
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push("/welcome")
    } catch (error) {
      console.error("Sign out error:", error)
    }
  }

  const getUserInitials = () => {
    if (!user?.name) return "U"
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const renderChatHistory = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      );
    }
    
    if (Object.keys(chatHistory).length === 0) {
      return (
        <div className="p-4 text-center text-muted-foreground">
          <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-50" />
          <p className="font-medium mb-1">{t("No History")}</p>
          <p className="text-sm">{t("Start Conversation")}</p>
        </div>
      );
    }
    
    return Object.entries(chatHistory)
      .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
      .map(([date, chats], dateIndex) => (
        <div key={date} className="mb-3">
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur py-2 px-2 text-xs font-medium text-muted-foreground flex items-center gap-1.5 border-b border-border/30">
            <Calendar className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{format(new Date(date), "MMMM d, yyyy")}</span>
          </div>
          
          <div className="space-y-2 mt-2 px-1">
            {chats.map((chat) => {
              const isActive = currentChatId === chat.id;
              
              return (
                <div 
                  key={chat.id}
                  className={`group rounded-lg transition-all duration-200 ${
                    isActive 
                      ? "bg-secondary/80 dark:bg-secondary/30 shadow-sm" 
                      : "hover:bg-secondary/40 dark:hover:bg-secondary/20"
                  } ${isMobile ? 'active:scale-95' : ''}`}
                >
                  <div className={`flex items-center justify-between px-3 py-3 ${isMobile ? 'min-h-[52px]' : 'py-2'}`}>
                    <div 
                      className="flex-1 flex items-center gap-2 cursor-pointer overflow-hidden"
                      onClick={() => {
                        router.push(`/chat?chatId=${chat.id}`)
                        if (isMobile) {
                          // Auto-close sidebar on mobile after selection
                          setTimeout(() => toggleSidebar(), 150)
                        }
                      }}
                    >
                      <MessageCircle className={`flex-shrink-0 text-primary/70 ${isMobile ? 'h-5 w-5' : 'h-4 w-4'}`} />
                      <span className={`truncate max-w-[140px] ${isActive ? "font-medium" : ""} ${isMobile ? 'text-base' : 'text-sm'}`}>
                        {chat.title}
                      </span>
                    </div>
                    
                    <div className={`flex items-center gap-1 ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"} ${isMobile ? 'opacity-100' : ''}`}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`flex-shrink-0 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 ${isMobile ? 'h-9 w-9 touch-manipulation' : 'h-7 w-7'}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRenameChat(chat.id, chat.title);
                        }}
                        aria-label={t("Rename Chat")}
                      >
                        <Pencil className={`text-blue-500 ${isMobile ? 'h-4 w-4' : 'h-3.5 w-3.5'}`} />
                        <span className="sr-only">{t("Rename Chat")}</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`flex-shrink-0 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 ${isMobile ? 'h-9 w-9 touch-manipulation' : 'h-7 w-7'}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          const chatDate = new Date(chat.timestamp).toISOString().split('T')[0];
                          handleDeleteChat(chatDate, chat.id);
                        }}
                        aria-label={t("Delete Chat")}
                        title={t("Delete Chat")}
                      >
                        <Trash2 className={`text-red-500 ${isMobile ? 'h-4 w-4' : 'h-3.5 w-3.5'}`} />
                        <span className="sr-only">{t("Delete Chat")}</span>
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ));
  };

  return (
    <>
      {/* Pull-to-refresh indicator for mobile */}
      {isMobile && refreshOffset > 0 && (
        <div 
          className="fixed top-0 left-0 right-0 z-50 bg-primary/10 backdrop-blur-sm transition-all"
          style={{ height: `${refreshOffset}px` }}
        >
          <div className="flex items-center justify-center h-full">
            <div className={`transition-all ${isPullToRefresh ? 'rotate-180' : ''}`}>
              ↓
            </div>
          </div>
        </div>
      )}

      <Sidebar ref={sidebarRef} className="overflow-hidden">
        <SidebarHeader data-sidebar-header className="border-b border-border/60">
          <div className={`flex items-center justify-between ${isMobile ? 'px-4 py-4' : 'px-3 py-3'}`}>
            <div className="flex items-center gap-2 overflow-hidden">
              <SidebarTrigger className={`text-primary flex-shrink-0 touch-manipulation ${isMobile ? 'h-6 w-6' : 'h-5 w-5'}`} />
              <div className={`overflow-hidden ${isMobile ? 'max-w-[160px]' : 'max-w-[140px]'}`}>
                <ThemeLogo 
                  width={isMobile ? 160 : 250} 
                  height={100} 
                  darkLogoPath="/dark-logo.png" 
                  lightLogoPath="/light-logo.png" 
                  className="flex-shrink-0"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <ThemeSwitcher 
                isWelcomePage={false} 
                className={`touch-manipulation ${isMobile ? 'h-10 w-10' : 'h-8 w-8'}`} 
              />
            </div>
          </div>
        </SidebarHeader>
        
        <SidebarContent className={isMobile ? "px-3 py-3" : "px-2 py-2.5"}>
          {/* Chat Section - Moved to top */}
          <div className={isMobile ? "mb-5" : "mb-4"}>
            <div className={`px-2 ${isMobile ? 'py-2' : 'py-1'}`}>
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t("Chat")}
              </h4>
            </div>
            <Button
              variant="outline"
              className={`w-full justify-start gap-2 touch-manipulation font-medium ${
                isMobile 
                  ? 'py-4 text-base min-h-[52px] px-3 mb-3' 
                  : 'py-3 sm:py-2.5 text-base sm:text-sm min-h-[46px] sm:min-h-[40px] mb-2'
              }`}
              onClick={() => {
                router.push("/chat")
                if (isMobile) setTimeout(() => toggleSidebar(), 150)
              }}
            >
              <MessageSquare className={`text-primary flex-shrink-0 ${isMobile ? 'h-5 w-5' : 'h-5 w-5 sm:h-4 sm:w-4'}`} />
              <span className="truncate">{t("Start New Conversation")}</span>
            </Button>

            {/* Chat History Dropdown - Only for authenticated users */}
            {user && !user.isAnonymous && (
              <div>
                <Button
                  variant="ghost"
                  className={`w-full justify-between gap-2 touch-manipulation font-medium ${
                    isMobile 
                      ? 'py-3 text-sm min-h-[44px] px-3' 
                      : 'py-2.5 text-sm min-h-[40px]'
                  }`}
                  onClick={() => setChatHistoryExpanded(!chatHistoryExpanded)}
                >
                  <span className="flex items-center gap-2">
                    <MessageCircle className={`flex-shrink-0 ${isMobile ? 'h-4 w-4' : 'h-4 w-4'}`} />
                    <span className="truncate">{t("Chat History")}</span>
                  </span>
                  {chatHistoryExpanded ? (
                    <ChevronDown className={`flex-shrink-0 ${isMobile ? 'h-4 w-4' : 'h-4 w-4'}`} />
                  ) : (
                    <ChevronRight className={`flex-shrink-0 ${isMobile ? 'h-4 w-4' : 'h-4 w-4'}`} />
                  )}
                </Button>

                {/* Collapsible Chat History */}
                {chatHistoryExpanded && (
                  <div className="mt-2">
                    <ScrollArea 
                      className={`overflow-auto mobile-scroll ${isMobile ? 'pr-2' : 'pr-1'}`}
                      style={{ maxHeight: `${Math.min(sidebarHeight, 300)}px` }}
                    >
                      {renderChatHistory()}
                    </ScrollArea>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Navigation Section */}
          <div className={`space-y-1 ${isMobile ? 'mb-5' : 'mb-4'}`}>
            <div className={`px-2 ${isMobile ? 'py-2' : 'py-1'}`}>
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t("Navigation")}
              </h4>
            </div>
            
            <Button
              variant="ghost"
              className={`w-full justify-start gap-2 touch-manipulation font-medium ${
                isMobile 
                  ? 'py-4 text-base min-h-[52px] px-3' 
                  : 'py-3 sm:py-2.5 text-base sm:text-sm min-h-[46px] sm:min-h-[40px]'
              }`}
              onClick={() => {
                router.push("/")
                if (isMobile) setTimeout(() => toggleSidebar(), 150)
              }}
            >
              <Home className={`text-muted-foreground flex-shrink-0 ${isMobile ? 'h-5 w-5' : 'h-5 w-5 sm:h-4 sm:w-4'}`} />
              <span className="truncate">{t("Home")}</span>
            </Button>
            
            <Button
              variant="ghost"
              className={`w-full justify-start gap-2 touch-manipulation font-medium ${
                isMobile 
                  ? 'py-4 text-base min-h-[52px] px-3' 
                  : 'py-3 sm:py-2.5 text-base sm:text-sm min-h-[46px] sm:min-h-[40px]'
              }`}
              onClick={() => {
                router.push("/documents")
                if (isMobile) setTimeout(() => toggleSidebar(), 150)
              }}
            >
              <FileText className={`text-muted-foreground flex-shrink-0 ${isMobile ? 'h-5 w-5' : 'h-5 w-5 sm:h-4 sm:w-4'}`} />
              <span className="truncate">{t("Documents")}</span>
            </Button>

            <Button
              variant="ghost"
              className={`w-full justify-start gap-2 touch-manipulation font-medium ${
                isMobile 
                  ? 'py-4 text-base min-h-[52px] px-3' 
                  : 'py-3 sm:py-2.5 text-base sm:text-sm min-h-[46px] sm:min-h-[40px]'
              }`}
              onClick={() => {
                router.push("/legal-research")
                if (isMobile) setTimeout(() => toggleSidebar(), 150)
              }}
            >
              <Search className={`text-muted-foreground flex-shrink-0 ${isMobile ? 'h-5 w-5' : 'h-5 w-5 sm:h-4 sm:w-4'}`} />
              <span className="truncate">{t("Legal Research")}</span>
            </Button>

            <Button
              variant="ghost"
              className={`w-full justify-start gap-2 touch-manipulation font-medium ${
                isMobile 
                  ? 'py-4 text-base min-h-[52px] px-3' 
                  : 'py-3 sm:py-2.5 text-base sm:text-sm min-h-[46px] sm:min-h-[40px]'
              }`}
              onClick={() => {
                router.push("/case-review")
                if (isMobile) setTimeout(() => toggleSidebar(), 150)
              }}
            >
              <BookOpen className={`text-muted-foreground flex-shrink-0 ${isMobile ? 'h-5 w-5' : 'h-5 w-5 sm:h-4 sm:w-4'}`} />
              <span className="truncate">{t("Case Review")}</span>
            </Button>

            <Button
              variant="ghost"
              className={`w-full justify-start gap-2 touch-manipulation font-medium ${
                isMobile 
                  ? 'py-4 text-base min-h-[52px] px-3' 
                  : 'py-3 sm:py-2.5 text-base sm:text-sm min-h-[46px] sm:min-h-[40px]'
              }`}
              onClick={() => {
                router.push("/draft-contract")
                if (isMobile) setTimeout(() => toggleSidebar(), 150)
              }}
            >
              <FileText className={`text-muted-foreground flex-shrink-0 ${isMobile ? 'h-5 w-5' : 'h-5 w-5 sm:h-4 sm:w-4'}`} />
              <span className="truncate">{t("Draft Contract")}</span>
            </Button>
            
            <Button
              variant="ghost"
              className={`w-full justify-start gap-2 touch-manipulation font-medium ${
                isMobile 
                  ? 'py-4 text-base min-h-[52px] px-3' 
                  : 'py-3 sm:py-2.5 text-base sm:text-sm min-h-[46px] sm:min-h-[40px]'
              }`}
              onClick={() => {
                router.push("/lawyers")
                if (isMobile) setTimeout(() => toggleSidebar(), 150)
              }}
            >
              <Scale className={`text-muted-foreground flex-shrink-0 ${isMobile ? 'h-5 w-5' : 'h-5 w-5 sm:h-4 sm:w-4'}`} />
              <span className="truncate">{t("Find a Lawyer")}</span>
            </Button>

            <Button
              variant="ghost"
              className={`w-full justify-start gap-2 touch-manipulation font-medium ${
                isMobile 
                  ? 'py-4 text-base min-h-[52px] px-3' 
                  : 'py-3 sm:py-2.5 text-base sm:text-sm min-h-[46px] sm:min-h-[40px]'
              }`}
              onClick={() => {
                router.push("/blog")
                if (isMobile) setTimeout(() => toggleSidebar(), 150)
              }}
            >
              <BookOpen className={`text-muted-foreground flex-shrink-0 ${isMobile ? 'h-5 w-5' : 'h-5 w-5 sm:h-4 sm:w-4'}`} />
              <span className="truncate">{t("Blog")}</span>
            </Button>

            {user && !user.isAnonymous && (
              <Button
                variant="ghost"
                className={`w-full justify-start gap-2 touch-manipulation font-medium ${
                  isMobile 
                    ? 'py-4 text-base min-h-[52px] px-3' 
                    : 'py-3 sm:py-2.5 text-base sm:text-sm min-h-[46px] sm:min-h-[40px]'
                }`}
                onClick={() => {
                  router.push("/bookings")
                  if (isMobile) setTimeout(() => toggleSidebar(), 150)
                }}
              >
                <Calendar className={`text-muted-foreground flex-shrink-0 ${isMobile ? 'h-5 w-5' : 'h-5 w-5 sm:h-4 sm:w-4'}`} />
                <span className="truncate">{t("My Bookings")}</span>
              </Button>
            )}

            {isApprovedLawyer && (
              <Button
                variant="ghost"
                className={`w-full justify-start gap-2 touch-manipulation font-medium ${
                  isMobile 
                    ? 'py-4 text-base min-h-[52px] px-3' 
                    : 'py-3 sm:py-2.5 text-base sm:text-sm min-h-[46px] sm:min-h-[40px]'
                }`}
                onClick={() => {
                  router.push("/lawyer/dashboard")
                  if (isMobile) setTimeout(() => toggleSidebar(), 150)
                }}
              >
                <Briefcase className={`text-muted-foreground flex-shrink-0 ${isMobile ? 'h-5 w-5' : 'h-5 w-5 sm:h-4 sm:w-4'}`} />
                <span className="truncate">{t("Lawyer Dashboard")}</span>
              </Button>
            )}

            {isAdmin && (
              <Button
                variant="ghost"
                className={`w-full justify-start gap-2 touch-manipulation font-medium ${
                  isMobile
                    ? 'py-4 text-base min-h-[52px] px-3'
                    : 'py-3 sm:py-2.5 text-base sm:text-sm min-h-[46px] sm:min-h-[40px]'
                }`}
                onClick={() => {
                  router.push("/admin")
                  if (isMobile) setTimeout(() => toggleSidebar(), 150)
                }}
              >
                <Settings className={`text-muted-foreground flex-shrink-0 ${isMobile ? 'h-5 w-5' : 'h-5 w-5 sm:h-4 sm:w-4'}`} />
                <span className="truncate">{t("Admin Dashboard")}</span>
              </Button>
            )}

            {isAdmin && (
              <Button
                variant="ghost"
                className={`w-full justify-start gap-2 touch-manipulation font-medium ${
                  isMobile
                    ? 'py-4 text-base min-h-[52px] px-3'
                    : 'py-3 sm:py-2.5 text-base sm:text-sm min-h-[46px] sm:min-h-[40px]'
                }`}
                onClick={() => {
                  router.push("/admin/knowledge-base")
                  if (isMobile) setTimeout(() => toggleSidebar(), 150)
                }}
              >
                <Database className={`text-muted-foreground flex-shrink-0 ${isMobile ? 'h-5 w-5' : 'h-5 w-5 sm:h-4 sm:w-4'}`} />
                <span className="truncate">{t("Knowledge Base")}</span>
              </Button>
            )}
          </div>

          {/* Quick Actions Section */}
          <div className={isMobile ? "mb-5" : "mb-4"}>
            <QuickActions />
          </div>

          {/* Metrics Section - Only for authenticated users */}
          {user && !user.isAnonymous && (
            <div className={isMobile ? "mb-5" : "mb-4"}>
              <div className={`px-2 ${isMobile ? 'py-2 mb-3' : 'py-1 mb-2'}`}>
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t("Metrics")}
                </h4>
              </div>
              
              <div className="space-y-2 px-1">
                <div className="px-3 py-2 bg-secondary/40 dark:bg-secondary/20 rounded-lg border border-border/40">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground font-medium">{t("CHATS")}</span>
                    <MessageSquare className="h-3 w-3 text-blue-400" />
                  </div>
                  <p className="text-lg font-bold">
                    {loadingMetrics ? "..." : userChatsCount}
                  </p>
                </div>
                
                <div className="px-3 py-2 bg-secondary/40 dark:bg-secondary/20 rounded-lg border border-border/40">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground font-medium">{t("BOOKINGS")}</span>
                    <Calendar className="h-3 w-3 text-purple-400" />
                  </div>
                  <p className="text-lg font-bold">
                    {loadingMetrics ? "..." : userBookingsCount}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Trial Info - Enhanced for mobile */}
          {user?.isAnonymous && (
            <div className={`border border-amber-200 dark:border-amber-700/60 bg-amber-50 dark:bg-amber-900/20 rounded-lg shadow-sm ${
              isMobile ? 'mb-5 p-4' : 'mb-4 p-3'
            }`}>
              <div className="flex items-start gap-2">
                <AlertTriangle className={`text-amber-500 shrink-0 mt-0.5 ${isMobile ? 'h-5 w-5' : 'h-5 w-5 sm:h-4 sm:w-4'}`} />
                <div className="flex-1 overflow-hidden">
                  <p className={`font-medium text-amber-700 dark:text-amber-400 truncate ${isMobile ? 'text-base' : 'text-sm'}`}>
                    {t("Trial Access")}
                  </p>
                  <p className={`text-amber-600 dark:text-amber-300/90 mt-1 mb-2 truncate ${isMobile ? 'text-sm' : 'text-xs'}`}>
                    {`${getTrialConversationsRemaining()} ${t('trial.conversations')}`}
                  </p>
                  <Button 
                    size="sm" 
                    onClick={() => {
                      router.push("/sign-up")
                      if (isMobile) setTimeout(() => toggleSidebar(), 150)
                    }}
                    className={`w-full font-medium touch-manipulation ${
                      isMobile ? 'h-11 text-sm' : 'h-10 sm:h-9 text-sm'
                    }`}
                  >
                    <UserPlus className="h-4 w-4 mr-1.5" />
                    {t("Create Free Account")}
                  </Button>
                </div>
              </div>
            </div>
          )}

        </SidebarContent>

        <SidebarFooter data-sidebar-footer className={`border-t border-border/60 mt-auto ${isMobile ? 'p-3' : 'p-2.5'}`}>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <FeedbackDialog /> 
            </div>
            
            <div className="flex items-center gap-2">
              {user?.isAnonymous ? (
                <Button 
                  variant="outline" 
                  className={`flex-1 justify-start gap-2 font-medium touch-manipulation ${
                    isMobile 
                      ? 'py-3 h-12 text-base px-3' 
                      : 'py-2.5 h-11 sm:h-9 text-base sm:text-sm'
                  }`}
                  onClick={() => {
                    router.push("/sign-up")
                    if (isMobile) setTimeout(() => toggleSidebar(), 150)
                  }}
                >
                  <UserPlus className={`flex-shrink-0 ${isMobile ? 'h-5 w-5' : 'h-5 w-5 sm:h-4 sm:w-4'}`} />
                  <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-left">
                    {t("Create Account")}
                  </span>
                </Button>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      className={`flex-1 justify-start gap-2 touch-manipulation ${
                        isMobile 
                          ? 'py-3 h-12 text-base px-3' 
                          : 'py-2.5 h-11 sm:h-9 text-base sm:text-sm'
                      }`}
                    >
                      <Avatar className={`flex-shrink-0 ${isMobile ? 'h-6 w-6' : 'h-6 w-6 sm:h-5 sm:w-5'}`}>
                        <AvatarImage src={user?.profileImage || ""} alt={user?.name || "User"} />
                        <AvatarFallback>{getUserInitials()}</AvatarFallback>
                      </Avatar>
                      <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-left truncate">
                        {user?.name || t("auth_signin")}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className={isMobile ? "w-[260px]" : "w-[220px]"}>
                    <DropdownMenuItem className={`flex-col items-start ${isMobile ? 'px-4 py-3' : 'px-3 py-2'}`}>
                      <div className="font-medium truncate w-full">{user?.name || t("Guest User")}</div>
                      <div className={`text-muted-foreground mt-0.5 truncate w-full ${isMobile ? 'text-sm' : 'text-sm'}`}>
                        {user?.email || t("No email")}
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onSelect={() => {
                        router.push("/profile")
                        if (isMobile) setTimeout(() => toggleSidebar(), 150)
                      }} 
                      className={`gap-2 touch-manipulation ${isMobile ? 'py-3' : 'py-2.5'}`}
                    >
                      <User className="h-4 w-4" />
                      {t("Profile Settings")}
                    </DropdownMenuItem>
                    
                    {/* Show "Register as Lawyer" only to non-lawyers */}
                    {!isApprovedLawyer && (
                      <DropdownMenuItem 
                        onSelect={() => {
                          router.push("/lawyers/register")
                          if (isMobile) setTimeout(() => toggleSidebar(), 150)
                        }} 
                        className={`gap-2 touch-manipulation ${isMobile ? 'py-3' : 'py-2.5'}`}
                      >
                        <Scale className="h-4 w-4" />
                        {t("Register as Lawyer")}
                      </DropdownMenuItem>
                    )}
                    
                    {/* Show "Lawyer Dashboard" only to approved lawyers */}
                    {isApprovedLawyer && (
                      <DropdownMenuItem 
                        onSelect={() => {
                          router.push("/lawyer/dashboard")
                          if (isMobile) setTimeout(() => toggleSidebar(), 150)
                        }} 
                        className={`gap-2 touch-manipulation ${isMobile ? 'py-3' : 'py-2.5'}`}
                      >
                        <Briefcase className="h-4 w-4" />
                        {t("Lawyer Dashboard")}
                      </DropdownMenuItem>
                    )}
                    
                    {/* Show "Admin Dashboard" only to admin users */}
                    {isAdmin && (
                      <DropdownMenuItem 
                        onSelect={() => {
                          router.push("/admin")
                          if (isMobile) setTimeout(() => toggleSidebar(), 150)
                        }} 
                        className={`gap-2 touch-manipulation ${isMobile ? 'py-3' : 'py-2.5'}`}
                      >
                        <Settings className="h-4 w-4" />
                        {t("Admin Dashboard")}
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onSelect={handleSignOut} 
                      className={`gap-2 text-red-500 touch-manipulation ${isMobile ? 'py-3' : 'py-2.5'}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      {t("Sign Out")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>

      {/* Enhanced mobile delete dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className={isMobile ? "max-w-[90vw] mx-4" : "max-w-[350px] sm:max-w-md"}>
          <AlertDialogHeader>
            <AlertDialogTitle className={isMobile ? "text-lg" : ""}>
              {t("Delete Conversation")}
            </AlertDialogTitle>
            <AlertDialogDescription className={isMobile ? "text-base" : ""}>
              {t("Are you sure you want to delete this conversation? This action cannot be undone.")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className={`${isMobile ? 'flex-col gap-3' : 'flex-col sm:flex-row gap-2 sm:gap-0'}`}>
            <AlertDialogCancel className={`mt-0 touch-manipulation ${isMobile ? 'h-12 text-base' : 'h-11 sm:h-10'}`}>
              {t("Cancel")}
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              className={`bg-red-600 hover:bg-red-700 touch-manipulation ${isMobile ? 'h-12 text-base' : 'h-11 sm:h-10'}`}
            >
              {t("Delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
