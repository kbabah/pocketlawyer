"use client"

import { useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { MainLayout } from "@/components/layout/main-layout"
import { AuthForm } from "@/components/auth/auth-form"
import { useLanguage } from "@/contexts/language-context"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Scale } from "lucide-react"
import { AuthErrorBoundary } from "@/components/error-boundaries"

// Loading skeleton for auth form
const AuthFormSkeleton = () => (
  <div className="w-full max-w-md mx-auto space-y-4">
    <Skeleton className="h-32 w-full" />
    <Skeleton className="h-12 w-full" />
    <Skeleton className="h-12 w-full" />
    <Skeleton className="h-10 w-full" />
  </div>
)

// Main sign-in content
function SignInContent() {
  const { t } = useLanguage()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/"
  
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'forgot-password'>('signin')
  
  return (
    <MainLayout
      breadcrumbs={[
        { label: t('Home'), href: '/' },
        { label: t('Sign In'), href: '/sign-in', isCurrentPage: true }
      ]}
      title={t('Authentication')}
      subtitle={t('Sign in to your account or create a new one')}
      showSidebar={false}
      className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20"
    >
      <div className="flex items-center justify-center min-h-[calc(100vh-120px)] p-4">
        <div className="w-full max-w-md space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Scale className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              {authMode === 'signin' 
                ? t('Welcome back to PocketLawyer')
                : authMode === 'signup'
                ? t('Join PocketLawyer today')
                : t('Reset your password')
              }
            </h1>
            <p className="text-muted-foreground">
              {authMode === 'signin'
                ? t('Sign in to access your AI legal assistant')
                : authMode === 'signup'
                ? t('Create an account to get started with legal AI assistance')
                : t('We\'ll send you a link to reset your password')
              }
            </p>
          </div>
          
          {/* Auth Form */}
          <Suspense fallback={<AuthFormSkeleton />}>
            <AuthErrorBoundary>
              <AuthForm 
                mode={authMode}
                onModeChange={setAuthMode}
                redirectUrl={callbackUrl}
              />
            </AuthErrorBoundary>
          </Suspense>
          
          {/* Additional info */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              {t('By signing in, you agree to our')}{' '}
              <a href="/terms" className="text-primary hover:underline">
                {t('Terms of Service')}
              </a>{' '}
              {t('and')}{' '}
              <a href="/privacy" className="text-primary hover:underline">
                {t('Privacy Policy')}
              </a>
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={<AuthFormSkeleton />}>
      <SignInContent />
    </Suspense>
  )
}
