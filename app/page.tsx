"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import ChatInterface from "@/components/chat-interface"
import { useAuth } from "@/contexts/auth-context"
import { Scale } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { LanguageSwitcher } from "@/components/language-switcher"
import { ThemeSwitcher } from "@/components/theme-switcher"

export default function Home() {
  const { user, loading } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()

  // No longer redirect to welcome page if not logged in
  // Instead, we'll handle anonymous users with the trial feature

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
            <div className="flex items-center gap-2">
              <ThemeSwitcher />
              <LanguageSwitcher />
            </div>
            {user?.isAnonymous && (
              <div className="text-sm font-medium text-amber-600 dark:text-amber-500 hidden sm:block">
                {t("Trial Mode")}: {user.trialConversationsUsed}/{user.trialConversationsLimit} {t("Trial Conversations Used")}
              </div>
            )}
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
