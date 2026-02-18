"use client"

import React, { useState } from "react"
import { useChat } from "@ai-sdk/react"
import { MainLayout } from "@/components/layout/main-layout"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  Search, Send, Loader2, Scale, BookOpen, FileText, 
  Landmark, Users, Building, ArrowRight, Sparkles, Copy, Check
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const RESEARCH_TOPICS = [
  { label: "Land & Property Law", icon: Landmark, query: "What are the legal requirements for obtaining a land certificate (titre foncier) in Cameroon?" },
  { label: "Business Formation", icon: Building, query: "How do I register a SARL company in Cameroon under OHADA?" },
  { label: "Labour & Employment", icon: Users, query: "What are the employee termination procedures and severance pay requirements under Cameroon Labour Code?" },
  { label: "Family Law", icon: Users, query: "What are the grounds for divorce in Cameroon and how is property divided?" },
  { label: "Criminal Law", icon: Scale, query: "What are the penalties for fraud and embezzlement under Cameroon Penal Code?" },
  { label: "Tax Law", icon: FileText, query: "What are the key tax obligations for businesses in Cameroon?" },
]

export default function LegalResearchPage() {
  const { user } = useAuth()
  const { t, language } = useLanguage()
  const isMobile = useIsMobile()
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const { messages, input, handleInputChange, handleSubmit, isLoading, setInput } = useChat({
    api: "/api/legal-research",
    body: { userId: user?.id, language },
  })

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    toast.success(t("Copied to clipboard"))
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleTopicClick = (query: string) => {
    setInput(query)
  }

  const breadcrumbs = [
    { label: t("Home"), href: "/" },
    { label: t("Legal Research"), href: "/legal-research", isCurrentPage: true },
  ]

  return (
    <MainLayout
      breadcrumbs={breadcrumbs}
      title={t("Legal Research")}
      subtitle={t("Research Cameroonian law with AI-powered assistance and built-in legal knowledge base")}
    >
      <div className="max-w-5xl mx-auto space-y-6 p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-green-500/10 border border-green-500/20">
            <Search className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{t("Legal Research")}</h2>
            <p className="text-sm text-muted-foreground">{t("Powered by Cameroonian law knowledge base + AI")}</p>
          </div>
        </div>

        {/* Quick Topic Cards - shown when no messages */}
        {messages.length === 0 && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
              {t("Popular Research Topics")}
            </h3>
            <div className={cn("grid gap-3", isMobile ? "grid-cols-1" : "grid-cols-2 lg:grid-cols-3")}>
              {RESEARCH_TOPICS.map((topic) => {
                const Icon = topic.icon
                return (
                  <Card
                    key={topic.label}
                    className="cursor-pointer hover:border-green-500/50 hover:shadow-md transition-all group"
                    onClick={() => handleTopicClick(topic.query)}
                  >
                    <CardContent className="p-4 flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-green-500/10 group-hover:bg-green-500/20 transition-colors">
                        <Icon className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{t(topic.label)}</p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{topic.query}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" />
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.length > 0 && (
          <ScrollArea className="h-[500px] rounded-lg border p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={cn(
                  "flex gap-3",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}>
                  {message.role === "assistant" && (
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback className="bg-green-500/10 text-green-600">
                        <Scale className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className={cn(
                    "rounded-lg px-4 py-3 max-w-[80%]",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}>
                    <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                    {message.role === "assistant" && (
                      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/50">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => handleCopy(message.content, message.id)}
                        >
                          {copiedId === message.id ? (
                            <Check className="h-3 w-3 mr-1" />
                          ) : (
                            <Copy className="h-3 w-3 mr-1" />
                          )}
                          {copiedId === message.id ? t("Copied") : t("Copy")}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">{t("Researching...")}</span>
                </div>
              )}
            </div>
          </ScrollArea>
        )}

        {/* Input */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Textarea
            value={input}
            onChange={handleInputChange}
            placeholder={t("Describe the legal topic you want to research...")}
            className="min-h-[60px] resize-none flex-1"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e as any)
              }
            }}
          />
          <Button type="submit" disabled={isLoading || !input.trim()} className="self-end">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>

        {/* Knowledge Base Badge */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Sparkles className="h-3 w-3" />
          <span>{t("Responses enhanced with built-in Cameroonian law knowledge base (available offline)")}</span>
        </div>
      </div>
    </MainLayout>
  )
}
