"use client"

import { useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { MainLayout } from "@/components/layout/main-layout"
import { AuthForm } from "@/components/auth/auth-form"
import { useLanguage } from "@/contexts/language-context"
import { Skeleton } from "@/components/ui/skeleton"
import { UserPlus } from "lucide-react"
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

// Main sign-up content
function SignUpContent() {
  const { t } = useLanguage()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/"
  
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'forgot-password'>('signup')
  
  return (
    <MainLayout
      breadcrumbs={[
        { label: t('Home'), href: '/' },
        { label: t('Sign Up'), href: '/sign-up', isCurrentPage: true }
      ]}
      title={t('Create Account')}
      subtitle={t('Join PocketLawyer and get instant access to AI legal assistance')}
      showSidebar={false}
      className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20"
    >
      <div className="flex items-center justify-center min-h-[calc(100vh-120px)] p-4">
        <div className="w-full max-w-md space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <UserPlus className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              {t('Join PocketLawyer today')}
            </h1>
            <p className="text-muted-foreground">
              {t('Create an account to get started with legal AI assistance')}
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
          
          {/* Benefits */}
          <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
            <h3 className="text-sm font-medium">{t('What you get:')}</h3>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-center gap-2">
                <div className="h-1 w-1 bg-primary rounded-full" />
                {t('24/7 AI legal assistance')}
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1 w-1 bg-primary rounded-full" />
                {t('Document analysis and review')}
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1 w-1 bg-primary rounded-full" />
                {t('Secure and confidential conversations')}
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1 w-1 bg-primary rounded-full" />
                {t('Multi-language support')}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<AuthFormSkeleton />}>
      <SignUpContent />
    </Suspense>
  )
}
