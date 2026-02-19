"use client"

import React, { Suspense } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import { MainLayout } from "@/components/layout/main-layout"
import ChatInterface from "@/components/chat-interface-optimized"
import { MessageCircle, Sparkles } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import Link from "next/link"

// Loading component for chat interface
const ChatInterfaceSkeleton = () => (
  <div className="space-y-4 p-4">
    <Skeleton className="h-8 w-3/4" />
    <Skeleton className="h-32 w-full" />
    <Skeleton className="h-12 w-full" />
  </div>
)

export default function ChatPage() {
  const { user } = useAuth()
  const { t } = useLanguage()

  return (
    <MainLayout
      fullWidth={true}
      breadcrumbs={[
        { label: t('Home'), href: '/' },
        { label: t('Chat'), href: '/chat', isCurrentPage: true }
      ]}
      title={t('Legal Assistant')}
      subtitle={t('Ask any legal question and get instant AI-powered assistance')}
    >
      <div className="flex flex-col h-full">
        {/* Compact header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <MessageCircle className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-base font-bold font-mono tracking-tight leading-tight">
                {t('LEGAL.AI')}
              </h2>
              <p className="text-xs text-muted-foreground leading-tight">
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
                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                {t('Upgrade')}
              </Link>
            </Button>
          )}
        </div>

        {/* Chat fills remaining height */}
        <div className="flex-1 min-h-0">
          <Suspense fallback={<ChatInterfaceSkeleton />}>
            <ChatInterface />
          </Suspense>
        </div>

        {/* Info Section for Guest Users */}
        {user?.isAnonymous && (
          <div className="flex-shrink-0 px-4 py-3 border-t border-border bg-gradient-to-br from-primary/5 to-blue-500/5">
            <div className="max-w-3xl mx-auto">
              <h3 className="text-sm font-semibold mb-1.5 font-mono">
                {t('Unlock Full Access')}
              </h3>
              <div className="grid sm:grid-cols-2 gap-1 text-xs text-muted-foreground mb-2.5">
                <div className="flex items-center gap-1.5">
                  <div className="h-1 w-1 bg-primary rounded-full flex-shrink-0" />
                  {t('Unlimited conversations with AI legal assistant')}
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-1 w-1 bg-primary rounded-full flex-shrink-0" />
                  {t('Save and access chat history anytime')}
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-1 w-1 bg-primary rounded-full flex-shrink-0" />
                  {t('Upload and analyze legal documents')}
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-1 w-1 bg-primary rounded-full flex-shrink-0" />
                  {t('Book consultations with verified lawyers')}
                </div>
              </div>
              <Button asChild size="sm">
                <Link href="/sign-up">
                  {t('Create Free Account')}
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
