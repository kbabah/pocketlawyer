"use client"

import React, { useState, useRef, useCallback, useEffect } from "react"
import { useLanguage } from "@/contexts/language-context"
import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { 
  Upload, 
  File, 
  FileText, 
  Trash2, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  X,
  Eye,
  Download,
  RefreshCw,
  Plus
} from "lucide-react"
import { cn } from "@/lib/utils"

// File upload types and interfaces
interface UploadFile {
  id: string
  file: File
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error'
  progress: number
  extractedText?: string
  error?: string
  uploadedAt?: Date
  language?: string
}

interface EnhancedDocumentUploadProps {
  onFileProcessed?: (file: UploadFile) => void
  onAnalysisComplete?: (question: string, answer: string, file: UploadFile) => void
  maxFiles?: number
  maxFileSize?: number // in MB
  acceptedTypes?: string[]
  className?: string
}

// Supported file types and their configurations
const SUPPORTED_TYPES = {
  'application/pdf': {
    extension: '.pdf',
    icon: FileText,
    name: 'PDF Document',
    maxSize: 5 // MB
  },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
    extension: '.docx',
    icon: FileText,
    name: 'Word Document',
    maxSize: 5 // MB
  },
  'text/plain': {
    extension: '.txt',
    icon: File,
    name: 'Text File',
    maxSize: 2 // MB
  }
}

const DEFAULT_MAX_FILES = 5
const DEFAULT_MAX_FILE_SIZE = 5 // MB

export default function EnhancedDocumentUpload({
  onFileProcessed,
  onAnalysisComplete,
  maxFiles = DEFAULT_MAX_FILES,
  maxFileSize = DEFAULT_MAX_FILE_SIZE,
  acceptedTypes = Object.keys(SUPPORTED_TYPES),
  className
}: EnhancedDocumentUploadProps) {
  const { t } = useLanguage()
  const isMobile = useIsMobile()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // State management
  const [files, setFiles] = useState<UploadFile[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [ocrLanguage, setOcrLanguage] = useState("eng")

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
  ]

  // File validation
  const validateFile = (file: File): string | null => {
    // Check file type
    if (!acceptedTypes.includes(file.type)) {
      return t('File type not supported. Please upload PDF, DOCX, or TXT files.')
    }

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024)
    const maxSizeForType = SUPPORTED_TYPES[file.type as keyof typeof SUPPORTED_TYPES]?.maxSize || maxFileSize
    
    if (fileSizeMB > maxSizeForType) {
      return t(`File size exceeds ${maxSizeForType}MB limit`)
    }

    return null
  }

  // Generate unique file ID
  const generateFileId = (): string => {
    return `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Add files to upload queue
  const addFiles = useCallback((newFiles: File[]) => {
    const validFiles: UploadFile[] = []
    
    for (const file of newFiles) {
      // Check total files limit
      if (files.length + validFiles.length >= maxFiles) {
        toast.error(t(`Maximum ${maxFiles} files allowed`))
        break
      }

      // Check if file already exists
      const existingFile = files.find(f => f.file.name === file.name && f.file.size === file.size)
      if (existingFile) {
        toast.warning(t(`File "${file.name}" already uploaded`))
        continue
      }

      // Validate file
      const validationError = validateFile(file)
      if (validationError) {
        toast.error(validationError)
        continue
      }

      validFiles.push({
        id: generateFileId(),
        file,
        status: 'pending',
        progress: 0,
        language: ocrLanguage
      })
    }

    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles])
      toast.success(t(`${validFiles.length} file(s) added to upload queue`))
    }
  }, [files, maxFiles, ocrLanguage, t])

  // Process file upload and text extraction
  const processFile = async (uploadFile: UploadFile): Promise<void> => {
    setFiles(prev => prev.map(f => 
      f.id === uploadFile.id 
        ? { ...f, status: 'uploading', progress: 0 }
        : f
    ))

    try {
      const formData = new FormData()
      formData.append("file", uploadFile.file)
      formData.append("language", uploadFile.language || ocrLanguage)

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setFiles(prev => prev.map(f => 
          f.id === uploadFile.id && f.progress < 90
            ? { ...f, progress: f.progress + Math.random() * 20 }
            : f
        ))
      }, 500)

      const response = await fetch("/api/document/process", {
        method: "POST",
        body: formData
      })

      clearInterval(progressInterval)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Upload failed' }))
        throw new Error(errorData.error || `Upload failed: ${response.status}`)
      }

      const data = await response.json()
      
      if (!data.text) {
        throw new Error("No text extracted from document")
      }

      // Update file status to completed
      const completedFile: UploadFile = {
        ...uploadFile,
        status: 'completed',
        progress: 100,
        extractedText: data.text,
        uploadedAt: new Date()
      }

      setFiles(prev => prev.map(f => 
        f.id === uploadFile.id ? completedFile : f
      ))

      onFileProcessed?.(completedFile)
      toast.success(t(`"${uploadFile.file.name}" processed successfully`))

    } catch (error: any) {
      setFiles(prev => prev.map(f => 
        f.id === uploadFile.id 
          ? { ...f, status: 'error', error: error.message }
          : f
      ))
      toast.error(t(`Failed to process "${uploadFile.file.name}": ${error.message}`))
    }
  }

  // Upload all pending files
  const uploadAllFiles = async () => {
    const pendingFiles = files.filter(f => f.status === 'pending')
    
    if (pendingFiles.length === 0) {
      toast.warning(t('No files to upload'))
      return
    }

    setIsUploading(true)

    try {
      // Process files sequentially to avoid overwhelming the server
      for (const file of pendingFiles) {
        await processFile(file)
      }
    } finally {
      setIsUploading(false)
    }
  }

  // Remove file from queue
  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId))
  }

  // Retry failed upload
  const retryFile = (fileId: string) => {
    const file = files.find(f => f.id === fileId)
    if (file) {
      processFile(file)
    }
  }

  // Clear all files
  const clearAllFiles = () => {
    setFiles([])
    toast.success(t('All files cleared'))
  }

  // Drag and drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    const droppedFiles = Array.from(e.dataTransfer.files)
    addFiles(droppedFiles)
  }, [addFiles])

  // File input handler
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    addFiles(selectedFiles)
    
    // Reset input value to allow re-uploading same file
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Open file picker
  const openFilePicker = () => {
    fileInputRef.current?.click()
  }

  // Get file type info
  const getFileTypeInfo = (file: File) => {
    const typeInfo = SUPPORTED_TYPES[file.type as keyof typeof SUPPORTED_TYPES]
    return typeInfo || { icon: File, name: 'Unknown', maxSize: maxFileSize }
  }

  // Get status color
  const getStatusColor = (status: UploadFile['status']) => {
    switch (status) {
      case 'completed': return 'text-green-600 dark:text-green-400'
      case 'error': return 'text-red-600 dark:text-red-400'
      case 'uploading': case 'processing': return 'text-blue-600 dark:text-blue-400'
      default: return 'text-muted-foreground'
    }
  }

  // Get status icon
  const getStatusIcon = (status: UploadFile['status']) => {
    switch (status) {
      case 'completed': return CheckCircle
      case 'error': return AlertCircle
      case 'uploading': case 'processing': return Loader2
      default: return File
    }
  }

  const pendingFilesCount = files.filter(f => f.status === 'pending').length
  const completedFilesCount = files.filter(f => f.status === 'completed').length
  const errorFilesCount = files.filter(f => f.status === 'error').length

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">{t('Enhanced Document Upload')}</h3>
        <p className="text-muted-foreground">
          {t('Upload documents for AI-powered analysis and insights')}
        </p>
      </div>

      {/* Upload Zone */}
      <Card>
        <CardContent className="p-6">
          {/* Drag and Drop Zone */}
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200",
              isDragOver 
                ? "border-primary bg-primary/5 scale-105" 
                : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
              files.length > 0 && "mb-6"
            )}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div className="space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Upload className={cn(
                  "h-8 w-8 transition-colors",
                  isDragOver ? "text-primary" : "text-muted-foreground"
                )} />
              </div>
              
              <div className="space-y-2">
                <h4 className="text-lg font-medium">
                  {isDragOver 
                    ? t('Drop files here') 
                    : t('Drag & drop files here')
                  }
                </h4>
                <p className="text-muted-foreground">
                  {t('or click to browse files')}
                </p>
              </div>

              <Button 
                onClick={openFilePicker}
                variant="outline"
                className="gap-2"
                disabled={isUploading}
              >
                <Plus className="h-4 w-4" />
                {t('Choose Files')}
              </Button>

              {/* File Info */}
              <div className="text-xs text-muted-foreground space-y-1">
                <p>
                  {t('Supported formats')}: PDF, DOCX, TXT • {t('Max')}: {maxFileSize}MB • {t('Limit')}: {maxFiles} files
                </p>
                <p>
                  {t('Documents will be processed with OCR for text extraction')}
                </p>
              </div>
            </div>
          </div>

          {/* Language Selector */}
          {files.length > 0 && (
            <div className="mb-4">
              <label htmlFor="ocr-language" className="block mb-2 text-sm font-medium">
                {t('Document Language (for OCR)')}:
              </label>
              <select
                id="ocr-language"
                value={ocrLanguage}
                onChange={(e) => setOcrLanguage(e.target.value)}
                className="w-full max-w-xs px-3 py-2 text-sm border rounded dark:bg-background dark:border-border"
                disabled={isUploading}
              >
                {languageOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Upload Actions */}
          {files.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">
                  {files.length} file{files.length !== 1 ? 's' : ''}
                </Badge>
                {pendingFilesCount > 0 && (
                  <Badge variant="outline">
                    {pendingFilesCount} pending
                  </Badge>
                )}
                {completedFilesCount > 0 && (
                  <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    {completedFilesCount} completed
                  </Badge>
                )}
                {errorFilesCount > 0 && (
                  <Badge variant="destructive">
                    {errorFilesCount} failed
                  </Badge>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={uploadAllFiles}
                  disabled={isUploading || pendingFilesCount === 0}
                  className="gap-2"
                >
                  {isUploading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {t('Upload All')} ({pendingFilesCount})
                </Button>
                <Button
                  onClick={clearAllFiles}
                  variant="outline"
                  disabled={isUploading}
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  {t('Clear')}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* File List */}
      {files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('Upload Queue')}</CardTitle>
            <CardDescription>
              {t('Track the progress of your document uploads')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {files.map((uploadFile, index) => {
              const typeInfo = getFileTypeInfo(uploadFile.file)
              const StatusIcon = getStatusIcon(uploadFile.status)
              const isAnimating = uploadFile.status === 'uploading' || uploadFile.status === 'processing'

              return (
                <div key={uploadFile.id} className="space-y-3">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                        <typeInfo.icon className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium truncate">
                            {uploadFile.file.name}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {typeInfo.name} • {(uploadFile.file.size / 1024).toFixed(1)} KB
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <StatusIcon 
                            className={cn(
                              "h-4 w-4",
                              getStatusColor(uploadFile.status),
                              isAnimating && "animate-spin"
                            )} 
                          />
                          
                          {uploadFile.status === 'error' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => retryFile(uploadFile.id)}
                              className="h-6 w-6 p-0"
                            >
                              <RefreshCw className="h-3 w-3" />
                            </Button>
                          )}
                          
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeFile(uploadFile.id)}
                            disabled={isUploading && uploadFile.status === 'uploading'}
                            className="h-6 w-6 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      {(uploadFile.status === 'uploading' || uploadFile.status === 'processing') && (
                        <div className="mt-2">
                          <Progress value={uploadFile.progress} className="h-1" />
                          <p className="text-xs text-muted-foreground mt-1">
                            {uploadFile.status === 'uploading' ? t('Uploading') : t('Processing')}... {Math.round(uploadFile.progress)}%
                          </p>
                        </div>
                      )}

                      {/* Error Message */}
                      {uploadFile.status === 'error' && uploadFile.error && (
                        <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded text-xs text-red-700 dark:text-red-400">
                          {uploadFile.error}
                        </div>
                      )}

                      {/* Success Info */}
                      {uploadFile.status === 'completed' && (
                        <div className="mt-2 flex items-center gap-2 text-xs text-green-700 dark:text-green-400">
                          <CheckCircle className="h-3 w-3" />
                          {t('Text extracted successfully')}
                          {uploadFile.extractedText && (
                            <span>• {uploadFile.extractedText.length} characters</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {index < files.length - 1 && <Separator />}
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes.join(',')}
        onChange={handleFileInputChange}
        className="hidden"
        aria-label={t('File upload input')}
      />
    </div>
  )
}
