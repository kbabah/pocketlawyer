"use client"

import React from 'react'
import { ErrorBoundary } from '../error-boundary'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { UserX, RotateCcw, Home, LogIn } from 'lucide-react'
import Link from 'next/link'
import { useLanguage } from '@/contexts/language-context'

interface AuthErrorFallbackProps {
  error?: Error
  resetError?: () => void
}

function AuthErrorFallback({ error, resetError }: AuthErrorFallbackProps) {
  const { t } = useLanguage()

  const isNetworkError = error?.message.includes('fetch') || error?.message.includes('network')
  const isAuthError = error?.message.includes('auth') || error?.message.includes('401') || error?.message.includes('403')

  const handleRetry = React.useCallback(() => {
    resetError?.()
  }, [resetError])

  return (
    <div className="flex items-center justify-center min-h-[400px] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <UserX className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle>{t("Authentication Error") || "Authentication Error"}</CardTitle>
          <CardDescription>
            {isNetworkError 
              ? (t("Network connection issue. Please check your internet connection.") || "Network connection issue. Please check your internet connection.")
              : isAuthError 
                ? (t("Authentication failed. Please try signing in again.") || "Authentication failed. Please try signing in again.")
                : (t("There was a problem with authentication. Please try again.") || "There was a problem with authentication. Please try again.")
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2">
            <Button onClick={handleRetry} className="w-full">
              <RotateCcw className="mr-2 h-4 w-4" />
              {t("Try Again") || "Try Again"}
            </Button>
            <Button variant="outline" asChild>
              <Link href="/sign-in">
                <LogIn className="mr-2 h-4 w-4" />
                {t("Sign In") || "Sign In"}
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/welcome">
                <Home className="mr-2 h-4 w-4" />
                {t("Go to Welcome") || "Go to Welcome"}
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
                {isNetworkError && (
                  <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded text-amber-700 dark:text-amber-300">
                    <p className="font-semibold">{t("Troubleshooting") || "Troubleshooting"}:</p>
                    <ul className="text-xs mt-1 space-y-1">
                      <li>• {t("Check your internet connection") || "Check your internet connection"}</li>
                      <li>• {t("Try refreshing the page") || "Try refreshing the page"}</li>
                      <li>• {t("Clear browser cache if issue persists") || "Clear browser cache if issue persists"}</li>
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

interface AuthErrorBoundaryProps {
  children: React.ReactNode
}

export function AuthErrorBoundary({ children }: AuthErrorBoundaryProps) {
  return (
    <ErrorBoundary
      fallback={({ error, resetError }) => (
        <AuthErrorFallback error={error} resetError={resetError} />
      )}
      showDetails={process.env.NODE_ENV === 'development'}
    >
      {children}
    </ErrorBoundary>
  )
}
