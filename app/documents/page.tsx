"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { MainLayout } from "@/components/layout/main-layout"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import EnhancedDocumentUpload from "@/components/enhanced-document-upload"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import {
  FileText,
  MessageSquare,
  Brain,
  Loader2,
  Send,
  History,
  Download,
  Share,
  AlertTriangle,
  Sparkles
} from "lucide-react"

interface UploadFile {
  id: string
  file: File
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error'
  progress: number
  extractedText?: string
  error?: string
  uploadedAt?: Date
  language?: string
  ocr?: boolean
}

interface ProcessedFile {
  id: string
  name: string
  extractedText: string
  uploadedAt: Date
  analyses: Analysis[]
}

interface Analysis {
  id: string
  question: string
  answer: string
  truncated?: boolean
  createdAt: Date
}

const QUICK_QUESTIONS = [
  "Summarize the key points of this document",
  "Who are the parties involved and what are their obligations?",
  "What are the important dates and deadlines?",
  "Identify any potential legal risks or problematic clauses",
  "What legal rights are established in this document?",
  "Is this document enforceable under Cameroonian law?",
]

export default function DocumentsPage() {
  const { user, loading: authLoading } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()
  const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([])
  const [selectedFile, setSelectedFile] = useState<ProcessedFile | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const analysisEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!authLoading && (!user || user.isAnonymous)) {
      router.push("/sign-in?redirect=/documents")
    }
  }, [user, authLoading, router])

  if (authLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </MainLayout>
    )
  }

  if (!user || user.isAnonymous) return null

  // Handle file processing completion
  const handleFileProcessed = (uploadFile: UploadFile) => {
    const newFile: ProcessedFile = {
      id: uploadFile.id,
      name: uploadFile.file.name,
      extractedText: uploadFile.extractedText || '',
      uploadedAt: uploadFile.uploadedAt || new Date(),
      analyses: []
    }

    setProcessedFiles(prev => {
      // Avoid duplicates on hot reload
      if (prev.some(f => f.id === newFile.id)) return prev
      return [...prev, newFile]
    })

    // Auto-select the first uploaded file
    setSelectedFile(prev => prev ?? newFile)
  }

  // Handle document analysis
  const handleAnalyzeDocument = async (question?: string) => {
    const q = (question || currentQuestion).trim()
    if (!selectedFile || !q) {
      toast.error(t('Please select a document and enter a question'))
      return
    }

    setIsAnalyzing(true)
    if (!question) setCurrentQuestion("")

    try {
      const response = await fetch("/api/document/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: selectedFile.extractedText,
          question: q
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `Analysis failed: ${response.status}`)
      }

      const newAnalysis: Analysis = {
        id: `analysis_${Date.now()}`,
        question: q,
        answer: data.answer,
        truncated: data.truncated,
        createdAt: new Date()
      }

      const updater = (file: ProcessedFile) =>
        file.id === selectedFile.id
          ? { ...file, analyses: [...file.analyses, newAnalysis] }
          : file

      setProcessedFiles(prev => prev.map(updater))
      setSelectedFile(prev => prev ? updater(prev) : null)

      // Scroll to latest analysis
      setTimeout(() => analysisEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)

    } catch (error: any) {
      toast.error(error.message || t('Analysis failed'))
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleAnalyzeDocument()
    }
  }

  // Copy analysis to clipboard
  const copyAnalysis = (analysis: Analysis) => {
    const text = `Q: ${analysis.question}\n\nA: ${analysis.answer}`
    navigator.clipboard.writeText(text).then(() => toast.success(t('Copied to clipboard')))
  }

  return (
    <MainLayout
      breadcrumbs={[
        { label: t('Home'), href: '/' },
        { label: t('Documents'), href: '/documents', isCurrentPage: true }
      ]}
      title={t('Document Analysis Center')}
      subtitle={t('Upload, analyze, and extract insights from your legal documents')}
      className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20"
    >
      <div className="space-y-8">
        {/* Enhanced Document Upload */}
        <EnhancedDocumentUpload
          onFileProcessed={handleFileProcessed}
          maxFiles={10}
          maxFileSize={10}
        />

        {/* Document Analysis Section */}
        {processedFiles.length > 0 && (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* File List */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {t('Processed Documents')}
                </CardTitle>
                <CardDescription>
                  {t('Click on a document to analyze it')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {processedFiles.map((file) => (
                  <div
                    key={file.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedFile?.id === file.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50 hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedFile(file)}
                  >
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium truncate">{file.name}</h4>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>
                        <div className="flex gap-1">
                          <Badge variant="secondary" className="text-xs">
                            {file.analyses.length} Q&amp;A
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {(file.extractedText.length / 1000).toFixed(0)}k
                          </Badge>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {file.extractedText.substring(0, 120)}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Analysis Interface */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  {selectedFile ? t('Analyze Document') : t('Select a Document')}
                </CardTitle>
                {selectedFile && (
                  <CardDescription className="flex items-center gap-2">
                    {selectedFile.name}
                    <Badge variant="outline" className="text-xs">
                      {selectedFile.extractedText.length.toLocaleString()} {t('characters')}
                    </Badge>
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                {selectedFile ? (
                  <>
                    {/* Document Preview */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">{t('Document Preview')}</h4>
                      <Textarea
                        value={selectedFile.extractedText.substring(0, 600) +
                               (selectedFile.extractedText.length > 600 ? '\n\n[…document continues…]' : '')}
                        readOnly
                        rows={5}
                        className="font-mono text-xs resize-none bg-muted/30"
                      />
                    </div>

                    <Separator />

                    {/* Quick Questions */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        {t('Quick Analysis')}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {QUICK_QUESTIONS.map((q, i) => (
                          <button
                            key={i}
                            onClick={() => handleAnalyzeDocument(q)}
                            disabled={isAnalyzing}
                            className="text-xs px-3 py-1.5 rounded-full border border-border hover:border-primary hover:bg-primary/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left"
                          >
                            {t(q)}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Question Input */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">{t('Custom Question')}</h4>
                      <div className="flex gap-2">
                        <Input
                          placeholder={t('Ask a specific question about this document...')}
                          value={currentQuestion}
                          onChange={(e) => setCurrentQuestion(e.target.value)}
                          onKeyDown={handleKeyDown}
                          disabled={isAnalyzing}
                          className="flex-1"
                        />
                        <Button
                          onClick={() => handleAnalyzeDocument()}
                          disabled={isAnalyzing || !currentQuestion.trim()}
                          className="gap-2 shrink-0"
                        >
                          {isAnalyzing ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                          {isAnalyzing ? t('Analyzing…') : t('Analyze')}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {t('Tip')}: <kbd className="px-1 py-0.5 text-xs bg-muted rounded">Cmd/Ctrl + Enter</kbd> {t('to submit')}
                      </p>
                    </div>

                    {/* Loading indicator */}
                    {isAnalyzing && (
                      <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg border">
                        <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />
                        <p className="text-sm text-muted-foreground">{t('Analyzing your document with AI…')}</p>
                      </div>
                    )}

                    {/* Analysis History */}
                    {selectedFile.analyses.length > 0 && (
                      <>
                        <Separator />
                        <div className="space-y-4">
                          <h4 className="text-sm font-medium flex items-center gap-2">
                            <History className="h-4 w-4" />
                            {t('Analysis History')}
                            <Badge variant="secondary">{selectedFile.analyses.length}</Badge>
                          </h4>
                          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                            {[...selectedFile.analyses].reverse().map((analysis) => (
                              <div key={analysis.id} className="space-y-3 p-4 bg-muted/30 rounded-lg border">
                                {analysis.truncated && (
                                  <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
                                    <AlertTriangle className="h-3 w-3 shrink-0" />
                                    {t('Document was truncated. Analysis based on first portion only.')}
                                  </div>
                                )}
                                <div className="space-y-1">
                                  <h5 className="text-xs font-semibold text-primary uppercase tracking-wide">{t('Question')}</h5>
                                  <p className="text-sm">{analysis.question}</p>
                                </div>
                                <div className="space-y-1">
                                  <h5 className="text-xs font-semibold text-primary uppercase tracking-wide">{t('Answer')}</h5>
                                  <div className="text-sm whitespace-pre-wrap leading-relaxed">{analysis.answer}</div>
                                </div>
                                <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t">
                                  <span>{new Date(analysis.createdAt).toLocaleString()}</span>
                                  <div className="flex gap-1">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-6 px-2 gap-1 text-xs"
                                      onClick={() => copyAnalysis(analysis)}
                                    >
                                      <Share className="h-3 w-3" />
                                      {t('Copy')}
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-6 px-2 gap-1 text-xs"
                                      onClick={() => {
                                        const blob = new Blob(
                                          [`Q: ${analysis.question}\n\nA: ${analysis.answer}`],
                                          { type: 'text/plain' }
                                        )
                                        const url = URL.createObjectURL(blob)
                                        const a = document.createElement('a')
                                        a.href = url
                                        a.download = `analysis-${analysis.id}.txt`
                                        a.click()
                                        URL.revokeObjectURL(url)
                                      }}
                                    >
                                      <Download className="h-3 w-3" />
                                      {t('Save')}
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                            <div ref={analysisEndRef} />
                          </div>
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h4 className="text-lg font-medium mb-2">{t('No document selected')}</h4>
                    <p className="text-muted-foreground">
                      {t('Upload a document above or select one from the list to start analyzing')}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quick Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('Quick Tips')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">{t('Supported Formats')}</h4>
                <p className="text-xs text-muted-foreground">
                  {t('PDF, DOCX, and TXT files up to 10MB each')}
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-sm">{t('OCR Support')}</h4>
                <p className="text-xs text-muted-foreground">
                  {t('Scanned PDFs automatically fall back to Tesseract OCR')}
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-sm">{t('AI Analysis')}</h4>
                <p className="text-xs text-muted-foreground">
                  {t('Ask specific questions about your documents for detailed insights')}
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-sm">{t('Secure Processing')}</h4>
                <p className="text-xs text-muted-foreground">
                  {t('All documents are processed securely and confidentially')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
