"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { FileText, Upload, X, AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useLanguage } from "@/contexts/language-context"

interface DocumentAnalysisProps {
  onAnalysisComplete: (question: string, answer: string) => void
}

export default function DocumentAnalysis({ onAnalysisComplete }: DocumentAnalysisProps) {
  const [file, setFile] = useState<File | null>(null)
  const [fileContent, setFileContent] = useState<string>("")
  const [question, setQuestion] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user } = useAuth()
  const { t, language } = useLanguage()

  const processFile = async (file: File): Promise<string> => {
    if (file.type.includes("pdf")) {
      const formData = new FormData()
      formData.append("file", file)
      
      const response = await fetch("/api/document/process", {
        method: "POST",
        body: formData,
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to process PDF")
      }
      
      const { text } = await response.json()
      return text
    } else {
      // Handle text files directly in the browser
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target?.result as string || "")
        reader.onerror = () => reject(new Error("Failed to read file"))
        reader.readAsText(file)
      })
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError(language === "fr" ? "La taille du fichier dépasse la limite de 5 Mo" : "File size exceeds 5MB limit")
      return
    }

    const fileType = selectedFile.type.toLowerCase()
    if (!fileType.includes("pdf") && !fileType.includes("text") && !fileType.includes("msword") && !fileType.includes("document")) {
      setError(language === "fr" ? "Type de fichier non pris en charge" : "Unsupported file type")
      return
    }

    setFile(selectedFile)
    setError(null)
    setIsProcessing(true)
    setUploadSuccess(false)

    try {
      const content = await processFile(selectedFile)
      if (!content.trim()) {
        throw new Error(
          language === "fr"
            ? "Le document semble être vide ou ne contient pas de texte lisible"
            : "The document appears to be empty or contains no readable text"
        )
      }
      setFileContent(content)
      setUploadSuccess(true)
    } catch (error) {
      console.error("File processing error:", error)
      setError(
        error instanceof Error
          ? error.message
          : language === "fr"
          ? "Échec du traitement du fichier"
          : "Failed to process file"
      )
      setFile(null)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRemoveFile = () => {
    setFile(null)
    setFileContent("")
    setUploadSuccess(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleAnalyze = async () => {
    if (!file || !question.trim() || !fileContent) return

    setIsAnalyzing(true)
    setError(null)

    try {
      const response = await fetch('/api/document/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentContent: fileContent,
          question: question.trim(),
          language
        }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || response.statusText)
      }

      // Add the question and response to the chat
      onAnalysisComplete(question, data.analysis)

      // Reset the question field
      setQuestion("")
    } catch (error) {
      setError(
        language === "fr"
          ? "Échec de l'analyse du document. Veuillez réessayer."
          : "Failed to analyze document. Please try again."
      )
      console.error('Document analysis error:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="flex flex-col h-full w-full max-w-screen-md transition-all duration-300 ease-in-out">
      <ScrollArea className="flex-1 p-4">
        <div className="max-w-xl mx-auto space-y-6">
          {!file ? (
            <Card className="border-dashed border-2 border-primary/20 bg-primary/5">
              <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                <FileText className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-2">{t("document.upload.title")}</h3>
                <p className="text-muted-foreground mb-4">{t("document.upload.subtitle")}</p>
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".pdf,.txt,.doc,.docx,application/pdf,text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  ref={fileInputRef}
                />
                <Button onClick={() => fileInputRef.current?.click()} className="mb-2">
                  <Upload className="h-4 w-4 mr-2" />
                  {t("document.select")}
                </Button>
                {!user && (
                  <p className="text-sm text-muted-foreground mt-4">
                    <AlertCircle className="h-4 w-4 inline mr-1" />
                    {t("document.signin.prompt")}
                  </p>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <Card className="border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-primary flex-shrink-0" />
                      <div>
                        <h3 className="font-medium truncate max-w-[250px] sm:max-w-md">{file.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {(file.size / 1024).toFixed(1)} KB · {file.type || "Document"}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={handleRemoveFile} className="text-muted-foreground">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  {uploadSuccess && (
                    <div className="mt-2 flex items-center text-sm text-green-600 dark:text-green-500">
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      {t("document.uploaded")}
                    </div>
                  )}
                </CardContent>
              </Card>

              {fileContent && (
                <Card className="border-primary/20">
                  <CardContent className="p-4">
                    <h3 className="font-medium mb-2">{t("document.preview")}</h3>
                    <div className="bg-muted/50 p-3 rounded-md text-sm font-mono whitespace-pre-wrap max-h-[200px] overflow-y-auto">
                      {fileContent}
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-2">
                <h3 className="font-medium">{t("document.question.prompt")}</h3>
                <Textarea
                  placeholder={t("document.question.placeholder")}
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="min-h-[100px]"
                />
                <Button onClick={handleAnalyze} disabled={isAnalyzing || !question.trim()} className="w-full">
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {t("document.analyzing")}
                    </>
                  ) : (
                    t("document.analyze")
                  )}
                </Button>
              </div>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>{language === "fr" ? "Erreur" : "Error"}</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
