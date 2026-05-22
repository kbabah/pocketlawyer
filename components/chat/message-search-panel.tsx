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
    <div className="sticky top-[57px] z-10 flex items-center gap-2 p-2 bg-background/95 backdrop-blur border-b animate-slideDown">
      <div className="relative flex-1">
        <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={messageSearchInputRef}
          className="pl-8 pr-16"
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
          <span className="absolute right-16 top-1/2 -translate-y-1/2 text-xs text-muted-foreground bg-background/90 px-2 py-0.5 rounded-md">
            {currentSearchResultIndex + 1} / {searchResults.length}
          </span>
        )}
        <Button
          size="sm"
          variant="ghost"
          onClick={handleMessageSearch}
          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground"
        >
          {t("Find")}
        </Button>
      </div>
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigateSearchResults("previous")}
          disabled={searchResults.length === 0}
          className="h-8 w-8"
        >
          <ChevronUp className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigateSearchResults("next")}
          disabled={searchResults.length === 0}
          className="h-8 w-8"
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
          className="h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
