"use client"

import React, { useState } from "react"
import { useLanguage } from "@/contexts/language-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useIsMobile } from "@/hooks/use-mobile" // Import mobile hook

interface DocumentAnalysisProps {
  onAnalysisComplete: (question: string, answer: string) => void
}

export default function DocumentAnalysis({ onAnalysisComplete }: DocumentAnalysisProps) {
  const { t } = useLanguage()
  const [file, setFile] = useState<File | null>(null)
  const [text, setText] = useState("")
  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState("")
  const [isExtracting, setIsExtracting] = useState(false) // Specific loading state for extraction
  const [isAnalyzing, setIsAnalyzing] = useState(false) // Specific loading state for analysis
  const [error, setError] = useState("")
  const [ocrLanguage, setOcrLanguage] = useState("eng") // Default language: English
  const isMobile = useIsMobile() // Add mobile detection

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null)
    setText("")
    setAnswer("")
    setError("")
  }

  const handleExtract = async () => {
    if (!file) return
    setIsExtracting(true) // Set extracting state
    setError("")
    setText("")
    setAnswer("")
    
    try {
      const formData = new FormData()
      formData.append("file", file)
      // Pass the selected OCR language
      formData.append("language", ocrLanguage)
      
      const res = await fetch("/api/document/process", {
        method: "POST",
        body: formData
      })
      
      // Parse response as JSON and handle potential parsing errors
      let data
      try {
        // Clone the response before reading it to avoid "body stream already read" error
        const resClone = res.clone()
        try {
          // First attempt to parse as JSON
          data = await res.json()
        } catch (jsonError) {
          // If JSON parsing fails, get the text from the cloned response
          console.error("JSON parse error:", jsonError)
          const responseText = await resClone.text()
          throw new Error(`Failed to parse response: ${responseText.substring(0, 100)}...`)
        }
      } catch (parseError) {
        // This will catch errors thrown from within the nested try/catch
        throw parseError;
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
      setIsExtracting(false) // Clear extracting state
    }
  }

  const handleAnalyze = async () => {
    if (!text || !question) return
    setIsAnalyzing(true) // Set analyzing state
    setError("")
    // Keep the previous answer visible until the new one arrives, or clear it if you prefer
    // setAnswer("") 
    
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
      setIsAnalyzing(false) // Clear analyzing state
    }
  }

  const isLoading = isExtracting || isAnalyzing; // Combined loading state for disabling inputs

  // OCR Language options
  const languageOptions = [
    { value: "eng", label: "English" },
    { value: "spa", label: "Spanish" },
    { value: "fra", label: "French" },
    { value: "deu", label: "German" },
    { value: "chi_sim", label: "Chinese (Simplified)" },
    { value: "por", label: "Portuguese" },
    { value: "ara", label: "Arabic" },
    { value: "rus", label: "Russian" }
  ];

  return (
    <div className="space-y-4 px-2 sm:px-4">
      <h3 className="text-xl font-semibold mb-2">{t("document.analyze") || "Document Analysis"}</h3>
      
      <div className="border rounded p-3 sm:p-4">
        <h4 className="text-sm font-medium mb-2">{t("document.select") || "Select Document"}</h4>
        
        {/* Improved dark mode support for info box */}
        <div className="text-xs text-muted-foreground mb-3 bg-muted p-2 rounded flex items-start dark:bg-slate-800 dark:border dark:border-slate-700">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 mt-0.5 flex-shrink-0 text-blue-500"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
          <div>
            <p className="font-medium">File Size Limit: 1MB maximum</p>
            {!isMobile && (
              <>
                <p>Only PDF files are supported. Large documents may take longer to process.</p>
                <p className="mt-1"><strong>New!</strong> OCR support for scanned documents is now available. Select your document's language below for best results.</p>
              </>
            )}
          </div>
        </div>
        
        {/* Stack vertically on mobile, side-by-side on larger screens */}
        <div className="flex flex-col gap-2">
          <div className="w-full">
            <label htmlFor="file-upload" className="block mb-1 text-xs font-medium">{t("document.select.label") || "Select PDF document:"}</label>
            <Input 
              id="file-upload"
              type="file" 
              accept="application/pdf" 
              onChange={handleFileChange} 
              className="mb-2"
              disabled={isLoading}
              aria-describedby="file-upload-description"
            />
           
           {/* Language selector for OCR */}
           <div className="mt-2 mb-2">
             <label htmlFor="ocr-language" className="block mb-1 text-xs font-medium">
               {t("document.ocr.language") || "Document Language (for OCR):"}
             </label>
             <select
               id="ocr-language"
               value={ocrLanguage}
               onChange={(e) => setOcrLanguage(e.target.value)}
               className="w-full px-3 py-2 text-sm border rounded dark:bg-slate-800 dark:border-slate-700"
               disabled={isLoading}
             >
               {languageOptions.map(option => (
                 <option key={option.value} value={option.value}>
                   {option.label}
                 </option>
               ))}
             </select>
             <p className="text-xs text-muted-foreground mt-1">
               {t("document.ocr.language.help") || "Select the primary language of your document for better OCR results"}
             </p>
           </div>
           
            <p id="file-upload-description" className="text-xs text-muted-foreground">
              {isMobile ? "PDF only (max 1MB)" : t("document.select.description") || "Only PDF files up to 1MB are supported."}
            </p>
          </div>
          <Button 
            onClick={handleExtract} 
            disabled={!file || isLoading}
            className="w-full sm:w-auto"
            variant="default"
          >
            {isExtracting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isExtracting ? t("document.extracting") || "Extracting..." : t("document.extract") || "Extract Text"}
          </Button>
        </div>
        
        {file && (
          <p className="text-xs text-muted-foreground mt-2">
            {file.name} ({(file.size / 1024).toFixed(1)} KB)
          </p>
        )}
      </div>

      {/* Announce loading/content changes */}
      <div aria-live="polite" aria-busy={isLoading}>
        {/* Show Skeleton while extracting text - fewer skeletons on mobile */}
        {isExtracting && (
          <div className="border rounded p-3 sm:p-4 space-y-2 dark:border-slate-700" role="status" aria-label={t("document.extracting.aria") || "Extracting document text"}>
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-4 w-1/2 mt-2" />
            {!isMobile && (
              <>
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-2/3" />
              </>
            )}
          </div>
        )}
        
        {/* Document preview - adjust for mobile */}
        {!isExtracting && text && (
          <div className="border rounded p-3 sm:p-4 dark:border-slate-700">
            <h4 className="text-sm font-medium mb-2">{t("document.preview") || "Document Preview"}</h4>
            <Textarea 
              value={text.slice(0, isMobile ? 1000 : 2000) + (text.length > (isMobile ? 1000 : 2000) ? "..." : "")} 
              readOnly 
              rows={isMobile ? 4 : 6} 
              className="font-mono text-xs dark:bg-slate-900"
            />
            
            <div className="mt-3 sm:mt-4 space-y-2">
              <h4 className="text-sm font-medium">{t("document.question.prompt") || "Ask a question about this document"}</h4>
              <Input
                type="text"
                value={question}
                onChange={e => setQuestion(e.target.value)}
                placeholder={isMobile ? "Enter your question..." : t("document.question.placeholder") || "E.g., What are the key legal points in this document?"}
                disabled={isLoading}
              />
              <Button 
                onClick={handleAnalyze} 
                disabled={!question || isLoading}
                className="w-full"
              >
                {isAnalyzing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isAnalyzing ? t("document.analyzing") || "Analyzing..." : t("document.analyze") || "Analyze"}
              </Button>
            </div>
          </div>
        )}
        
        {/* Show Skeleton while analyzing - fewer items on mobile */}
        {isAnalyzing && (
           <div className="bg-muted p-3 sm:p-4 rounded border space-y-2 dark:bg-slate-800 dark:border-slate-700" role="status" aria-label={t("document.analyzing.aria") || "Analyzing document"}>
             <Skeleton className="h-4 w-1/5 mb-1" />
             <Skeleton className="h-4 w-full" />
             {!isMobile && <Skeleton className="h-4 w-full" />}
             <Skeleton className="h-4 w-3/4" />
           </div>
        )}

        {/* Document analysis answer */}
        {!isAnalyzing && answer && (
          <div className="bg-muted p-3 sm:p-4 rounded border dark:bg-slate-800 dark:border-slate-700" role="region" aria-label={t("document.answer.aria") || "Analysis Answer"}>
            <div className="font-semibold mb-2">{t("document.answer") || "Answer"}:</div>
            <div className="text-sm whitespace-pre-wrap">{answer}</div>
          </div>
        )}
      </div>
      
      {/* Error message */}
      {error && (
        <div role="alert" className="bg-red-50 border border-red-200 text-red-700 p-3 rounded dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
          <div className="font-semibold mb-1">{t("error.title") || "Error"}:</div>
          <div className="text-sm">{error}</div>
        </div>
      )}
    </div>
  )
}
