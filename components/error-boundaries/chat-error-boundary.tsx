"use client"

import React from 'react'
import { ErrorBoundary } from '../error-boundary'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageSquareX, RotateCcw, Home } from 'lucide-react'
import Link from 'next/link'

interface ChatErrorFallbackProps {
  error?: Error
  resetError?: () => void
}

function ChatErrorFallback({ error, resetError }: ChatErrorFallbackProps) {
  return (
    <div className="flex items-center justify-center min-h-[400px] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <MessageSquareX className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle>Chat Error</CardTitle>
          <CardDescription>
            There was a problem with the chat interface. This might be a temporary issue.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2">
            <Button onClick={resetError} className="w-full">
              <RotateCcw className="mr-2 h-4 w-4" />
              Retry Chat
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Go to Home
              </Link>
            </Button>
          </div>
          {error && (
            <details className="text-sm">
              <summary className="cursor-pointer text-muted-foreground">
                Error Details
              </summary>
              <p className="mt-2 text-xs bg-muted p-2 rounded">
                {error.message}
              </p>
            </details>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export function ChatErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={({ error, resetError }) => (
        <ChatErrorFallback error={error} resetError={resetError} />
      )}
      resetOnPropsChange={true}
    >
      {children}
    </ErrorBoundary>
  )
}
