"use client"

import React, { Suspense } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import { MainLayout } from "@/components/layout/main-layout"
import ChatInterface from "@/components/chat-interface-optimized"
import { Card, CardContent } from "@/components/ui/card"
import { MessageCircle, Sparkles } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import Link from "next/link"

// Loading component for chat interface
const ChatInterfaceSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-8 w-3/4" />
    <Skeleton className="h-32 w-full" />
    <Skeleton className="h-12 w-full" />
  </div>
)

export default function ChatPage() {
  const { user, loading: authLoading } = useAuth()
  const { t } = useLanguage()
  
  // Page breadcrumbs
  const breadcrumbs = [
    { label: t('Home'), href: '/' },
    { label: t('Chat'), href: '/chat', isCurrentPage: true }
  ]
  
  return (
    <MainLayout
      breadcrumbs={breadcrumbs}
      title={t('Legal Assistant')}
      subtitle={t('Ask any legal question and get instant AI-powered assistance')}
      className="min-h-screen"
    >
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <MessageCircle className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold font-mono tracking-tight">
                {t('LEGAL.AI')}
              </h2>
              <p className="text-sm text-muted-foreground">
                {user?.isAnonymous 
                  ? t('Trial Mode - Limited conversations remaining')
                  : t('Powered by advanced AI technology')
                }
              </p>
            </div>
          </div>
          
          {user?.isAnonymous && (
            <Button asChild variant="default" size="sm">
              <Link href="/sign-up">
                <Sparkles className="mr-2 h-4 w-4" />
                {t('Upgrade')}
              </Link>
            </Button>
          )}
        </div>

        {/* Chat Interface */}
        <Card className="border-slate-800/50 bg-slate-900/30">
          <CardContent className="p-0">
            <Suspense fallback={<ChatInterfaceSkeleton />}>
              <div className="min-h-[600px]">
                <ChatInterface />
              </div>
            </Suspense>
          </CardContent>
        </Card>

        {/* Info Section for Guest Users */}
        {user?.isAnonymous && (
          <div className="bg-gradient-to-br from-primary/10 to-blue-500/10 border border-primary/20 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3 font-mono">
              {t('Unlock Full Access')}
            </h3>
            <div className="grid gap-3 text-sm text-muted-foreground mb-4">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 bg-primary rounded-full" />
                {t('Unlimited conversations with AI legal assistant')}
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 bg-primary rounded-full" />
                {t('Save and access chat history anytime')}
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 bg-primary rounded-full" />
                {t('Upload and analyze legal documents')}
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 bg-primary rounded-full" />
                {t('Book consultations with verified lawyers')}
              </div>
            </div>
            <Button asChild className="w-full sm:w-auto">
              <Link href="/sign-up">
                {t('Create Free Account')}
              </Link>
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
