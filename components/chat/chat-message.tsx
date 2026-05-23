"use client"

import { memo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/ui/avatar"
import {
  User,
  Scale,
  Copy,
  Share,
  ThumbsUp,
  ThumbsDown,
  MoreHorizontal,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { HighlightMatches } from "@/components/ui/highlight-matches"
import { useChatFeedback } from "@/hooks/use-chat-feedback"

export interface ChatMessageProps {
  message: { id: string; role: string; content: string }
  isMobile: boolean
  t: (key: string) => string
  highlight?: boolean
  searchTerms?: string[]
  isLastInGroup?: boolean
  isFirstInGroup?: boolean
  onReaction?: (messageId: string, reaction: "like" | "dislike") => void
  chatId?: string
}

export const ChatMessage = memo(function ChatMessage({
  message,
  isMobile,
  t,
  highlight = false,
  searchTerms = [],
  isFirstInGroup = true,
  isLastInGroup = true,
  onReaction,
  chatId,
}: ChatMessageProps) {
  const content =
    searchTerms.length > 0 ? (
      <HighlightMatches text={message.content} terms={searchTerms} />
    ) : (
      message.content
    )

  const [showActionsHover, setShowActionsHover] = useState(false)
  const { submitFeedback, getFeedbackState } = useChatFeedback()
  const feedbackState = getFeedbackState(message.id)
  const showActions = isMobile || showActionsHover

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content)
    toast.success(t("Message copied to clipboard"))
  }

  const handleFeedback = async (feedbackType: "like" | "dislike") => {
    try {
      await submitFeedback({
        messageId: message.id,
        chatId,
        feedbackType,
      })
      onReaction?.(message.id, feedbackType)
    } catch (error) {
      console.error("Failed to submit feedback:", error)
    }
  }

  return (
    <div
      className={`message ${message.role} ${highlight ? "search-highlight bg-yellow-100 dark:bg-yellow-800/20 rounded-md" : ""} 
        ${isFirstInGroup ? "mt-6" : "mt-1"} ${isLastInGroup ? "mb-2" : "mb-0"}`}
      role="listitem"
      aria-label={`${message.role === "user" ? "You" : "Assistant"}: ${message.content}`}
      onMouseEnter={() => setShowActionsHover(true)}
      onMouseLeave={() => setShowActionsHover(false)}
    >
      <div className="flex items-center justify-center">
        <div
          className={`flex items-start gap-3 sm:gap-4 max-w-3xl w-full ${message.role === "user" ? "flex-row-reverse" : ""}`}
        >
          {isFirstInGroup && (
            <Avatar
              className={`${isMobile ? "h-8 w-8" : "h-10 w-10"} 
                ${message.role === "user" ? "bg-primary/10" : "bg-secondary/30"}`}
            >
              {message.role === "user" ? (
                <User className="p-1.5" />
              ) : (
                <Scale className="p-1.5" />
              )}
            </Avatar>
          )}

          {!isFirstInGroup && (
            <div
              className={`${isMobile ? "w-8" : "w-10"} ${message.role === "user" ? "order-last" : "order-first"}`}
            />
          )}

          <div
            className={`relative max-w-[85%] sm:max-w-[90%] transition-all duration-200
              ${
                message.role === "user"
                  ? "rounded-2xl px-4 py-2.5 bg-primary text-primary-foreground dark:shadow-md ml-2 shadow-sm hover:shadow"
                  : "mr-2 py-1"
              }`}
          >
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{content}</p>

            {showActions && (
              <div
                className={`absolute ${message.role === "user" ? "left-0" : "right-0"} -bottom-10 sm:-bottom-8 flex items-center gap-0.5 sm:gap-1 bg-background/90 backdrop-blur-sm rounded-full px-1 py-0.5 shadow-sm border border-border/50`}
              >
                <Button variant="ghost" size="icon" className={isMobile ? "h-9 w-9" : "h-7 w-7"} onClick={handleCopy}>
                  <Copy className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`${isMobile ? "h-9 w-9" : "h-7 w-7"} ${feedbackState.feedbackType === "like" ? "text-green-600 bg-green-100 dark:bg-green-900/30" : ""}`}
                  onClick={() => handleFeedback("like")}
                  disabled={feedbackState.isSubmitting}
                >
                  {feedbackState.isSubmitting && feedbackState.feedbackType === "like" ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <ThumbsUp className="h-3 w-3" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`${isMobile ? "h-9 w-9" : "h-7 w-7"} ${feedbackState.feedbackType === "dislike" ? "text-red-600 bg-red-100 dark:bg-red-900/30" : ""}`}
                  onClick={() => handleFeedback("dislike")}
                  disabled={feedbackState.isSubmitting}
                >
                  {feedbackState.isSubmitting && feedbackState.feedbackType === "dislike" ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <ThumbsDown className="h-3 w-3" />
                  )}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className={isMobile ? "h-9 w-9" : "h-7 w-7"}>
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleCopy}>
                      <Copy className="h-4 w-4 mr-2" />
                      {t("Copy")}
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Share className="h-4 w-4 mr-2" />
                      {t("Share")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
})
