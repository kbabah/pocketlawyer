"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { MessageSquare, Calendar, Loader2, Trash2, Pencil, MessageCircle, UserPlus, AlertTriangle, User } from "lucide-react" 
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
import { useChatHistory } from "@/hooks/use-chat-history"
import { FeedbackDialog } from "@/components/feedback-dialog"
import { 
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger
} from "@/components/ui/sidebar"
import { toast } from "sonner"
import { useIsMobile } from "@/hooks/use-mobile"

export function AppSidebar() {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<{ date: string; id: string } | null>(null)
  const { user, signOut, getTrialConversationsRemaining } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()
  const { chatHistory, loading, deleteChat, renameChat } = useChatHistory(user?.id)
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const isMobile = useIsMobile()
  const sidebarRef = useRef<HTMLDivElement>(null)
  const [sidebarHeight, setSidebarHeight] = useState<number>(0)

  // Calculate available height for the chat history scrollable area
  useEffect(() => {
    const calculateHeight = () => {
      if (!sidebarRef.current) return;
      
      const headerHeight = sidebarRef.current.querySelector('[data-sidebar-header]')?.clientHeight || 0;
      const footerHeight = sidebarRef.current.querySelector('[data-sidebar-footer]')?.clientHeight || 0;
      const topButtonHeight = 56; // Height of the "Start New Conversation" button
      const trialInfoHeight = user?.isAnonymous ? 120 : 0; // Approximate height of trial info section
      
      // Calculate available space and add some padding
      const availableHeight = window.innerHeight - headerHeight - footerHeight - topButtonHeight - trialInfoHeight - 40;
      
      // Set a minimum height to prevent it from becoming too small
      setSidebarHeight(Math.max(availableHeight, 300));
    };

    calculateHeight();
    
    // Recalculate on resize
    window.addEventListener('resize', calculateHeight);
    return () => window.removeEventListener('resize', calculateHeight);
  }, [user?.isAnonymous]);

  useEffect(() => {
    // Only run on the client side
    if (typeof window !== 'undefined') {
      // Read chatId from URL query parameters to determine current chat
      const params = new URLSearchParams(window.location.search)
      const id = params.get('chatId')
      setCurrentChatId(id)
    }
  }, [typeof window !== 'undefined' && window.location.search])

  const handleNewChat = () => {
    router.push("/")
  }

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
      
      // If current chat was deleted, navigate back to home
      if (typeof window !== 'undefined' && window.location.search.includes(`chatId=${itemToDelete.id}`)) {
        router.push("/")
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
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur py-1.5 px-2 text-xs font-medium text-muted-foreground flex items-center gap-1.5 border-b border-border/30">
            <Calendar className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{format(new Date(date), "MMMM d, yyyy")}</span>
          </div>
          
          <div className="space-y-1.5 mt-1.5 px-1">
            {chats.map((chat) => {
              const isActive = currentChatId === chat.id;
              
              return (
                <div 
                  key={chat.id}
                  className={`group rounded-md transition-colors ${
                    isActive 
                      ? "bg-secondary/80 dark:bg-secondary/30" 
                      : "hover:bg-secondary/40 dark:hover:bg-secondary/20"
                  }`}
                >
                  <div className="flex items-center justify-between px-2 py-2">
                    <div 
                      className="flex-1 flex items-center gap-2 cursor-pointer overflow-hidden"
                      onClick={() => router.push(`/?chatId=${chat.id}`)}
                    >
                      <MessageCircle className="h-4 w-4 flex-shrink-0 text-primary/70" />
                      <span className={`text-sm truncate max-w-[150px] ${isActive ? "font-medium" : ""}`}>
                        {chat.title}
                      </span>
                    </div>
                    
                    <div className={`flex items-center gap-1 ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 flex-shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRenameChat(chat.id, chat.title);
                        }}
                        aria-label={t("Rename Chat")}
                      >
                        <Pencil className="h-3.5 w-3.5 text-blue-500" />
                        <span className="sr-only">{t("Rename Chat")}</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 flex-shrink-0 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                        onClick={(e) => {
                          e.stopPropagation();
                          const chatDate = new Date(chat.timestamp).toISOString().split('T')[0];
                          handleDeleteChat(chatDate, chat.id);
                        }}
                        aria-label={t("Delete Chat")}
                        title={t("Delete Chat")}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-red-500" />
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
      <Sidebar ref={sidebarRef} className="overflow-hidden">
        <SidebarHeader data-sidebar-header className="border-b border-border/60">
          <div className="flex items-center justify-between px-3 py-3">
            <div className="flex items-center gap-2 overflow-hidden">
              <SidebarTrigger className="text-primary h-5 w-5 flex-shrink-0" />
              <div className="max-w-[140px] overflow-hidden">
                <ThemeLogo 
                  width={isMobile ? 150 : 250} 
                  height={100} 
                  darkLogoPath="/dark-logo.png" 
                  lightLogoPath="/light-logo.png" 
                  className="flex-shrink-0"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeSwitcher isWelcomePage={false} className="h-8 w-8" />
            </div>
          </div>
        </SidebarHeader>
        
        <SidebarContent className="px-2.5 py-2.5">
          <Button
            variant="outline"
            className="w-full justify-start gap-2 mb-3 py-2"
            onClick={handleNewChat}
            size="sm"
          >
            <MessageSquare className="h-4 w-4 text-primary flex-shrink-0" />
            <span className="font-medium truncate">{t("Start New Conversation")}</span>
          </Button>

          {user?.isAnonymous && (
            <div className="mb-4 p-3 border border-amber-200 dark:border-amber-700/60 bg-amber-50 dark:bg-amber-900/20 rounded-md shadow-sm">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-sm flex-1 overflow-hidden">
                  <p className="font-medium text-amber-700 dark:text-amber-400 truncate">
                    {t("Trial Access")}
                  </p>
                  <p className="text-xs text-amber-600 dark:text-amber-300/90 mt-1 mb-2 truncate">
                    {`${getTrialConversationsRemaining()} ${t('trial.conversations')}`}
                  </p>
                  <Button size="sm" onClick={() => router.push("/sign-up")} className="w-full h-8 font-medium text-xs">
                    <UserPlus className="h-3 w-3 mr-1.5" />
                    {t("Create Free Account")}
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="relative">
            <ScrollArea 
              className="pr-1 overflow-auto" 
              style={{ height: `${sidebarHeight}px` }}
            >
              {renderChatHistory()}
            </ScrollArea>
          </div>
        </SidebarContent>

        <SidebarFooter data-sidebar-footer className="border-t border-border/60 mt-auto">
          <div className="flex flex-col gap-2 p-2.5">
            <div className="flex items-center justify-between">
              <FeedbackDialog /> 
            </div>
            
            <div className="flex items-center gap-2">
              {user?.isAnonymous ? (
                <Button 
                  variant="outline" 
                  className="flex-1 justify-start gap-2 py-1.5 h-9 text-sm" 
                  onClick={() => router.push("/sign-up")}
                >
                  <UserPlus className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-left font-medium">
                    {t("Create Account") || "Create Account"}
                  </span>
                </Button>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex-1 justify-start gap-2 py-1.5 h-9 text-sm">
                      <Avatar className="h-5 w-5 flex-shrink-0">
                        <AvatarImage src={user?.profileImage || ""} alt={user?.name || "User"} />
                        <AvatarFallback>{getUserInitials()}</AvatarFallback>
                      </Avatar>
                      <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-left truncate">
                        {user?.name || t("auth_signin")}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[220px]">
                    {user ? (
                      <>
                        <DropdownMenuItem className="flex-col items-start px-3 py-2">
                          <div className="font-medium truncate w-full">{user.name}</div>
                          <div className="text-sm text-muted-foreground mt-0.5 truncate w-full">{user.email}</div>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onSelect={() => router.push("/profile")} className="gap-2">
                          <User className="h-4 w-4" />
                          {t("Profile Settings")}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onSelect={handleSignOut} className="gap-2 text-red-500">
                          <Trash2 className="h-3.5 w-3.5" />
                          {t("Sign Out")}
                        </DropdownMenuItem>
                      </>
                    ) : (
                      <DropdownMenuItem onSelect={() => router.push("/sign-in")}>
                        {t("auth_signin")}
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="max-w-[350px] sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("Delete Conversation")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("Are you sure you want to delete this conversation? This action cannot be undone.")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <AlertDialogCancel className="mt-0">
              {t("Cancel")}
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              {t("Delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
