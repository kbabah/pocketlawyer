"use client"

import type React from "react"
import { useLanguage } from "@/contexts/language-context"

interface DocumentAnalysisProps {
  onAnalysisComplete: (question: string, answer: string) => void
}

export default function DocumentAnalysis({ onAnalysisComplete }: DocumentAnalysisProps) {
  return (
    <div>
      <h3 className="text-xl font-bold mb-2">Document Analysis</h3>
      <p className="text-muted-foreground mb-4">This feature is temporarily disabled.</p>
    </div>
  );
}
