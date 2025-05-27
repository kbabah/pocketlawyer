"use client"

import React from 'react'
import { ErrorBoundary } from '../error-boundary'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, RotateCcw, Home, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { useLanguage } from '@/contexts/language-context'

interface SearchErrorFallbackProps {
  error?: Error
  resetError?: () => void
}

function SearchErrorFallback({ error, resetError }: SearchErrorFallbackProps) {
  const { t } = useLanguage()

  const isNetworkError = error?.message.includes('fetch') || error?.message.includes('network')
  const isSearchLimitError = error?.message.includes('rate limit') || error?.message.includes('quota')

  return (
    <div className="flex items-center justify-center min-h-[400px] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle>{t("Search Error") || "Search Error"}</CardTitle>
          <CardDescription>
            {isNetworkError 
              ? (t("Unable to connect to search services. Please check your internet connection.") || "Unable to connect to search services. Please check your internet connection.")
              : isSearchLimitError 
                ? (t("Search rate limit exceeded. Please try again in a few minutes.") || "Search rate limit exceeded. Please try again in a few minutes.")
                : (t("There was a problem with the search functionality. Please try again.") || "There was a problem with the search functionality. Please try again.")
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2">
            <Button onClick={resetError} className="w-full">
              <RotateCcw className="mr-2 h-4 w-4" />
              {t("Try Search Again") || "Try Search Again"}
            </Button>
            <Button variant="outline" asChild>
              <Link href="/search">
                <Search className="mr-2 h-4 w-4" />
                {t("New Search") || "New Search"}
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                {t("Go to Home") || "Go to Home"}
              </Link>
            </Button>
          </div>
          {error && (
            <details className="text-sm">
              <summary className="cursor-pointer text-muted-foreground">
                {t("Error Details") || "Error Details"}
              </summary>
              <div className="mt-2 text-xs bg-muted p-2 rounded font-mono">
                <p className="font-semibold mb-1">{t("Error") || "Error"}:</p>
                <p>{error.message}</p>
                {isSearchLimitError && (
                  <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded text-amber-700 dark:text-amber-300">
                    <p className="font-semibold">{t("Rate Limit Info") || "Rate Limit Info"}:</p>
                    <ul className="text-xs mt-1 space-y-1">
                      <li>• {t("Search services have daily usage limits") || "Search services have daily usage limits"}</li>
                      <li>• {t("Try again in a few minutes") || "Try again in a few minutes"}</li>
                      <li>• {t("Consider using the chat interface instead") || "Consider using the chat interface instead"}</li>
                    </ul>
                  </div>
                )}
                {isNetworkError && (
                  <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-blue-700 dark:text-blue-300">
                    <p className="font-semibold">{t("Network Tips") || "Network Tips"}:</p>
                    <ul className="text-xs mt-1 space-y-1">
                      <li>• {t("Check your internet connection") || "Check your internet connection"}</li>
                      <li>• {t("Try refreshing the page") || "Try refreshing the page"}</li>
                      <li>• {t("VPN or firewall might be blocking the request") || "VPN or firewall might be blocking the request"}</li>
                    </ul>
                  </div>
                )}
              </div>
            </details>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

interface SearchErrorBoundaryProps {
  children: React.ReactNode
}

export function SearchErrorBoundary({ children }: SearchErrorBoundaryProps) {
  return (
    <ErrorBoundary
      fallback={({ error, resetError }) => (
        <SearchErrorFallback error={error} resetError={resetError} />
      )}
      showDetails={process.env.NODE_ENV === 'development'}
    >
      {children}
    </ErrorBoundary>
  )
}
