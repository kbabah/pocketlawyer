"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import ChatInterface from "@/components/chat-interface"
import { useAuth } from "@/contexts/auth-context"
import { Scale } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

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

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-pattern-light dark:bg-pattern-dark">
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
    <main className="min-h-screen bg-pattern-light dark:bg-pattern-dark">
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4 border-pattern">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Scale className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-bold">{t("app.name")}</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{t("welcome.hero.title")}</span>
          </div>
        </header>
        <ChatInterface />
      </SidebarInset>
    </main>
  )
}
