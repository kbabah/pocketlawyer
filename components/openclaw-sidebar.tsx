"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { 
  Scale, 
  Home, 
  FileText, 
  Calendar, 
  Briefcase,
  Settings,
  Terminal,
  Zap,
  User,
  LogOut,
  ChevronRight,
  Activity,
  MessageSquare,
  Plus,
  Shield,
  Users
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import { useRoleCheck } from "@/hooks/use-role-check"
import { useSidebar } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface NavItem {
  title: string
  href: string
  icon: any
  badge?: string
  requiresAuth?: boolean
  adminOnly?: boolean
  lawyerOnly?: boolean
}

const navigation: NavItem[] = [
  { title: "Home", href: "/", icon: Home },
  { title: "Documents", href: "/documents", icon: FileText },
  { title: "Find Lawyer", href: "/lawyers", icon: Scale },
  { title: "My Bookings", href: "/bookings", icon: Calendar, requiresAuth: true },
  { title: "Lawyer Dashboard", href: "/lawyer/dashboard", icon: Briefcase, requiresAuth: true, lawyerOnly: true },
  { title: "Admin Panel", href: "/admin", icon: Settings, adminOnly: true },
]

export function AppSidebar() {
  const { user, signOut } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()
  const pathname = usePathname()
  const { state } = useSidebar()
  const { isAdmin, isApprovedLawyer, loading: roleLoading } = useRoleCheck()
  const [userChatsCount, setUserChatsCount] = useState(0)
  const [userBookingsCount, setUserBookingsCount] = useState(0)
  const [loadingMetrics, setLoadingMetrics] = useState(false)

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

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push("/")
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

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  const filteredNavigation = navigation.filter(item => {
    if (item.requiresAuth && !user) return false
    if (item.adminOnly && !isAdmin) return false
    if (item.lawyerOnly && !isApprovedLawyer) return false
    return true
  })

  return (
    <div className="flex h-screen flex-col bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-r border-slate-800">
      {/* Header */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
            <Scale className="h-6 w-6 text-emerald-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-white font-mono">POCKETLAWYER</h2>
            <p className="text-xs text-slate-400 font-mono">Legal AI Platform</p>
          </div>
        </div>
        
        {/* Status Indicator */}
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-800/50 rounded-lg border border-slate-700">
          <div className="relative">
            <div className="h-2 w-2 bg-emerald-400 rounded-full animate-pulse" />
            <div className="absolute inset-0 h-2 w-2 bg-emerald-400 rounded-full animate-ping" />
          </div>
          <span className="text-xs font-mono text-slate-300">SYSTEM ONLINE</span>
        </div>
      </div>

      {/* User Profile */}
      {user && (
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors cursor-pointer"
               onClick={() => router.push("/profile")}>
            <Avatar className="h-10 w-10 border-2 border-emerald-500/30">
              <AvatarImage src={user?.profileImage || ""} />
              <AvatarFallback className="bg-slate-800 text-emerald-400 font-mono">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white font-mono truncate">
                {user.name || "User"}
              </p>
              <p className="text-xs text-slate-400 font-mono truncate">
                {user.email}
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-500" />
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="px-4 py-3">
        <Button
          onClick={() => router.push("/")}
          className="w-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 font-mono justify-start gap-2"
        >
          <Plus className="h-4 w-4" />
          NEW CHAT
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-4">
        <div className="space-y-1 py-2">
          <div className="px-2 py-2">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">
              NAVIGATION
            </h4>
          </div>
          
          {filteredNavigation.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-mono text-sm transition-all",
                  active
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                )}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span className="flex-1 text-left truncate">{t(item.title)}</span>
                {item.badge && (
                  <span className="px-2 py-0.5 text-xs bg-slate-700 rounded-full">
                    {item.badge}
                  </span>
                )}
                {active && <Activity className="h-3 w-3 text-emerald-400 animate-pulse" />}
              </button>
            )
          })}
          
          {/* Admin Submenu */}
          {isAdmin && pathname.startsWith('/admin') && (
            <div className="ml-4 mt-2 space-y-1 border-l-2 border-slate-700 pl-2">
              <button
                onClick={() => router.push("/admin")}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 rounded-lg font-mono text-xs transition-all",
                  pathname === "/admin"
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/30"
                )}
              >
                <Activity className="h-3 w-3" />
                <span>Overview</span>
              </button>
              <button
                onClick={() => router.push("/admin/users")}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 rounded-lg font-mono text-xs transition-all",
                  pathname === "/admin/users"
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/30"
                )}
              >
                <Users className="h-3 w-3" />
                <span>Users</span>
              </button>
              <button
                onClick={() => router.push("/admin/lawyers")}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 rounded-lg font-mono text-xs transition-all",
                  pathname === "/admin/lawyers"
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/30"
                )}
              >
                <Scale className="h-3 w-3" />
                <span>Lawyers</span>
              </button>
              <button
                onClick={() => router.push("/admin/setup")}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 rounded-lg font-mono text-xs transition-all",
                  pathname === "/admin/setup"
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/30"
                )}
              >
                <Settings className="h-3 w-3" />
                <span>Settings</span>
              </button>
            </div>
          )}
        </div>

        <Separator className="my-4 bg-slate-800" />

        {/* Stats Section - Only for authenticated users */}
        {user && !user.isAnonymous && (
          <div className="py-2">
            <div className="px-2 py-2">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">
                METRICS
              </h4>
            </div>
            
            <div className="space-y-2">
              <div className="px-3 py-2 bg-slate-800/50 rounded-lg border border-slate-700">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-400 font-mono">CHATS</span>
                  <MessageSquare className="h-3 w-3 text-blue-400" />
                </div>
                <p className="text-lg font-bold text-white font-mono">
                  {loadingMetrics ? "..." : userChatsCount}
                </p>
              </div>
              
              <div className="px-3 py-2 bg-slate-800/50 rounded-lg border border-slate-700">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-400 font-mono">BOOKINGS</span>
                  <Calendar className="h-3 w-3 text-purple-400" />
                </div>
                <p className="text-lg font-bold text-white font-mono">
                  {loadingMetrics ? "..." : userBookingsCount}
                </p>
              </div>
            </div>
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800 space-y-2">
        {user ? (
          <>
            <Button
              variant="ghost"
              onClick={() => router.push("/settings")}
              className="w-full justify-start gap-2 text-slate-400 hover:text-white font-mono"
            >
              <Settings className="h-4 w-4" />
              SETTINGS
            </Button>
            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="w-full justify-start gap-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 font-mono"
            >
              <LogOut className="h-4 w-4" />
              SIGN OUT
            </Button>
          </>
        ) : (
          <Button
            onClick={() => router.push("/sign-in")}
            className="w-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 font-mono"
          >
            <Terminal className="h-4 w-4 mr-2" />
            SIGN IN
          </Button>
        )}
        
        <div className="px-3 py-2 bg-slate-800/30 rounded border border-slate-800">
          <p className="text-xs text-slate-500 font-mono text-center">
            v1.0.0 • {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  )
}
