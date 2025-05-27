"use client"

import { Suspense, useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import WebBrowser from "@/components/web-browser"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { SearchErrorBoundary } from "@/components/error-boundaries"
import { useSearchParams } from "next/navigation"

function SearchPageContent() {
  const { t } = useLanguage()
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('q') || ''
  const [query, setQuery] = useState(initialQuery)
  const [searchQuery, setSearchQuery] = useState(initialQuery)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchQuery(query)
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Search className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                  {t("Web Search")}
                </h1>
                <p className="text-muted-foreground">
                  {t("Search legal resources and information online")}
                </p>
              </div>
            </div>
            
            {/* Search Input */}
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                placeholder={t("Enter your search query...")}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" size="icon">
                <Search className="h-4 w-4" />
              </Button>
            </form>
          </div>

          <Card className="h-[calc(100vh-16rem)]">
            <CardContent className="p-0 h-full">
              <SearchErrorBoundary>
                <WebBrowser query={searchQuery} />
              </SearchErrorBoundary>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="animate-pulse">
          <Search className="h-8 w-8 text-muted-foreground" />
        </div>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  )
}
