"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Scale, MessageSquare, Calendar, Loader2, Trash2 } from "lucide-react"
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
import { Separator } from "@/components/ui/separator"
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
import { useChatHistory } from "@/hooks/use-chat-history"
import { 
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger
} from "@/components/ui/sidebar"
import { toast } from "sonner"

// Add this client button wrapper before the AppSidebar component
const DeleteButton = ({ onDelete }: { onDelete: () => void }) => {
  const { t } = useLanguage()
  return (
    <AlertDialogAction asChild>
      <button onClick={onDelete} className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
        {t("sidebar.delete")}
      </button>
    </AlertDialogAction>
  )
}

export function AppSidebar() {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<{ date: string; id: string } | null>(null)
  const { user, signOut } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()
  const { chatHistory, loading, deleteChat } = useChatHistory(user?.id)

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
            <LanguageSwitcher />
          </div>
        </SidebarHeader>
        
        <SidebarContent>
          <div className="space-y-2 mx-2">
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={handleNewChat}
            >
              <MessageSquare className="h-4 w-4" />
              Start New Chat
            </Button>
            
            <Button
              variant="default"
              className="w-full justify-start gap-2"
              onClick={() => router.push('/lawyers')}
            >
              <Scale className="h-4 w-4" />
              Consult a Lawyer
            </Button>
          </div>

          <Separator className="my-4" />

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
                      <div key={chat.id} className="px-2 relative group">
                        <div 
                          className="w-full flex items-center justify-between px-2 py-6 rounded-md text-sm font-medium transition-colors hover:bg-muted cursor-pointer"
                          onClick={() => router.push(`/chat/${chat.id}`)}
                        >
                          <span className="truncate">{chat.title}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="ml-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 top-1/2 -translate-y-1/2 md:opacity-30 md:group-hover:opacity-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            const chatDate = new Date(chat.timestamp).toISOString().split('T')[0];
                            handleDeleteChat(chatDate, chat.id);
                          }}
                          aria-label={t("sidebar.delete.chat")}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                          <span className="sr-only">{t("sidebar.delete.chat")}</span>
                        </Button>
                      </div>
                    ))}
                  </div>
                ))
            )}
          </ScrollArea>
        </SidebarContent>

        <SidebarFooter>
          <div className="flex flex-col gap-2 p-2">
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
            <DeleteButton onDelete={confirmDelete} />
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
