"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Loader2, Upload, X, Camera } from "lucide-react"
import { cn } from "@/lib/utils"
import { 
  uploadUserAvatar, 
  uploadLawyerAvatar,
  validateImageFile,
  formatFileSize 
} from "@/lib/services/storage-service"
import { toast } from "sonner"

interface AvatarUploadProps {
  currentUrl?: string
  userId: string
  userType: "user" | "lawyer"
  userName?: string
  onUploadComplete?: (url: string) => void
  size?: "sm" | "md" | "lg"
  editable?: boolean
}

export function AvatarUpload({
  currentUrl,
  userId,
  userType,
  userName,
  onUploadComplete,
  size = "md",
  editable = true
}: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const sizeClasses = {
    sm: "h-16 w-16",
    md: "h-24 w-24",
    lg: "h-32 w-32"
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file
    const error = validateImageFile(file, 2)
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

    // Upload
    setUploading(true)
    setProgress(0)

    try {
      const uploadFn = userType === "user" ? uploadUserAvatar : uploadLawyerAvatar
      const result = await uploadFn(userId, file, {
        onProgress: (p) => setProgress(p)
      })

      if (result.success && result.url) {
        toast.success("Profile picture updated!")
        onUploadComplete?.(result.url)
      } else {
        toast.error(result.error || "Upload failed")
        setPreviewUrl(null)
      }
    } catch (error: any) {
      console.error("Upload error:", error)
      toast.error("Failed to upload image")
      setPreviewUrl(null)
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  const handleClick = () => {
    if (editable && !uploading) {
      fileInputRef.current?.click()
    }
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const displayUrl = previewUrl || currentUrl
  const initials = userName
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?"

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <Avatar className={cn(sizeClasses[size], editable && !uploading && "cursor-pointer hover:opacity-80 transition-opacity")}>
          <AvatarImage src={displayUrl} alt={userName || "User"} />
          <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary">
            {initials}
          </AvatarFallback>
        </Avatar>

        {editable && !uploading && (
          <button
            onClick={handleClick}
            className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 shadow-lg hover:bg-primary/90 transition-colors"
            aria-label="Upload photo"
          >
            <Camera className="h-4 w-4" />
          </button>
        )}

        {uploading && (
          <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center">
            <Loader2 className="h-6 w-6 text-white animate-spin" />
          </div>
        )}

        {previewUrl && !uploading && editable && (
          <button
            onClick={handleRemove}
            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 shadow-lg hover:bg-destructive/90 transition-colors"
            aria-label="Remove photo"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {uploading && (
        <div className="w-full max-w-xs space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-center text-muted-foreground">
            Uploading... {Math.round(progress)}%
          </p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />

      {editable && !uploading && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleClick}
          className="gap-2"
        >
          <Upload className="h-4 w-4" />
          {displayUrl ? "Change Photo" : "Upload Photo"}
        </Button>
      )}
    </div>
  )
}
