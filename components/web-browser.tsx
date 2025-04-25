"use client"

import { useState, useEffect } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Search, ExternalLink, ArrowLeft, ArrowRight, X } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

interface WebBrowserProps {
  query: string
}

interface SearchResult {
  title: string
  link: string
  snippet: string
}

export default function WebBrowser({ query: initialQuery }: WebBrowserProps) {
  const { language, t } = useLanguage()
  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentUrl, setCurrentUrl] = useState<string | null>(null)
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, url: string) => {
    e.preventDefault()
    if (currentUrl) {
      setHistory(prev => [...prev.slice(0, historyIndex + 1), currentUrl])
      setHistoryIndex(prev => prev + 1)
    } else {
      setHistory([])
      setHistoryIndex(0)
    }
    setCurrentUrl(url)
  }

  const handleBack = () => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1)
      setCurrentUrl(history[historyIndex - 1])
    } else if (historyIndex === 0) {
      setCurrentUrl(null)
      setHistoryIndex(-1)
    }
  }

  const handleForward = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1)
      setCurrentUrl(history[historyIndex + 1])
    }
  }

  const handleCloseWebpage = () => {
    setCurrentUrl(null)
    setHistoryIndex(-1)
  }

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault()
    setLoading(true)
    setError(null)
    setResults([])

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&lang=${language}`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || response.statusText || 'Failed to fetch results')
      }

      if (data.error) {
        throw new Error(data.error)
      }

      if (!Array.isArray(data.results)) {
        throw new Error('Invalid response format')
      }

      setResults(data.results)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery)
      handleSearch()
    }
  }, [initialQuery])

  return (
    <div className="h-full flex flex-col">
      {currentUrl ? (
        <div className="h-full flex flex-col flex-1">
          <div className="flex items-center gap-2 p-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              disabled={historyIndex < 0}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleForward}
              disabled={historyIndex >= history.length - 1}
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
            <div className="flex-1 truncate text-sm">{currentUrl}</div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCloseWebpage}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <iframe 
            src={currentUrl} 
            className="flex-1 w-full border-0 min-h-[85vh]"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            referrerPolicy="no-referrer"
          />
        </div>
      ) : (
        <>
          <form onSubmit={handleSearch} className="flex-none px-4 pt-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                placeholder={t("search.placeholder")}
                className="w-full pl-9 pr-4 py-2 rounded-md border border-input bg-background"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </form>

          <ScrollArea className="flex-1 px-4 min-h-[90vh]">
            {error ? (
              <div className="text-center text-red-500 p-4">{error}</div>
            ) : loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-1/2 mt-2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : results.length === 0 ? (
              <div className="text-center text-muted-foreground p-4">
                {t("search.no.results")}
              </div>
            ) : (
              <div className="space-y-4 py-2">
                {results.map((result, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <a
                        href={result.link}
                        onClick={(e) => handleClick(e, result.link)}
                        className="inline-flex items-center gap-2 text-primary hover:underline"
                      >
                        <h3 className="font-medium">{result.title}</h3>
                        <ExternalLink className="h-4 w-4" />
                      </a>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {result.snippet}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground/60">
                        {result.link}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </>
      )}
    </div>
  )
}
