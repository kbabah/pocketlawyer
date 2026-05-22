"use client"

import { Avatar } from "@/components/ui/avatar"
import { Scale } from "lucide-react"

interface TypingIndicatorProps {
  isMobile: boolean
}

export function TypingIndicator({ isMobile }: TypingIndicatorProps) {
  return (
    <div className="flex items-center gap-3 sm:gap-4 max-w-3xl w-full mb-4">
      <Avatar className={`${isMobile ? "h-8 w-8" : "h-10 w-10"} bg-secondary/30`}>
        <Scale className="p-1.5" />
      </Avatar>
      <div className="rounded-lg px-3.5 py-2.5 sm:px-4 sm:py-3 border border-border mr-2">
        <div className="flex space-x-2">
          <div
            className="w-2 h-2 rounded-full bg-current animate-bounce"
            style={{ animationDelay: "0ms" }}
          />
          <div
            className="w-2 h-2 rounded-full bg-current animate-bounce"
            style={{ animationDelay: "150ms" }}
          />
          <div
            className="w-2 h-2 rounded-full bg-current animate-bounce"
            style={{ animationDelay: "300ms" }}
          />
        </div>
      </div>
    </div>
  )
}
