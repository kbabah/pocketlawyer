"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, ChevronUp, ChevronDown, X } from "lucide-react"

export interface MessageSearchPanelProps {
  messageSearchQuery: string
  setMessageSearchQuery: (q: string) => void
  handleMessageSearch: () => void
  navigateSearchResults: (dir: "previous" | "next") => void
  searchResults: number[]
  currentSearchResultIndex: number
  messageSearchInputRef: React.RefObject<HTMLInputElement | null>
  t: (key: string) => string
  setShowMessageSearch: (show: boolean) => void
}

export function MessageSearchPanel({
  messageSearchQuery,
  setMessageSearchQuery,
  handleMessageSearch,
  navigateSearchResults,
  searchResults,
  currentSearchResultIndex,
  messageSearchInputRef,
  t,
  setShowMessageSearch,
}: MessageSearchPanelProps) {
  return (
    <div className="sticky top-0 z-10 flex flex-col sm:flex-row sm:items-center gap-2 p-2 sm:p-3 bg-background/95 backdrop-blur border-b">
      <div className="relative flex-1 w-full min-w-0">
        <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <Input
          ref={messageSearchInputRef}
          className="pl-8 pr-16 min-h-[44px] text-base sm:text-sm"
          placeholder={t("Search messages...")}
          value={messageSearchQuery}
          onChange={(e) => setMessageSearchQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              handleMessageSearch()
            }
          }}
        />
        {searchResults.length > 0 && (
          <span className="absolute right-14 top-1/2 -translate-y-1/2 text-xs text-muted-foreground bg-background/90 px-2 py-0.5 rounded-md">
            {currentSearchResultIndex + 1} / {searchResults.length}
          </span>
        )}
        <Button
          size="sm"
          variant="ghost"
          onClick={handleMessageSearch}
          className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 sm:h-9 sm:w-9 touch-manipulation"
        >
          {t("Find")}
        </Button>
      </div>
      <div className="flex gap-1 justify-end shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigateSearchResults("previous")}
          disabled={searchResults.length === 0}
          className="h-10 w-10 sm:h-9 sm:w-9 touch-manipulation"
        >
          <ChevronUp className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigateSearchResults("next")}
          disabled={searchResults.length === 0}
          className="h-10 w-10 sm:h-9 sm:w-9 touch-manipulation"
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setShowMessageSearch(false)
            setMessageSearchQuery("")
          }}
          className="h-10 w-10 sm:h-9 sm:w-9 touch-manipulation"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
