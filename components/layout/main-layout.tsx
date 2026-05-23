"use client";

import { ReactNode } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { LanguageSwitcher } from "@/components/language-switcher"
import { cn } from "@/lib/utils"

interface MainLayoutProps {
  children: ReactNode
  className?: string
  fullWidth?: boolean
  breadcrumbs?: Array<{
    label: string
    href?: string
    isCurrentPage?: boolean
  }>
  title?: string
  subtitle?: string
  actions?: ReactNode
  showSidebar?: boolean
}

export function MainLayout({ 
  children, 
  className, 
  fullWidth = false,
  // Legacy props - ignored but kept for backward compatibility
  breadcrumbs,
  title,
  subtitle,
  actions,
  showSidebar = true
}: MainLayoutProps) {
  if (!showSidebar) {
    // If no sidebar requested, just return the content
    return (
      <div className={cn("min-h-dvh bg-background", className)}>
        {children}
      </div>
    )
  }

  return (
    <SidebarProvider>
      <div className="flex h-dvh bg-background overflow-hidden">
        {/* Sidebar */}
        <AppSidebar />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Bar */}
          <div className="h-14 shrink-0 border-b border-border bg-background/95 backdrop-blur-xl flex items-center justify-between px-3 sm:px-4 md:px-6 pt-[env(safe-area-inset-top)]">
            {/* Left side with mobile menu */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="lg:hidden shrink-0">
                <SidebarTrigger />
              </div>
              
              <div className="h-2 w-2 bg-primary rounded-full animate-pulse" />
              <span className="text-sm font-mono text-muted-foreground hidden sm:inline">
                {new Date().toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  hour12: false 
                })}
              </span>
            </div>
            
            {/* Right side */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <LanguageSwitcher />
              <div className="hidden sm:flex px-2 sm:px-3 py-1 bg-primary/10 border border-primary/30 rounded-full">
                <span className="text-xs font-mono text-primary">ONLINE</span>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className={cn(
            "flex-1 overflow-auto",
            fullWidth ? "p-0" : "p-4 sm:p-6",
            className
          )}>
            <div className={cn(
              "h-full w-full",
              !fullWidth && "max-w-7xl mx-auto"
            )}>
              {children}
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  )
}

export default MainLayout
