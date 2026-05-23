"use client"

import { Button } from "@/components/ui/button"
import {
  MessageCircle,
  Search,
  FileText,
  Keyboard,
  ArrowRight,
  Check,
} from "lucide-react"

interface WelcomeTutorialProps {
  t: (key: string) => string
  tutorialStep: number
  setTutorialStep: (step: number) => void
  onDismiss: () => void
  onExampleClick: (query: string) => void
}

export function WelcomeTutorial({
  t,
  tutorialStep,
  setTutorialStep,
  onDismiss,
  onExampleClick,
}: WelcomeTutorialProps) {
  const exampleQueries = [
    "What are my rights as a tenant?",
    "How do I form an LLC?",
    "Explain employment discrimination laws",
    "What are the steps for filing a patent?",
  ]

  const tutorialSteps = [
    {
      icon: <MessageCircle className="h-5 w-5 text-blue-500" />,
      title: t("Get Legal Assistance"),
      description: t(
        "Ask any legal question and get clear, informative responses from our AI legal assistant."
      ),
    },
    {
      icon: <Search className="h-5 w-5 text-blue-500" />,
      title: t("Research Legal Topics"),
      description: t(
        "Search legal databases and trusted sources for detailed information."
      ),
    },
    {
      icon: <FileText className="h-5 w-5 text-blue-500" />,
      title: t("Document Analysis"),
      description: t(
        "Upload legal documents for expert analysis and get detailed explanations."
      ),
    },
    {
      icon: <Keyboard className="h-5 w-5 text-blue-500" />,
      title: t("Quick Access"),
      description: t(
        "Use keyboard shortcuts for faster navigation and improved workflow."
      ),
    },
  ]

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-500 px-1 sm:px-0 max-w-3xl mx-auto w-full">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-primary">{t("Your Legal Assistant")}</h2>
        <p className="text-lg text-muted-foreground">
          {t("Get expert legal guidance with our AI-powered assistant")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {tutorialSteps.map((step, index) => (
          <div
            key={index}
            className={`p-4 border rounded-lg transition-all duration-300 cursor-pointer ${
              tutorialStep === index
                ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20 shadow-sm"
                : "border-border hover:border-blue-300 dark:hover:border-blue-700"
            }`}
            onClick={() => setTutorialStep(index)}
          >
            <div className="flex items-center gap-3">
              <div className="shrink-0 p-2 rounded-full bg-primary/10">{step.icon}</div>
              <div>
                <h3 className="font-medium">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3 border-t pt-3">
        <h3 className="font-medium text-center">{t("What would you like to know?")}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {exampleQueries.map((query, index) => (
            <button
              key={index}
              type="button"
              className="p-2 text-left text-sm border rounded-md hover:bg-primary/5 hover:border-primary/30 transition-colors"
              onClick={() => onExampleClick(query)}
            >
              <span className="flex items-center gap-2">
                <ArrowRight className="h-3 w-3 text-primary" />
                {query}
              </span>
            </button>
          ))}
        </div>
      </div>

      {tutorialStep === 3 && (
        <div className="border rounded-lg p-4 bg-secondary/10 space-y-3">
          <h3 className="font-medium flex items-center gap-2">
            <Keyboard className="h-4 w-4" />
            {t("Keyboard Shortcuts")}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <div className="flex items-center justify-between">
              <span>/ (Slash)</span>
              <span className="text-muted-foreground">{t("Focus input")}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Ctrl+Enter / ⌘+Enter</span>
              <span className="text-muted-foreground">{t("Send message")}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Ctrl+F / ⌘+F</span>
              <span className="text-muted-foreground">{t("Search in chat")}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>F3</span>
              <span className="text-muted-foreground">{t("Next result")}</span>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-center pt-2">
        <Button variant="ghost" size="sm" onClick={onDismiss} className="text-muted-foreground">
          <Check className="h-4 w-4 mr-1" />
          {t("Got it, let's begin")}
        </Button>
      </div>
    </div>
  )
}
