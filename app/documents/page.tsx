"use client"

import { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
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
  Share
} from "lucide-react"

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
  createdAt: Date
}

export default function DocumentsPage() {
  const { t } = useLanguage()
  const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([])
  const [selectedFile, setSelectedFile] = useState<ProcessedFile | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  // Handle file processing completion
  const handleFileProcessed = (uploadFile: any) => {
    const newFile: ProcessedFile = {
      id: uploadFile.id,
      name: uploadFile.file.name,
      extractedText: uploadFile.extractedText,
      uploadedAt: uploadFile.uploadedAt,
      analyses: []
    }
    
    setProcessedFiles(prev => [...prev, newFile])
    
    // Auto-select the first uploaded file
    if (!selectedFile) {
      setSelectedFile(newFile)
    }
  }

  // Handle document analysis
  const handleAnalyzeDocument = async () => {
    if (!selectedFile || !currentQuestion.trim()) {
      toast.error(t('Please select a document and enter a question'))
      return
    }

    setIsAnalyzing(true)

    try {
      const response = await fetch("/api/document/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          text: selectedFile.extractedText, 
          question: currentQuestion.trim() 
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Analysis failed' }))
        throw new Error(errorData.error || `Analysis failed: ${response.status}`)
      }

      const data = await response.json()
      
      const newAnalysis: Analysis = {
        id: `analysis_${Date.now()}`,
        question: currentQuestion.trim(),
        answer: data.answer,
        createdAt: new Date()
      }

      // Update the selected file with the new analysis
      setProcessedFiles(prev => prev.map(file => 
        file.id === selectedFile.id 
          ? { ...file, analyses: [...file.analyses, newAnalysis] }
          : file
      ))

      // Update selected file state
      setSelectedFile(prev => prev ? {
        ...prev,
        analyses: [...prev.analyses, newAnalysis]
      } : null)

      setCurrentQuestion("")
      toast.success(t('Document analysis completed'))

    } catch (error: any) {
      toast.error(t(`Analysis failed: ${error.message}`))
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Handle key press for quick analysis
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleAnalyzeDocument()
    }
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
                        <Badge variant="secondary" className="text-xs">
                          {file.analyses.length} analysis
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {file.extractedText.substring(0, 100)}...
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
                  <CardDescription>
                    {t('Ask questions about')}: {selectedFile.name}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                {selectedFile ? (
                  <>
                    {/* Document Preview */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium">{t('Document Preview')}</h4>
                      <Textarea
                        value={selectedFile.extractedText.substring(0, 500) + 
                               (selectedFile.extractedText.length > 500 ? '...' : '')}
                        readOnly
                        rows={4}
                        className="font-mono text-xs resize-none"
                      />
                      <p className="text-xs text-muted-foreground">
                        {t('Total characters')}: {selectedFile.extractedText.length.toLocaleString()}
                      </p>
                    </div>

                    <Separator />

                    {/* Question Input */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium">{t('Ask a Question')}</h4>
                      <div className="flex gap-2">
                        <Input
                          placeholder={t('What are the key points in this document?')}
                          value={currentQuestion}
                          onChange={(e) => setCurrentQuestion(e.target.value)}
                          onKeyDown={handleKeyPress}
                          disabled={isAnalyzing}
                          className="flex-1"
                        />
                        <Button
                          onClick={handleAnalyzeDocument}
                          disabled={isAnalyzing || !currentQuestion.trim()}
                          className="gap-2"
                        >
                          {isAnalyzing ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                          {isAnalyzing ? t('Analyzing') : t('Analyze')}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {t('Press')} <kbd className="px-1 py-0.5 text-xs bg-muted rounded">Cmd/Ctrl + Enter</kbd> {t('for quick analysis')}
                      </p>
                    </div>

                    {/* Analysis History */}
                    {selectedFile.analyses.length > 0 && (
                      <>
                        <Separator />
                        <div className="space-y-4">
                          <h4 className="text-sm font-medium flex items-center gap-2">
                            <History className="h-4 w-4" />
                            {t('Analysis History')}
                          </h4>
                          <div className="space-y-4 max-h-96 overflow-y-auto">
                            {selectedFile.analyses.map((analysis) => (
                              <div key={analysis.id} className="space-y-3 p-4 bg-muted/30 rounded-lg">
                                <div className="space-y-1">
                                  <h5 className="text-sm font-medium">{t('Question')}:</h5>
                                  <p className="text-sm text-muted-foreground">{analysis.question}</p>
                                </div>
                                <div className="space-y-1">
                                  <h5 className="text-sm font-medium">{t('Answer')}:</h5>
                                  <div className="text-sm whitespace-pre-wrap">{analysis.answer}</div>
                                </div>
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                  <span>{new Date(analysis.createdAt).toLocaleString()}</span>
                                  <div className="flex gap-2">
                                    <Button size="sm" variant="ghost" className="h-6 px-2">
                                      <Share className="h-3 w-3" />
                                    </Button>
                                    <Button size="sm" variant="ghost" className="h-6 px-2">
                                      <Download className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
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
                  {t('Scanned documents are automatically processed with OCR')}
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
