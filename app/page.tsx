"use client"
import React, { Suspense } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import { MainLayout } from "@/components/layout/main-layout"
import ChatInterface from "@/components/chat-interface-optimized"
import { ExampleAIInteractions } from "@/components/example-ai-interactions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Scale, BookOpen, MessageCircle, Users, Shield, Zap, FileText } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

// Loading component for chat interface
const ChatInterfaceSkeleton = () => (
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

export default function HomePage() {
  const { user, loading } = useAuth()
  const { t } = useLanguage()
  
  // Check if user is not logged in to show hero section
  const showHero = !user || user.isAnonymous
  const showExamples = showHero
  
  // Page breadcrumbs
  const breadcrumbs = [
    { label: t('Home'), href: '/', isCurrentPage: true }
  ]
  
  return (
    <MainLayout
      breadcrumbs={breadcrumbs}
      title={user ? t('Legal Assistant') : undefined}
      subtitle={user ? t('Ask any legal question and get instant AI-powered assistance') : undefined}
      className="min-h-screen"
    >
      <div className="grid gap-6 lg:gap-8">
        {/* Hero section for non-authenticated users */}
        {showHero && (
          <div className="lg:col-span-2">
            <HeroSection />
          </div>
        )}
        
        {/* Main chat interface */}
        <div className={cn(
          "space-y-6",
          showHero ? "lg:col-span-2" : "lg:col-span-3"
        )}>
          {user && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">{t('Chat with Legal Assistant')}</h2>
              </div>
              
              <Card className="border-0 shadow-sm">
                <CardContent className="p-0">
                  <Suspense fallback={<ChatInterfaceSkeleton />}>
                    <div className="min-h-[600px]">
                      <ChatInterface />
                    </div>
                  </Suspense>
                </CardContent>
              </Card>
            </div>
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
        
        {/* Sidebar content for authenticated users */}
        {user && !user.isAnonymous && (
          <div className="space-y-6 lg:col-span-1">
            {/* Quick actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('Quick Actions')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/document">
                    <BookOpen className="mr-2 h-4 w-4" />
                    {t('Document Analysis')}
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/examples">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    {t('View Examples')}
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/profile">
                    <Users className="mr-2 h-4 w-4" />
                    {t('Profile Settings')}
                  </Link>
                </Button>
              </CardContent>
            </Card>
            
            {/* Recent activity placeholder */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('Recent Activity')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {t('Your recent legal consultations will appear here')}
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
