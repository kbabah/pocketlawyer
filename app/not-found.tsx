"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileQuestion, Home, ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 px-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Icon */}
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-muted/50">
          <FileQuestion className="h-12 w-12 text-muted-foreground" />
        </div>

        {/* Content */}
        <div className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tight">404</h1>
          <h2 className="text-2xl font-semibold">Page Not Found</h2>
          <p className="text-muted-foreground">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild variant="default">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Link>
          </Button>
          <Button asChild variant="outline" onClick={() => window.history.back()}>
            <a>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </a>
          </Button>
        </div>
      </div>
    </div>
  )
}
