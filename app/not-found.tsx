"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileQuestion, Home, ArrowLeft, Scale } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Simple header */}
      <div className="border-b border-slate-800 px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <Scale className="h-5 w-5 text-primary" />
          <span className="font-mono text-sm text-slate-300">POCKETLAWYER</span>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-8">
          {/* Icon */}
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 border border-primary/30">
            <FileQuestion className="h-12 w-12 text-primary" />
          </div>

          {/* Content */}
          <div className="space-y-3">
            <h1 className="text-4xl font-bold tracking-tight font-mono text-white">404</h1>
            <h2 className="text-2xl font-semibold text-slate-200">Page Not Found</h2>
            <p className="text-slate-400 font-mono text-sm">
              The page you&apos;re looking for doesn&apos;t exist or has been moved.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 font-mono">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                GO HOME
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 font-mono" onClick={() => window.history.back()}>
              <a>
                <ArrowLeft className="mr-2 h-4 w-4" />
                GO BACK
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
