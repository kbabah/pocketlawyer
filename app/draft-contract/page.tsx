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
  FileEdit, Send, Loader2, Download, 
  ArrowRight, Copy, Check, Sparkles
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const CONTRACT_TYPES = [
  { value: "employment", label: "Employment Contract", description: "CDI/CDD under Cameroon Labour Code" },
  { value: "lease", label: "Lease Agreement", description: "Residential or commercial rental" },
  { value: "sale", label: "Sale of Goods", description: "Commercial sale under OHADA" },
  { value: "service", label: "Service Agreement", description: "Consulting or professional services" },
  { value: "nda", label: "Non-Disclosure Agreement", description: "Confidentiality agreement" },
  { value: "partnership", label: "Partnership Agreement", description: "Business partnership terms" },
  { value: "loan", label: "Loan Agreement", description: "Personal or business loan" },
  { value: "power-of-attorney", label: "Power of Attorney", description: "Procuration / legal representation" },
  { value: "custom", label: "Custom Contract", description: "Describe your specific needs" },
]

export default function DraftContractPage() {
  const { user } = useAuth()
  const { t, language } = useLanguage()
  const isMobile = useIsMobile()
  const [contractType, setContractType] = useState("")
  const [requirements, setRequirements] = useState("")
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [step, setStep] = useState<"select" | "details" | "chat">("select")

  const { messages, input, handleInputChange, handleSubmit, isLoading, append } = useChat({
    api: "/api/draft-contract",
    body: { userId: user?.id, language, contractType },
  })

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    toast.success(t("Copied to clipboard"))
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleDownload = (text: string, title: string) => {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${title.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
    toast.success(t("Contract downloaded"))
  }

  const handleStartDraft = () => {
    if (!contractType) {
      toast.error(t("Please select a contract type"))
      return
    }

    const typeLabel = CONTRACT_TYPES.find(c => c.value === contractType)?.label || "contract"

    const prompt = requirements.trim()
      ? `Please draft a ${typeLabel} with the following requirements:\n\n${requirements}`
      : `Please draft a ${typeLabel} compliant with Cameroonian law. Include all standard clauses and placeholders for the parties' details.`

    setStep("chat")
    append({ role: "user", content: prompt })
  }

  const breadcrumbs = [
    { label: t("Home"), href: "/" },
    { label: t("Draft Contract"), href: "/draft-contract", isCurrentPage: true },
  ]

  return (
    <MainLayout
      breadcrumbs={breadcrumbs}
      title={t("Draft Contract")}
      subtitle={t("Generate professional legal contracts compliant with Cameroonian law and OHADA")}
    >
      <div className="max-w-5xl mx-auto space-y-6 p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
            <FileEdit className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{t("Draft Contract")}</h2>
            <p className="text-sm text-muted-foreground">{t("AI-powered contract generation for Cameroon")}</p>
          </div>
        </div>

        {step === "select" || step === "details" ? (
          <div className="space-y-6">
            {/* Contract Type Selection */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
                {t("Select Contract Type")}
              </h3>
              <div className={cn("grid gap-3", isMobile ? "grid-cols-1" : "grid-cols-2 lg:grid-cols-3")}>
                {CONTRACT_TYPES.map((type) => (
                  <Card
                    key={type.value}
                    className={cn(
                      "cursor-pointer transition-all group",
                      contractType === type.value
                        ? "border-purple-500 shadow-md bg-purple-50/50 dark:bg-purple-900/10"
                        : "hover:border-purple-500/50 hover:shadow-md"
                    )}
                    onClick={() => {
                      setContractType(type.value)
                      setStep("details")
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{t(type.label)}</p>
                          <p className="text-xs text-muted-foreground mt-1">{t(type.description)}</p>
                        </div>
                        <ArrowRight className={cn(
                          "h-4 w-4 transition-opacity flex-shrink-0",
                          contractType === type.value ? "opacity-100 text-purple-600" : "opacity-0 group-hover:opacity-100 text-muted-foreground"
                        )} />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Requirements Input */}
            {step === "details" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>{t("Additional Requirements")} ({t("optional")})</Label>
                  <Textarea
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                    placeholder={t("Describe any specific requirements: parties involved, key terms, special clauses, language preference (English/French)...")}
                    className="min-h-[150px]"
                  />
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => { setStep("select"); setContractType("") }}>
                    {t("Back")}
                  </Button>
                  <Button onClick={handleStartDraft} size="lg">
                    <FileEdit className="h-4 w-4 mr-2" />
                    {t("Generate Contract")}
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Back button */}
            <Button variant="outline" size="sm" onClick={() => { setStep("select"); setContractType("") }}>
              {t("New Contract")}
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
                        <AvatarFallback className="bg-purple-500/10 text-purple-600">
                          <FileEdit className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className={cn(
                      "rounded-lg px-4 py-3 max-w-[85%]",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}>
                      <div className="whitespace-pre-wrap text-sm font-mono">{message.content}</div>
                      {message.role === "assistant" && (
                        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/50">
                          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => handleCopy(message.content, message.id)}>
                            {copiedId === message.id ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                            {copiedId === message.id ? t("Copied") : t("Copy")}
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => handleDownload(message.content, contractType)}>
                            <Download className="h-3 w-3 mr-1" />
                            {t("Download")}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">{t("Drafting contract...")}</span>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Follow-up Input */}
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Textarea
                value={input}
                onChange={handleInputChange}
                placeholder={t("Request modifications to the contract...")}
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
          <span>{t("Contracts generated using Cameroonian law templates and OHADA provisions")}</span>
        </div>
      </div>
    </MainLayout>
  )
}
