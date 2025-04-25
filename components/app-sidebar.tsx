"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Scale, MessageSquare, Calendar, Loader2, Trash2, Pencil, MessageCircle } from "lucide-react" // Add MessageCircle icon for feedback
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
import { LanguageSwitcher } from "@/components/language-switcher"
import { ThemeSwitcher } from "@/components/theme-switcher" // Import ThemeSwitcher
import { useChatHistory } from "@/hooks/use-chat-history"
import { FeedbackDialog } from "@/components/feedback-dialog" // Import FeedbackDialog
import { 
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger
} from "@/components/ui/sidebar"
import { toast } from "sonner"

export function AppSidebar() {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<{ date: string; id: string } | null>(null)
  const { user, signOut } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()
  const { chatHistory, loading, deleteChat, renameChat } = useChatHistory(user?.id) // Add renameChat

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
      
      // If we're currently viewing the deleted chat, redirect to home
      if (window.location.pathname === `/chat/${itemToDelete.id}`) {
        router.push("/")
      }
      toast.success(t("chat.deleted"))
    } catch (error) {
      console.error('Error deleting chat:', error)
      toast.error(t("chat.error.deleting"))
    }
  }

  const handleRenameChat = async (id: string, currentTitle: string) => {
    const newTitle = prompt(t("sidebar.rename.prompt") || "Enter new chat name:", currentTitle);
    if (newTitle && newTitle.trim() !== currentTitle) {
      try {
        await renameChat(id, newTitle.trim());
        toast.success(t("sidebar.rename.success") || "Chat renamed successfully");
      } catch (error) {
        console.error('Error renaming chat:', error);
        toast.error(t("sidebar.rename.error") || "Failed to rename chat");
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

  return (
    <>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <h2 className="text-lg font-semibold flex items-center">
                PocketLawyer <span className="ml-1">🇨🇲</span>
              </h2>
            </div>
            <div className="flex items-center gap-1">
              <ThemeSwitcher /> {/* Keep only theme switcher */}
            </div>
          </div>
        </SidebarHeader>
        
        <SidebarContent>
          <Button
            variant="outline"
            className="w-full justify-start gap-2 mb-2 mx-2"
            onClick={handleNewChat}
          >
            <MessageSquare className="h-4 w-4" />
            {t("sidebar.new.chat")}
          </Button>

          <ScrollArea className="flex-1">
            {loading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : Object.keys(chatHistory).length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>{t("sidebar.no.history")}</p>
                <p className="text-sm">{t("sidebar.start.conversation")}</p>
              </div>
            ) : (
              Object.entries(chatHistory)
                .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
                .map(([date, chats]) => (
                  <div key={date} className="border-b border-primary/10">
                    <div className="flex items-center gap-2 p-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(date), "MMMM d, yyyy")}
                    </div>
                    {chats.map((chat) => (
                      <div key={chat.id} className="px-2 py-1">
                        {/* Restructured chat item with flex layout */}
                        <div className="flex items-center justify-between rounded-md hover:bg-muted transition-colors">
                          {/* Chat title - clickable area */}
                          <div 
                            className="flex-1 pl-2 py-1.5 cursor-pointer overflow-hidden"
                            onClick={() => router.push(`/chat/${chat.id}`)}
                          >
                            <span className="text-sm font-medium truncate block">{chat.title}</span>
                          </div>
                          
                          {/* Action buttons - always visible */}
                          <div className="flex items-center pr-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRenameChat(chat.id, chat.title);
                              }}
                              aria-label={t("sidebar.rename.chat") || "Rename chat"}
                            >
                              <Pencil className="h-3.5 w-3.5 text-blue-500" />
                              <span className="sr-only">{t("sidebar.rename.chat") || "Rename chat"}</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={(e) => {
                                e.stopPropagation();
                                const chatDate = new Date(chat.timestamp).toISOString().split('T')[0];
                                handleDeleteChat(chatDate, chat.id);
                              }}
                              aria-label={t("sidebar.delete.chat")}
                            >
                              <Trash2 className="h-3.5 w-3.5 text-red-500" />
                              <span className="sr-only">{t("sidebar.delete.chat")}</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))
            )}
          </ScrollArea>
        </SidebarContent>

        <SidebarFooter>
          <div className="flex flex-col gap-2 p-2">
            {/* Feedback Button */}
            <FeedbackDialog /> 
            {/* Existing User Profile Dropdown */}
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex-1 justify-start gap-2">
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={user?.profileImage || ""} alt={user?.name || "User"} />
                      <AvatarFallback>{getUserInitials()}</AvatarFallback>
                    </Avatar>
                    <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-left">
                      {user?.name || t("auth.signin")}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[240px]">
                  {user ? (
                    <>
                      <DropdownMenuItem className="flex-col items-start">
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onSelect={() => router.push("/profile")}>
                        {t("profile.title")}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onSelect={handleSignOut}>{t("sidebar.signout")}</DropdownMenuItem>
                    </>
                  ) : (
                    <DropdownMenuItem onSelect={() => router.push("/sign-in")}>
                      {t("auth.signin")}
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("sidebar.delete.chat")}</AlertDialogTitle>
            <AlertDialogDescription>{t("sidebar.delete.confirm")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("sidebar.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>{t("sidebar.delete")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
