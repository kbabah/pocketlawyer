"use client"

import React from 'react'
import { ErrorBoundary } from '../error-boundary'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileX, RotateCcw, Home, Upload } from 'lucide-react'
import Link from 'next/link'
import { useLanguage } from '@/contexts/language-context'

interface DocumentErrorFallbackProps {
  error?: Error
  resetError?: () => void
}

function DocumentErrorFallback({ error, resetError }: DocumentErrorFallbackProps) {
  const { t } = useLanguage()

  return (
    <div className="flex items-center justify-center min-h-[400px] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <FileX className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle>{t("Document Error") || "Document Error"}</CardTitle>
          <CardDescription>
            {t("There was a problem processing your document. This might be due to file format or size issues.") || 
             "There was a problem processing your document. This might be due to file format or size issues."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2">
            <Button onClick={resetError} className="w-full">
              <RotateCcw className="mr-2 h-4 w-4" />
              {t("Try Again") || "Try Again"}
            </Button>
            <Button variant="outline" asChild>
              <Link href="/documents">
                <Upload className="mr-2 h-4 w-4" />
                {t("New Document") || "New Document"}
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
                {error.message.includes('PDF') && (
                  <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded text-amber-700 dark:text-amber-300">
                    <p className="font-semibold">{t("Tip") || "Tip"}:</p>
                    <ul className="text-xs mt-1 space-y-1">
                      <li>• {t("Ensure your file is a valid PDF") || "Ensure your file is a valid PDF"}</li>
                      <li>• {t("File size should be under 1MB") || "File size should be under 1MB"}</li>
                      <li>• {t("Try using a different PDF file") || "Try using a different PDF file"}</li>
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

interface DocumentErrorBoundaryProps {
  children: React.ReactNode
}

export function DocumentErrorBoundary({ children }: DocumentErrorBoundaryProps) {
  return (
    <ErrorBoundary
      fallback={({ error, resetError }) => (
        <DocumentErrorFallback error={error} resetError={resetError} />
      )}
      showDetails={process.env.NODE_ENV === 'development'}
    >
      {children}
    </ErrorBoundary>
  )
}
