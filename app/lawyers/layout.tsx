"use client"

import type { Metadata } from 'next'
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Scale, ArrowLeft } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { useAuth } from "@/contexts/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { LanguageSwitcher } from "@/components/language-switcher"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export const metadata: Metadata = {
  title: "Find a Lawyer | Pocket Lawyer",
  description: "Connect with qualified legal professionals for consultations and advice.",
}

export default function LawyersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, signOut } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push("/welcome")
    } catch (error) {
      console.error("Sign out error:", error)
    }
  }

  const handleBackToChat = () => {
    router.push("/")
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
    <div className="min-h-[100dvh] flex flex-col bg-pattern-light dark:bg-pattern-dark">
      <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between gap-2 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBackToChat}
            className="md:hidden"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Link href="/" className="flex items-center">
            <Scale className="h-5 w-5 text-primary mr-2" />
            <h1 className="text-xl font-bold flex items-center">
              {t("app.name")} <span className="ml-1">🇨🇲</span>
            </h1>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            className="hidden md:flex items-center gap-2"
            onClick={handleBackToChat}
          >
            <ArrowLeft className="h-4 w-4" />
            {t("back.to.chat")}
          </Button>
          <LanguageSwitcher />
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
                  <DropdownMenuItem onSelect={() => router.push("/")}>
                    {t("back.to.chat")}
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
      </header>
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}