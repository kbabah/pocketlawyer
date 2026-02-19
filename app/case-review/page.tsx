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
import { Label } from "@/components/ui/label"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select"
import { 
  BookOpen, Send, Loader2, Scale, AlertTriangle, 
  ArrowRight, Copy, Check, Sparkles
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const CASE_TYPES = [
  { value: "civil", label: "Civil Dispute" },
  { value: "criminal", label: "Criminal Matter" },
  { value: "commercial", label: "Commercial / Business" },
  { value: "labour", label: "Labour / Employment" },
  { value: "land", label: "Land / Property" },
  { value: "family", label: "Family Law" },
  { value: "administrative", label: "Administrative" },
  { value: "other", label: "Other" },
]

const EXAMPLE_CASES = [
  {
    label: "Wrongful Dismissal",
    description: "Employee fired without notice after 5 years of service",
    caseDetails: "I worked for a company in Douala for 5 years as a senior accountant (CDI contract). My employer terminated my contract immediately without giving any notice or reason. I was not paid any severance. What are my rights?"
  },
  {
    label: "Land Dispute",
    description: "Neighbour building on my registered land",
    caseDetails: "I have a land certificate (titre foncier) for a plot in Yaounde. My neighbour has started building on a portion of my land, claiming it belongs to them by customary right. What can I do legally?"
  },
  {
    label: "Unpaid Invoice",
    description: "Client refuses to pay for delivered goods",
    caseDetails: "My company (SARL) delivered goods worth 15,000,000 FCFA to a client in Cameroon. The goods were accepted but the client refuses to pay after 90 days. We have a signed purchase order. What legal steps can we take?"
  },
]

export default function CaseReviewPage() {
  const { user } = useAuth()
  const { t, language } = useLanguage()
  const isMobile = useIsMobile()
  const [caseType, setCaseType] = useState("")
  const [caseDetails, setCaseDetails] = useState("")
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [step, setStep] = useState<"input" | "chat">("input")

  const { messages, input, handleInputChange, handleSubmit, isLoading, setInput, append } = useChat({
    api: "/api/case-review",
    body: { userId: user?.id, language, caseDetails },
  })

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    toast.success(t("Copied to clipboard"))
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleStartReview = () => {
    if (!caseDetails.trim()) {
      toast.error(t("Please describe your case details"))
      return
    }

    const prompt = caseType
      ? `Please review the following ${CASE_TYPES.find(c => c.value === caseType)?.label || ""} case:\n\n${caseDetails}`
      : `Please review the following case:\n\n${caseDetails}`

    setStep("chat")
    append({ role: "user", content: prompt })
  }

  const handleExampleClick = (example: typeof EXAMPLE_CASES[0]) => {
    setCaseDetails(example.caseDetails)
  }

  const breadcrumbs = [
    { label: t("Home"), href: "/" },
    { label: t("Case Review"), href: "/case-review", isCurrentPage: true },
  ]

  return (
    <MainLayout
      breadcrumbs={breadcrumbs}
      title={t("Case Review")}
      subtitle={t("Get an AI-powered analysis of your legal case under Cameroonian law")}
    >
      <div className="max-w-5xl mx-auto space-y-6 p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20">
            <BookOpen className="h-6 w-6 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{t("Case Review")}</h2>
            <p className="text-sm text-muted-foreground">{t("AI analysis of legal cases under Cameroonian law")}</p>
          </div>
        </div>

        {/* Disclaimer */}
        <Card className="border-amber-500/30 bg-amber-50/50 dark:bg-amber-900/10">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-700 dark:text-amber-400">{t("Disclaimer")}</p>
              <p className="text-xs text-amber-600 dark:text-amber-300 mt-1">
                {t("This tool provides an AI-generated analysis for informational purposes only. It is not legal advice. Please consult a qualified Cameroonian lawyer for professional legal counsel.")}
              </p>
            </div>
          </CardContent>
        </Card>

        {step === "input" ? (
          <div className="space-y-6">
            {/* Case Type Selector */}
            <div className="space-y-2">
              <Label>{t("Case Type")} ({t("optional")})</Label>
              <Select value={caseType} onValueChange={setCaseType}>
                <SelectTrigger className="w-full sm:w-[300px]">
                  <SelectValue placeholder={t("Select case type...")} />
                </SelectTrigger>
                <SelectContent>
                  {CASE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {t(type.label)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Case Details Input */}
            <div className="space-y-2">
              <Label>{t("Describe Your Case")}</Label>
              <Textarea
                value={caseDetails}
                onChange={(e) => setCaseDetails(e.target.value)}
                placeholder={t("Describe the facts of your case in detail. Include: what happened, when, who was involved, any documents or agreements, and what outcome you are seeking...")}
                className="min-h-[200px]"
              />
            </div>

            {/* Example Cases */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
                {t("Example Cases")}
              </h3>
              <div className={cn("grid gap-3", isMobile ? "grid-cols-1" : "grid-cols-3")}>
                {EXAMPLE_CASES.map((example) => (
                  <Card
                    key={example.label}
                    className="cursor-pointer hover:border-orange-500/50 hover:shadow-md transition-all group"
                    onClick={() => handleExampleClick(example)}
                  >
                    <CardContent className="p-4">
                      <p className="font-medium text-sm">{t(example.label)}</p>
                      <p className="text-xs text-muted-foreground mt-1">{t(example.description)}</p>
                      <div className="flex items-center gap-1 mt-2 text-xs text-orange-600 dark:text-orange-400">
                        <span>{t("Use this example")}</span>
                        <ArrowRight className="h-3 w-3" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleStartReview}
              disabled={!caseDetails.trim()}
              className="w-full sm:w-auto"
              size="lg"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              {t("Start Case Review")}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Back button */}
            <Button variant="outline" size="sm" onClick={() => setStep("input")}>
              {t("New Case Review")}
            </Button>

            {/* Messages */}
            <ScrollArea className="h-[500px] rounded-lg border p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={cn(
                    "flex gap-3",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}>
                    {message.role === "assistant" && (
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarFallback className="bg-orange-500/10 text-orange-600">
                          <BookOpen className="h-4 w-4" />
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
                          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => handleCopy(message.content, message.id)}>
                            {copiedId === message.id ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
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
                    <span className="text-sm">{t("Analysing case...")}</span>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Follow-up Input */}
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Textarea
                value={input}
                onChange={handleInputChange}
                placeholder={t("Ask a follow-up question about your case...")}
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
          </div>
        )}

        {/* Knowledge Base Badge */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Sparkles className="h-3 w-3" />
          <span>{t("Analysis enhanced with built-in Cameroonian law knowledge base")}</span>
        </div>
      </div>
    </MainLayout>
  )
}
