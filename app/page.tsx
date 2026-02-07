"use client"
import React, { Suspense } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import { MainLayout } from "@/components/layout/main-layout"
import { ExampleAIInteractions } from "@/components/example-ai-interactions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Scale, BookOpen, MessageCircle, Users, Shield, Zap, FileText, ArrowRight } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

// Loading component
const ContentSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-8 w-3/4" />
    <Skeleton className="h-32 w-full" />
    <Skeleton className="h-12 w-full" />
  </div>
)

// Hero section for non-authenticated users
const HeroSection = React.memo(() => {
  const { t } = useLanguage()
  
  const features = [
    {
      icon: Scale,
      title: t('Legal Expertise'),
      description: t('Get professional legal guidance powered by AI'),
    },
    {
      icon: MessageCircle,
      title: t('24/7 Availability'),
      description: t('Access legal assistance anytime, anywhere'),
    },
    {
      icon: FileText,
      title: t('Document Analysis'),
      description: t('Upload and analyze legal documents with AI'),
    },
    {
      icon: Shield,
      title: t('Secure & Confidential'),
      description: t('Your conversations are protected and private'),
    },
    {
      icon: Zap,
      title: t('Instant Responses'),
      description: t('Get immediate answers to your legal questions'),
    },
  ]
  
  return (
    <div className="space-y-8">
      {/* Hero banner */}
      <div className="text-center space-y-4 py-8 sm:py-12">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
          {t('Welcome to PocketLawyer')}
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
          {t('Your AI-powered legal assistant for instant answers to legal questions')}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button size="lg" asChild className="text-base">
            <Link href="/sign-up">
              {t('Get Started Free')}
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="text-base">
            <Link href="/examples">
              {t('View Examples')}
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Features grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {features.map((feature, index) => (
          <Card key={index} className="text-center hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-base sm:text-lg">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <CardDescription className="text-sm">
                {feature.description}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
})

HeroSection.displayName = "HeroSection"

// Quick actions for authenticated users
const AuthenticatedDashboard = React.memo(() => {
  const { t } = useLanguage()
  
  const quickActions = [
    {
      icon: MessageCircle,
      title: t('Start Chat'),
      description: t('Get instant AI legal assistance'),
      href: '/chat',
      color: 'text-emerald-500 bg-emerald-500/10',
    },
    {
      icon: FileText,
      title: t('Analyze Document'),
      description: t('Upload and review legal documents'),
      href: '/documents',
      color: 'text-blue-500 bg-blue-500/10',
    },
    {
      icon: Scale,
      title: t('Find a Lawyer'),
      description: t('Connect with verified legal professionals'),
      href: '/lawyers',
      color: 'text-purple-500 bg-purple-500/10',
    },
    {
      icon: BookOpen,
      title: t('My Bookings'),
      description: t('View and manage your consultations'),
      href: '/bookings',
      color: 'text-orange-500 bg-orange-500/10',
    },
  ]
  
  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <Card className="bg-gradient-to-br from-primary/5 to-emerald-500/5 border-primary/20">
        <CardContent className="pt-6">
          <h2 className="text-2xl font-bold mb-2">{t('Welcome back!')}</h2>
          <p className="text-muted-foreground mb-4">
            {t('What would you like to do today?')}
          </p>
        </CardContent>
      </Card>
      
      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {quickActions.map((action, index) => (
          <Link key={index} href={action.href}>
            <Card className="hover:shadow-lg transition-all hover:border-primary/50 cursor-pointer h-full">
              <CardHeader>
                <div className={cn("mb-3 flex h-12 w-12 items-center justify-center rounded-lg", action.color)}>
                  <action.icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg">{action.title}</CardTitle>
                <CardDescription className="flex items-center gap-1">
                  {action.description}
                  <ArrowRight className="h-3 w-3" />
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
})

AuthenticatedDashboard.displayName = "AuthenticatedDashboard"

export default function HomePage() {
  const { user, loading } = useAuth()
  const { t } = useLanguage()
  
  // Check if user is not logged in to show hero section
  const showHero = !user || user.isAnonymous
  const showAuthDashboard = user && !user.isAnonymous
  const showExamples = showHero
  
  // Page breadcrumbs
  const breadcrumbs = [
    { label: t('Home'), href: '/', isCurrentPage: true }
  ]
  
  return (
    <MainLayout
      breadcrumbs={breadcrumbs}
      title={user && !user.isAnonymous ? t('Dashboard') : undefined}
      subtitle={user && !user.isAnonymous ? t('Your legal AI assistant hub') : undefined}
      className="min-h-screen"
    >
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Hero section for non-authenticated users */}
        {showHero && (
          <Suspense fallback={<ContentSkeleton />}>
            <HeroSection />
          </Suspense>
        )}
        
        {/* Dashboard for authenticated users */}
        {showAuthDashboard && (
          <Suspense fallback={<ContentSkeleton />}>
            <AuthenticatedDashboard />
          </Suspense>
        )}
        
        {/* Example interactions for non-authenticated users */}
        {showExamples && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">{t('Example Legal Questions')}</h2>
            </div>
            
            <ExampleAIInteractions />
          </div>
        )}
      </div>
    </MainLayout>
  )
}
