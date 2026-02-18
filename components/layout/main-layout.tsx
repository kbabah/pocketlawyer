"use client";

import { ReactNode } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"

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
      <div className={cn("min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950", className)}>
        {children}
      </div>
    )
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden">
        {/* Sidebar */}
        <AppSidebar />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Bar */}
          <div className="h-14 border-b border-slate-800 bg-slate-950/50 backdrop-blur-xl flex items-center justify-between px-4 md:px-6">
            {/* Left side with mobile menu */}
            <div className="flex items-center gap-3">
              {/* Mobile Menu Button - Only visible on small screens */}
              <div className="lg:hidden">
                <SidebarTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </SidebarTrigger>
              </div>
              
              <div className="h-2 w-2 bg-primary rounded-full animate-pulse" />
              <span className="text-sm font-mono text-slate-400 hidden sm:inline">
                {new Date().toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  hour12: false 
                })}
              </span>
            </div>
            
            {/* Right side */}
            <div className="flex items-center gap-2">
              <div className="px-2 sm:px-3 py-1 bg-primary/10 border border-primary/30 rounded-full">
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
