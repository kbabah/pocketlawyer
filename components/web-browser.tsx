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
    <div className="h-full flex flex-col pb-16 sm:pb-8">
      {currentUrl ? (
        <div className="h-full flex flex-col flex-1">
          {/* Mobile-optimized header */}
          <div className="sticky top-0 z-10 flex items-center gap-2 p-2 sm:p-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center gap-1 sm:gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                disabled={historyIndex < 0}
                className="h-10 w-10 sm:h-8 sm:w-8"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleForward}
                disabled={historyIndex >= history.length - 1}
                className="h-10 w-10 sm:h-8 sm:w-8"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 truncate text-sm">
              <span className="hidden sm:inline text-muted-foreground">Viewing: </span>
              {currentUrl}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCloseWebpage}
              className="h-10 w-10 sm:h-8 sm:w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Responsive iframe container */}
          <div className="flex-1 w-full relative">
            <iframe 
              src={currentUrl} 
              className="absolute inset-0 w-full h-full border-0"
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
              referrerPolicy="no-referrer"
              title="Web content"
            />
          </div>
        </div>
      ) : (
        <>
          {/* Mobile-optimized search form */}
          <form onSubmit={handleSearch} className="sticky top-0 z-10 px-3 sm:px-4 py-3 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                placeholder={t("Search legal resources...")}
                className="w-full pl-10 pr-4 py-3 sm:py-2 rounded-lg border border-input bg-background text-base sm:text-sm min-h-[46px] sm:min-h-[36px]"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <Button 
                type="submit" 
                className="absolute right-1 top-1/2 -translate-y-1/2 h-10 sm:h-8 px-3 sm:px-2 text-sm"
                variant="secondary"
              >
                {t("Search")}
              </Button>
            </div>
          </form>

          {/* Responsive results area */}
          <ScrollArea className="flex-1 px-3 sm:px-4">
            <div className="max-w-2xl mx-auto py-4">
              {error ? (
                <div className="text-center p-4 rounded-lg border border-destructive/50 bg-destructive/10">
                  <p className="text-destructive">{error}</p>
                  <Button 
                    variant="outline" 
                    onClick={handleSearch} 
                    className="mt-2 h-10 sm:h-9"
                  >
                    {t("Try Again")}
                  </Button>
                </div>
              ) : loading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i} className="overflow-hidden">
                      <CardContent className="p-4">
                        <Skeleton className="h-5 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3 mt-2" />
                        <Skeleton className="h-3 w-1/3 mt-3" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : results.length === 0 ? (
                query ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-2">{t("No results found")}</p>
                    <p className="text-sm text-muted-foreground/80">{t("Try different keywords or check your spelling")}</p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Search className="h-8 w-8 mx-auto text-muted-foreground/50 mb-3" />
                    <p className="text-muted-foreground">{t("Enter your search query above")}</p>
                  </div>
                )
              ) : (
                <div className="space-y-4">
                  {results.map((result, index) => (
                    <Card key={index} className="overflow-hidden hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <a
                          href={result.link}
                          onClick={(e) => handleClick(e, result.link)}
                          className="inline-flex items-center gap-2 group"
                        >
                          <h3 className="font-medium text-primary group-hover:underline">{result.title}</h3>
                          <ExternalLink className="h-4 w-4 text-primary/70" />
                        </a>
                        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                          {result.snippet}
                        </p>
                        <p className="mt-2 text-xs text-muted-foreground/60 truncate">
                          {result.link}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </>
      )}
    </div>
  )
}
