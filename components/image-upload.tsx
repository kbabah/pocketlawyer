"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card } from "@/components/ui/card"
import { Loader2, Upload, X, FileImage, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { uploadImage, validateImageFile, formatFileSize } from "@/lib/services/storage-service"
import { toast } from "sonner"

interface ImageUploadProps {
  path: string
  onUploadComplete: (url: string) => void
  onRemove?: () => void
  currentUrl?: string
  maxSizeMB?: number
  maxWidthOrHeight?: number
  quality?: number
  className?: string
  variant?: "default" | "compact"
  accept?: string
}

export function ImageUpload({
  path,
  onUploadComplete,
  onRemove,
  currentUrl,
  maxSizeMB = 5,
  maxWidthOrHeight = 1200,
  quality = 0.85,
  className,
  variant = "default",
  accept = "image/*"
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [fileSize, setFileSize] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file
    const error = validateImageFile(file, maxSizeMB)
    if (error) {
      toast.error(error)
      return
    }

    // Show preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    setFileName(file.name)
    setFileSize(formatFileSize(file.size))

    // Upload
    setUploading(true)
    setProgress(0)

    try {
      const result = await uploadImage(file, path, {
        maxSizeMB,
        maxWidthOrHeight,
        quality,
        onProgress: (p) => setProgress(p)
      })

      if (result.success && result.url) {
        toast.success("Image uploaded successfully!")
        onUploadComplete(result.url)
      } else {
        toast.error(result.error || "Upload failed")
        resetState()
      }
    } catch (error: any) {
      console.error("Upload error:", error)
      toast.error("Failed to upload image")
      resetState()
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  const handleClick = () => {
    if (!uploading) {
      fileInputRef.current?.click()
    }
  }

  const handleRemove = () => {
    resetState()
    onRemove?.()
  }

  const resetState = () => {
    setPreviewUrl(null)
    setFileName(null)
    setFileSize(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const displayUrl = previewUrl || currentUrl

  if (variant === "compact") {
    return (
      <div className={cn("space-y-2", className)}>
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />

        {displayUrl ? (
          <div className="relative group">
            <img
              src={displayUrl}
              alt="Upload preview"
              className="w-full h-48 object-cover rounded-lg border"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleClick}
                disabled={uploading}
              >
                <Upload className="h-4 w-4 mr-2" />
                Change
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleRemove}
                disabled={uploading}
              >
                <X className="h-4 w-4 mr-2" />
                Remove
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            onClick={handleClick}
            disabled={uploading}
            className="w-full h-48 border-dashed"
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="text-sm">Uploading... {Math.round(progress)}%</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-8 w-8" />
                <p className="text-sm">Click to upload image</p>
              </div>
            )}
          </Button>
        )}

        {uploading && <Progress value={progress} className="h-2" />}
      </div>
    )
  }

  return (
    <Card className={cn("p-6", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />

      {displayUrl ? (
        <div className="space-y-4">
          <div className="relative">
            <img
              src={displayUrl}
              alt="Upload preview"
              className="w-full h-64 object-cover rounded-lg border"
            />
            {uploading && (
              <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center">
                <div className="text-center text-white">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                  <p className="text-sm">Uploading... {Math.round(progress)}%</p>
                </div>
              </div>
            )}
          </div>

          {fileName && (
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <FileImage className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{fileName}</p>
                  {fileSize && (
                    <p className="text-xs text-muted-foreground">{fileSize}</p>
                  )}
                </div>
              </div>
              {!uploading && (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              )}
            </div>
          )}

          {uploading && <Progress value={progress} className="h-2" />}

          {!uploading && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleClick}
                className="flex-1"
              >
                <Upload className="h-4 w-4 mr-2" />
                Change Image
              </Button>
              <Button
                variant="destructive"
                onClick={handleRemove}
              >
                <X className="h-4 w-4 mr-2" />
                Remove
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <button
            onClick={handleClick}
            disabled={uploading}
            className="w-full h-64 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-4 hover:bg-muted/50 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uploading ? (
              <>
                <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
                <div className="text-center">
                  <p className="text-sm font-medium">Uploading...</p>
                  <p className="text-xs text-muted-foreground">
                    {Math.round(progress)}%
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="bg-primary/10 p-4 rounded-full">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">Click to upload image</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Max {maxSizeMB}MB • JPG, PNG, GIF, WebP
                  </p>
                </div>
              </>
            )}
          </button>

          {uploading && <Progress value={progress} className="h-2" />}
        </div>
      )}
    </Card>
  )
}
