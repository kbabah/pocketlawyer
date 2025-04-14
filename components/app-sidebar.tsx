"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Scale, MessageSquare, Calendar, Loader2 } from "lucide-react"
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
import { useChatHistory } from "@/hooks/use-chat-history"
import { 
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger
} from "@/components/ui/sidebar"

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
    await deleteChat(itemToDelete.id)
    setDeleteDialogOpen(false)
    setItemToDelete(null)
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
              <h2 className="text-lg font-semibold">PocketLawyer</h2>
            </div>
            <LanguageSwitcher />
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
                      <div key={chat.id} className="px-2">
                        <Button
                          variant="ghost"
                          className="w-full justify-between px-2 py-6"
                          onClick={() => router.push(`/chat/${chat.id}`)}
                        >
                          <span className="truncate">{chat.title}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="ml-2 h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteChat(date, chat.id)
                            }}
                          >
                            <span className="sr-only">{t("sidebar.delete.chat")}</span>
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        </Button>
                      </div>
                    ))}
                  </div>
                ))
            )}
          </ScrollArea>
        </SidebarContent>

        <SidebarFooter>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start gap-2 p-4">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={user?.profileImage || ""} alt={user?.name || "User"} />
                  <AvatarFallback>{getUserInitials()}</AvatarFallback>
                </Avatar>
                <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-left">
                  {user?.name || t("auth.signin")}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[240px]">
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
