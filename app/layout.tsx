import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AuthProvider } from "@/contexts/auth-context"
import { LanguageProvider } from "@/contexts/language-context"
import { Metadata } from "next"

const inter = Inter({ subsets: ["latin"] })

// Base URL for canonical URLs
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://pocket-lawyer.com'; 

export const metadata: Metadata = {
  title: "PocketLawyer - AI Legal Assistant",
  description: "Get answers to your legal questions with AI assistance",
  generator: 'v0.dev',
  metadataBase: new URL(baseUrl),
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [
      {
        media: "(prefers-color-scheme: light)",
        url: "/favicon-light.ico",
        href: "/favicon-light.ico",
      },
      {
        media: "(prefers-color-scheme: dark)",
        url: "/favicon-dark.ico",
        href: "/favicon-dark.ico",
      },
    ],
    apple: [
      {
        media: "(prefers-color-scheme: light)",
        url: "/apple-icon-light.png",
        href: "/apple-icon-light.png",
      },
      {
        media: "(prefers-color-scheme: dark)",
        url: "/apple-icon-dark.png",
        href: "/apple-icon-dark.png",
      },
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover" />
        <link rel="icon" href="/favicon-dark.ico" />
        {/* The canonical URL will be set by Next.js based on the metadata */}
      </head>
      <body 
        className={`${inter.className} flex min-h-screen flex-col antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          storageKey="pocket-lawyer-theme"
        >
          <LanguageProvider>
            <AuthProvider>
              <SidebarProvider>
                <main className="flex-1 relative">{children}</main>
              </SidebarProvider>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}