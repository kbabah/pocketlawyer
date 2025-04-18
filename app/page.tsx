"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import ChatInterface from "@/components/chat-interface"
import { useAuth } from "@/contexts/auth-context"
import { Scale } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { FeedbackDialog } from "@/components/feedback-dialog"
import { Button } from "@/components/ui/button"
import { MessageSquare } from "lucide-react"

export default function Home() {
  const { user, loading } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      // Redirect to landing page if not logged in
      router.push("/welcome")
    }
  }, [user, loading, router])

  const handleTalkToLawyer = () => {
    router.push("/lawyers")
  }

  if (loading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-pattern-light dark:bg-pattern-dark">
        <div className="flex flex-col items-center gap-2">
          <Scale className="h-8 w-8 animate-pulse text-primary" />
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="flex min-h-[100dvh] bg-pattern-light dark:bg-pattern-dark">
      <AppSidebar />
      <SidebarInset className="flex flex-col flex-1">
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between gap-2 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Scale className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-bold flex items-center">
              {t("app.name")} <span className="ml-1">🇨🇲</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              variant="primary" 
              className="hidden sm:flex"
              onClick={handleTalkToLawyer}
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              {t("talk.to.lawyer")}
            </Button>
            <FeedbackDialog />
            <span className="text-sm text-muted-foreground hidden sm:inline-block">{t("welcome.hero.title")}</span>
          </div>
        </header>
        <div className="flex-1 overflow-auto">
          <ChatInterface />
        </div>
      </SidebarInset>
    </div>
  )
}
