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
      className="min-h-screen relative overflow-hidden"
    >
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-orange-50/20 dark:from-primary/10 dark:via-background dark:to-orange-950/10 -z-10" />
      <div className="absolute top-20 left-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-100/30 dark:bg-orange-900/10 rounded-full blur-3xl -z-10" />

      <div className="flex items-center justify-center min-h-[calc(100vh-120px)] p-4 py-8 sm:py-12">
        <div className="w-full max-w-md space-y-6 animate-fade-in-up">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 shadow-lg">
              <UserPlus className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              {t('Join PocketLawyer today')}
            </h1>
            <p className="text-muted-foreground text-base">
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
          <div className="space-y-3 p-5 bg-gradient-to-br from-muted/50 to-muted/30 rounded-xl border border-border/50">
            <h3 className="text-sm font-semibold">{t('What you get:')}</h3>
            <ul className="space-y-2.5 text-xs text-muted-foreground">
              <li className="flex items-center gap-2.5">
                <div className="h-1.5 w-1.5 bg-primary rounded-full" />
                {t('24/7 AI legal assistance')}
              </li>
              <li className="flex items-center gap-2.5">
                <div className="h-1.5 w-1.5 bg-primary rounded-full" />
                {t('Document analysis and review')}
              </li>
              <li className="flex items-center gap-2.5">
                <div className="h-1.5 w-1.5 bg-primary rounded-full" />
                {t('Secure and confidential conversations')}
              </li>
              <li className="flex items-center gap-2.5">
                <div className="h-1.5 w-1.5 bg-primary rounded-full" />
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
