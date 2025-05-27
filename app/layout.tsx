import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AuthProvider } from "@/contexts/auth-context"
import { LanguageProvider } from "@/contexts/language-context"
import { Toaster } from "sonner"
import FloatingChatWidget from "@/components/layout/floating-chat-widget"
import { Metadata } from "next"
import { ErrorBoundary } from "@/components/error-boundary"
import { ErrorFallbackButton } from "@/components/error-fallback-buttons"

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  preload: true,
})

export const metadata: Metadata = {
  title: "PocketLawyer - AI Legal Assistant",
  description: "Get answers to your legal questions with AI assistance. Professional legal guidance powered by artificial intelligence.",
  keywords: ["legal assistant", "AI legal help", "legal advice", "law consultation", "legal questions"],
  authors: [{ name: "PocketLawyer Team" }],
  creator: "PocketLawyer",
  publisher: "PocketLawyer",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  generator: 'Next.js',
  applicationName: 'PocketLawyer',
  referrer: 'origin-when-cross-origin',
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
        sizes: "180x180",
        type: "image/png",
      },
      {
        media: "(prefers-color-scheme: dark)",
        url: "/apple-icon-dark.png",
        href: "/apple-icon-dark.png", 
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: ['fr_FR'],
    url: 'https://pocketlawyer.ai',
    siteName: 'PocketLawyer',
    title: 'PocketLawyer - AI Legal Assistant',
    description: 'Get answers to your legal questions with AI assistance. Professional legal guidance powered by artificial intelligence.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'PocketLawyer - AI Legal Assistant',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PocketLawyer - AI Legal Assistant',
    description: 'Get answers to your legal questions with AI assistance.',
    images: ['/og-image.png'],
    creator: '@pocketlawyer',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  colorScheme: 'light dark',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#ec6307" />
        <meta name="msapplication-TileColor" content="#ec6307" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body 
        className={`${inter.className} flex min-h-screen flex-col antialiased`}
        suppressHydrationWarning
      >
        <ErrorBoundary
          fallback={
            <div className="min-h-screen flex items-center justify-center bg-background">
              <div className="text-center space-y-4 p-8 max-w-md">
                <div className="text-2xl font-bold text-destructive">Application Error</div>
                <p className="text-muted-foreground">
                  Something went wrong. Please refresh the page or contact support if the problem persists.
                </p>
                <ErrorFallbackButton 
                  variant="reload"
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
                  Reload Page
                </ErrorFallbackButton>
              </div>
            </div>
          }
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange={false}
            storageKey="pocket-lawyer-theme"
          >
            <LanguageProvider>
              <ErrorBoundary
                fallback={
                  <div className="min-h-screen flex items-center justify-center bg-background">
                    <div className="text-center space-y-4 p-8 max-w-md">
                      <div className="text-xl font-bold text-destructive">Authentication Error</div>
                      <p className="text-muted-foreground">
                        There was an issue with authentication. Please try refreshing the page.
                      </p>
                    </div>
                  </div>
                }
              >
                <AuthProvider>
                  <SidebarProvider>
                    {/* Main application content */}
                    <main className="flex-1 relative min-h-screen">
                      <ErrorBoundary
                        fallback={
                          <div className="min-h-screen flex items-center justify-center bg-background p-4">
                            <div className="text-center space-y-4 max-w-md">
                              <div className="text-lg font-bold text-destructive">Page Error</div>
                              <p className="text-muted-foreground">
                                There was an error loading this page. Please try again.
                              </p>
                              <ErrorFallbackButton 
                                variant="home"
                                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                              >
                                Go to Home
                              </ErrorFallbackButton>
                            </div>
                          </div>
                        }
                      >
                        {children}
                      </ErrorBoundary>
                    </main>
                    
                    {/* Global floating chat widget */}
                    <ErrorBoundary
                      fallback={null}
                    >
                      <FloatingChatWidget 
                        position="bottom-right"
                        persistState={true}
                      />
                    </ErrorBoundary>
                    
                    {/* Global toast notifications */}
                    <Toaster 
                      position="top-right"
                      expand={true}
                      richColors={true}
                      closeButton={true}
                    />
                  </SidebarProvider>
                </AuthProvider>
              </ErrorBoundary>
            </LanguageProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}