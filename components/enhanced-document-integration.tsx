"use client"

import React, { useState, useCallback } from "react"
import { useLanguage } from "@/contexts/language-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"
import { 
  Upload, 
  FileText, 
  MessageSquare, 
  Sparkles, 
  Eye,
  Download,
  Search,
  BookOpen,
  AlertCircle,
  CheckCircle2,
  Clock,
  Trash2,
  Plus
} from "lucide-react"
import { cn } from "@/lib/utils"
import EnhancedDocumentUpload from "./enhanced-document-upload"

interface ProcessedDocument {
  id: string
  name: string
  type: string
  size: number
  extractedText: string
  uploadedAt: Date
  status: 'processed' | 'analyzing' | 'completed'
  analysis?: DocumentAnalysis[]
}

interface DocumentAnalysis {
  id: string
  question: string
  answer: string
  timestamp: Date
  confidence?: number
}

interface EnhancedDocumentIntegrationProps {
  onAnalysisComplete?: (question: string, answer: string, documentId?: string) => void
  className?: string
}

export default function EnhancedDocumentIntegration({
  onAnalysisComplete,
  className
}: EnhancedDocumentIntegrationProps) {
  const { t } = useLanguage()
  
  // State management
  const [processedDocuments, setProcessedDocuments] = useState<ProcessedDocument[]>([])
  const [selectedDocument, setSelectedDocument] = useState<ProcessedDocument | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisHistory, setAnalysisHistory] = useState<DocumentAnalysis[]>([])

  // Handle file processing completion
  const handleFileProcessed = useCallback((file: any) => {
    if (file.status === 'completed' && file.extractedText) {
      const newDocument: ProcessedDocument = {
        id: file.id,
        name: file.file.name,
        type: file.file.type,
        size: file.file.size,
        extractedText: file.extractedText,
        uploadedAt: file.uploadedAt || new Date(),
        status: 'processed',
        analysis: []
      }
      
      setProcessedDocuments(prev => [...prev, newDocument])
      toast.success(t('Document processed successfully'))
    }
  }, [t])

  // Handle document analysis request
  const handleDocumentAnalysis = useCallback(async (question: string, documentId?: string) => {
    const document = documentId 
      ? processedDocuments.find(doc => doc.id === documentId)
      : selectedDocument

    if (!document) {
      toast.error(t('Please select a document first'))
      return
    }

    setIsAnalyzing(true)

    try {
      const response = await fetch('/api/document/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          documentContent: document.extractedText,
          documentName: document.name
        })
      })

      if (!response.ok) {
        throw new Error('Failed to analyze document')
      }

      const { answer } = await response.json()

      // Create analysis record
      const analysis: DocumentAnalysis = {
        id: `analysis_${Date.now()}`,
        question,
        answer,
        timestamp: new Date(),
        confidence: 0.85 // Mock confidence score
      }

      // Update document with analysis
      setProcessedDocuments(prev => 
        prev.map(doc => 
          doc.id === document.id 
            ? { ...doc, analysis: [...(doc.analysis || []), analysis] }
            : doc
        )
      )

      // Add to analysis history
      setAnalysisHistory(prev => [analysis, ...prev])

      // Send to chat interface
      if (onAnalysisComplete) {
        onAnalysisComplete(question, answer, document.id)
      }

      toast.success(t('Document analysis completed'))
    } catch (error) {
      console.error('Document analysis error:', error)
      toast.error(t('Failed to analyze document'))
    } finally {
      setIsAnalyzing(false)
    }
  }, [processedDocuments, selectedDocument, onAnalysisComplete, t])

  // Quick analysis questions
  const quickQuestions = [
    t("What is the main subject of this document?"),
    t("Summarize the key legal points"),
    t("What are the important dates mentioned?"),
    t("Who are the parties involved?"),
    t("What legal obligations are outlined?"),
    t("Are there any deadlines or time limits?")
  ]

  // Document preview component
  const DocumentPreview = ({ document }: { document: ProcessedDocument }) => (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium truncate">
            {document.name}
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {document.type.split('/')[1]?.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className="h-[200px] mb-4">
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {document.extractedText.substring(0, 500)}
            {document.extractedText.length > 500 && '...'}
          </p>
        </ScrollArea>
        
        <div className="space-y-2">
          <div className="flex items-center text-xs text-muted-foreground">
            <Clock className="h-3 w-3 mr-1" />
            {document.uploadedAt.toLocaleDateString()}
          </div>
          
          {document.analysis && document.analysis.length > 0 && (
            <div className="flex items-center text-xs text-muted-foreground">
              <MessageSquare className="h-3 w-3 mr-1" />
              {document.analysis.length} {t('analyses')}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )

  // Analysis history component
  const AnalysisHistory = () => (
    <ScrollArea className="h-[300px]">
      <div className="space-y-3">
        {analysisHistory.map((analysis) => (
          <Card key={analysis.id} className="p-3">
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <p className="text-sm font-medium text-primary">
                  {analysis.question}
                </p>
                <Badge variant="outline" className="text-xs">
                  {analysis.confidence && `${Math.round(analysis.confidence * 100)}%`}
                </Badge>
              </div>
              
              <p className="text-sm text-muted-foreground">
                {analysis.answer.substring(0, 150)}
                {analysis.answer.length > 150 && '...'}
              </p>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{analysis.timestamp.toLocaleTimeString()}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (onAnalysisComplete) {
                      onAnalysisComplete(analysis.question, analysis.answer)
                    }
                  }}
                  className="h-auto p-1 text-xs"
                >
                  {t('Add to Chat')}
                </Button>
              </div>
            </div>
          </Card>
        ))}
        
        {analysisHistory.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">{t('No analysis history yet')}</p>
          </div>
        )}
      </div>
    </ScrollArea>
  )

  return (
    <div className={cn("space-y-4", className)}>
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            <span className="hidden sm:inline">{t('Upload')}</span>
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">{t('Documents')}</span>
          </TabsTrigger>
          <TabsTrigger value="analysis" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">{t('Analysis')}</span>
          </TabsTrigger>
        </TabsList>

        {/* Upload Tab */}
        <TabsContent value="upload" className="space-y-4">
          <EnhancedDocumentUpload
            onFileProcessed={handleFileProcessed}
            onAnalysisComplete={onAnalysisComplete}
            maxFiles={5}
            maxFileSize={10}
            className="min-h-[300px]"
          />
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-4">
          {processedDocuments.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {processedDocuments.map((document) => (
                <div key={document.id} className="relative">
                  <DocumentPreview document={document} />
                  
                  <div className="absolute top-2 right-2 flex gap-1">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="secondary" 
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => setSelectedDocument(document)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh]">
                        <DialogHeader>
                          <DialogTitle>{document.name}</DialogTitle>
                        </DialogHeader>
                        <ScrollArea className="h-[60vh] mt-4">
                          <div className="whitespace-pre-wrap text-sm">
                            {document.extractedText}
                          </div>
                        </ScrollArea>
                      </DialogContent>
                    </Dialog>
                    
                    <Button 
                      variant="destructive" 
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => {
                        setProcessedDocuments(prev => 
                          prev.filter(doc => doc.id !== document.id)
                        )
                        if (selectedDocument?.id === document.id) {
                          setSelectedDocument(null)
                        }
                        toast.success(t('Document removed'))
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">{t('No documents uploaded')}</h3>
              <p className="text-muted-foreground mb-4">
                {t('Upload documents to start analyzing them with AI')}
              </p>
              <Button onClick={() => document.querySelector('[value="upload"]')?.click()}>
                <Plus className="h-4 w-4 mr-2" />
                {t('Upload Document')}
              </Button>
            </Card>
          )}
        </TabsContent>

        {/* Analysis Tab */}
        <TabsContent value="analysis" className="space-y-4">
          {selectedDocument ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {/* Quick Analysis Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    {t('Quick Analysis')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-muted-foreground mb-3">
                    {t('Selected')}: <span className="font-medium">{selectedDocument.name}</span>
                  </div>
                  
                  <div className="grid gap-2">
                    {quickQuestions.map((question, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="justify-start text-left h-auto p-3 whitespace-normal"
                        onClick={() => handleDocumentAnalysis(question)}
                        disabled={isAnalyzing}
                      >
                        {question}
                      </Button>
                    ))}
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('Custom Question')}</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder={t('Ask a specific question about this document...')}
                        className="flex-1 px-3 py-2 text-sm border rounded-md"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                            handleDocumentAnalysis(e.currentTarget.value.trim())
                            e.currentTarget.value = ''
                          }
                        }}
                      />
                      <Button 
                        size="sm"
                        disabled={isAnalyzing}
                        onClick={(e) => {
                          const input = e.currentTarget.parentElement?.querySelector('input') as HTMLInputElement
                          if (input?.value.trim()) {
                            handleDocumentAnalysis(input.value.trim())
                            input.value = ''
                          }
                        }}
                      >
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Analysis History Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    {t('Analysis History')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AnalysisHistory />
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="p-8 text-center">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">{t('No document selected')}</h3>
              <p className="text-muted-foreground mb-4">
                {t('Select a document from the Documents tab to start analysis')}
              </p>
              <Button onClick={() => document.querySelector('[value="documents"]')?.click()}>
                {t('Browse Documents')}
              </Button>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Loading overlay */}
      {isAnalyzing && (
        <div className="fixed inset-0 bg-background/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span className="text-sm font-medium">{t('Analyzing document...')}</span>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
