"use client"

import React, { useState } from "react"
import { useLanguage } from "@/contexts/language-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"

interface DocumentAnalysisProps {
  onAnalysisComplete: (question: string, answer: string) => void
}

export default function DocumentAnalysis({ onAnalysisComplete }: DocumentAnalysisProps) {
  const { t } = useLanguage()
  const [file, setFile] = useState<File | null>(null)
  const [text, setText] = useState("")
  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null)
    setText("")
    setAnswer("")
    setError("")
  }

  const handleExtract = async () => {
    if (!file) return
    setLoading(true)
    setError("")
    setText("")
    setAnswer("")
    
    try {
      const formData = new FormData()
      formData.append("file", file)
      
      const res = await fetch("/api/document/process", {
        method: "POST",
        body: formData
      })
      
      // Parse response as JSON and handle potential parsing errors
      let data
      try {
        data = await res.json()
      } catch (parseError) {
        console.error("JSON parse error:", parseError)
        const responseText = await res.text()
        throw new Error(`Failed to parse response: ${responseText.substring(0, 100)}...`)
      }
      
      if (!res.ok) {
        throw new Error(data.error || `Server error: ${res.status}`)
      }
      
      if (!data.text) {
        throw new Error("No text extracted from document")
      }
      
      setText(data.text)
    } catch (err: any) {
      console.error("Document extraction error:", err)
      setError(err.message || "Failed to extract text from document")
    } finally {
      setLoading(false)
    }
  }

  const handleAnalyze = async () => {
    if (!text || !question) return
    setLoading(true)
    setError("")
    setAnswer("")
    
    try {
      const res = await fetch("/api/document/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, question })
      })
      
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || `Analysis failed: ${res.status}`)
      }
      
      setAnswer(data.answer)
      onAnalysisComplete(question, data.answer)
    } catch (err: any) {
      setError(err.message || "Failed to analyze document")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold mb-2">{t("document.analyze") || "Document Analysis"}</h3>
      
      <div className="border rounded p-4">
        <h4 className="text-sm font-medium mb-2">{t("document.select") || "Select Document"}</h4>
        
        {/* File size limit information */}
        <div className="text-xs text-muted-foreground mb-3 bg-muted p-2 rounded flex items-start">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 mt-0.5"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
          <div>
            <p className="font-medium">File Size Limit: 1MB maximum</p>
            <p>Only PDF files are supported. Large documents may take longer to process.</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 items-start">
          <div className="w-full">
            <label htmlFor="file-upload" className="block mb-1 text-xs">Select PDF document:</label>
            <Input 
              id="file-upload"
              type="file" 
              accept="application/pdf" 
              onChange={handleFileChange} 
              className="mb-2"
            />
          </div>
          <Button 
            onClick={handleExtract} 
            disabled={!file || loading}
            className="mt-2 sm:mt-6"
            variant="default"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? t("document.analyzing") || "Extracting..." : t("document.extract") || "Extract Text"}
          </Button>
        </div>
        
        {file && (
          <p className="text-xs text-muted-foreground mt-2">
            {file.name} ({(file.size / 1024).toFixed(1)} KB)
          </p>
        )}
      </div>
      
      {text && (
        <div className="border rounded p-4">
          <h4 className="text-sm font-medium mb-2">{t("document.preview") || "Document Preview"}</h4>
          <Textarea 
            value={text.slice(0, 2000) + (text.length > 2000 ? "..." : "")} 
            readOnly 
            rows={6} 
            className="font-mono text-xs"
          />
          
          <div className="mt-4 space-y-2">
            <h4 className="text-sm font-medium">{t("document.question.prompt") || "Ask a question about this document"}</h4>
            <Input
              type="text"
              value={question}
              onChange={e => setQuestion(e.target.value)}
              placeholder={t("document.question.placeholder") || "E.g., What are the key legal points in this document?"}
              disabled={loading}
            />
            <Button 
              onClick={handleAnalyze} 
              disabled={!question || loading} 
              className="w-full"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? t("document.analyzing") || "Analyzing..." : t("document.analyze") || "Analyze"}
            </Button>
          </div>
        </div>
      )}
      
      {answer && (
        <div className="bg-muted p-4 rounded border">
          <div className="font-semibold mb-2">{t("document.answer") || "Answer"}:</div>
          <div className="text-sm whitespace-pre-wrap">{answer}</div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded">
          <div className="font-semibold mb-1">Error:</div>
          <div className="text-sm">{error}</div>
        </div>
      )}
    </div>
  )
}
