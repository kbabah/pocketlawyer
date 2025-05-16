"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import ChatInterface from "@/components/chat-interface"
import { useAuth } from "@/contexts/auth-context"
import { Scale, BookOpen } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { LanguageSwitcher } from "@/components/language-switcher"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { ThemeLogo } from "@/components/theme-logo" // Import the ThemeLogo component
import Link from "next/link"

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
          <ThemeLogo size={32} darkLogoPath="/dark-logo.png" lightLogoPath="/light-logo.png" className="animate-pulse" />
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[100dvh] bg-pattern-light dark:bg-pattern-dark">
      <AppSidebar />
      <SidebarInset className="flex flex-col flex-1">
        <header className="sticky top-0 z-10 flex h-14 sm:h-16 shrink-0 items-center justify-between gap-2 border-b bg-background/95 px-3 sm:px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center gap-2 overflow-hidden">
            <SidebarTrigger className="-ml-1 flex-shrink-0" />
            <div className="max-w-[130px] sm:max-w-[70%] overflow-hidden">
              <ThemeLogo 
                width={250} 
                height={100} 
                darkLogoPath="/dark-logo.png" 
                lightLogoPath="/light-logo.png" 
                className="flex-shrink-0 scale-85 sm:scale-100"
                priority={true}
                quality={95}
              />
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/blog" className="text-sm font-medium hover:text-primary flex items-center gap-1.5 px-2.5 py-1.5 sm:p-0">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">{t("Blog")}</span>
            </Link>
            <div className="flex items-center gap-1 sm:gap-2">
              <ThemeSwitcher />
              <LanguageSwitcher />
            </div>
            {user?.isAnonymous && (
              <div className="text-xs sm:text-sm font-medium text-amber-600 dark:text-amber-500 hidden sm:block">
                {t("Trial Mode")}: {user.trialConversationsUsed}/{user.trialConversationsLimit} {t("Trial Conversations Used")}
              </div>
            )}
          </div>
        </header>
        <div className="flex-1 overflow-auto">
          <ChatInterface />
        </div>
      </SidebarInset>
    </div>
  )
}
