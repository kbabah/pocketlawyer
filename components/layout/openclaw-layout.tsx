"use client"

import { ReactNode } from "react"
import { AppSidebar } from "@/components/openclaw-sidebar"
import { cn } from "@/lib/utils"

interface OpenClawLayoutProps {
  children: ReactNode
  className?: string
  fullWidth?: boolean
}

export function OpenClawLayout({ children, className, fullWidth = false }: OpenClawLayoutProps) {
  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0">
        <AppSidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="h-14 border-b border-slate-800 bg-slate-950/50 backdrop-blur-xl flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 bg-primary rounded-full animate-pulse" />
            <span className="text-sm font-mono text-slate-400">
              {new Date().toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false 
              })}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 bg-primary/10 border border-primary/30 rounded-full">
              <span className="text-xs font-mono text-primary">ONLINE</span>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className={cn(
          "flex-1 overflow-auto",
          fullWidth ? "p-0" : "p-6",
          className
        )}>
          <div className={cn(
            "h-full",
            !fullWidth && "max-w-7xl mx-auto"
          )}>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
