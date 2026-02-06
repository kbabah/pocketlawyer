// Storage Service for PocketLawyer
// Handles image uploads to Firebase Storage with optimization

import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject,
  uploadBytesResumable,
  UploadTaskSnapshot
} from 'firebase/storage'
import { storage } from '@/lib/firebase'

export interface UploadOptions {
  maxSizeMB?: number
  maxWidthOrHeight?: number
  quality?: number
  onProgress?: (progress: number) => void
}

export interface UploadResult {
  success: boolean
  url?: string
  error?: string
}

/**
 * Upload an image to Firebase Storage with compression
 */
export async function uploadImage(
  file: File,
  path: string,
  options: UploadOptions = {}
): Promise<UploadResult> {
  try {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      return {
        success: false,
        error: 'File must be an image'
      }
    }

    // Validate file size (default 5MB)
    const maxSize = (options.maxSizeMB || 5) * 1024 * 1024
    if (file.size > maxSize) {
      return {
        success: false,
        error: `File size must be less than ${options.maxSizeMB || 5}MB`
      }
    }

    // Compress image if needed
    const compressedFile = await compressImage(file, {
      maxWidthOrHeight: options.maxWidthOrHeight || 1200,
      quality: options.quality || 0.85
    })

    // Create storage reference
    const storageRef = ref(storage, path)

    // Upload with progress tracking
    if (options.onProgress) {
      const uploadTask = uploadBytesResumable(storageRef, compressedFile)
      
      return new Promise((resolve) => {
        uploadTask.on(
          'state_changed',
          (snapshot: UploadTaskSnapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            options.onProgress?.(progress)
          },
          (error) => {
            console.error('Upload error:', error)
            resolve({
              success: false,
              error: 'Upload failed. Please try again.'
            })
          },
          async () => {
            const url = await getDownloadURL(uploadTask.snapshot.ref)
            resolve({
              success: true,
              url
            })
          }
        )
      })
    } else {
      // Simple upload without progress
      await uploadBytes(storageRef, compressedFile)
      const url = await getDownloadURL(storageRef)
      
      return {
        success: true,
        url
      }
    }
  } catch (error: any) {
    console.error('Image upload error:', error)
    return {
      success: false,
      error: error.message || 'Upload failed'
    }
  }
}

/**
 * Upload user profile picture
 */
export async function uploadUserAvatar(
  userId: string,
  file: File,
  options: UploadOptions = {}
): Promise<UploadResult> {
  const path = `avatars/users/${userId}/${Date.now()}-${file.name}`
  return uploadImage(file, path, {
    maxSizeMB: 2,
    maxWidthOrHeight: 500,
    quality: 0.85,
    ...options
  })
}

/**
 * Upload lawyer profile picture
 */
export async function uploadLawyerAvatar(
  lawyerId: string,
  file: File,
  options: UploadOptions = {}
): Promise<UploadResult> {
  const path = `avatars/lawyers/${lawyerId}/${Date.now()}-${file.name}`
  return uploadImage(file, path, {
    maxSizeMB: 2,
    maxWidthOrHeight: 500,
    quality: 0.85,
    ...options
  })
}

/**
 * Upload document
 */
export async function uploadDocument(
  userId: string,
  file: File,
  options: UploadOptions = {}
): Promise<UploadResult> {
  const path = `documents/${userId}/${Date.now()}-${file.name}`
  
  // For documents, don't compress and allow larger sizes
  try {
    const maxSize = (options.maxSizeMB || 10) * 1024 * 1024
    if (file.size > maxSize) {
      return {
        success: false,
        error: `File size must be less than ${options.maxSizeMB || 10}MB`
      }
    }

    const storageRef = ref(storage, path)
    
    if (options.onProgress) {
      const uploadTask = uploadBytesResumable(storageRef, file)
      
      return new Promise((resolve) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            options.onProgress?.(progress)
          },
          (error) => {
            console.error('Upload error:', error)
            resolve({
              success: false,
              error: 'Upload failed. Please try again.'
            })
          },
          async () => {
            const url = await getDownloadURL(uploadTask.snapshot.ref)
            resolve({
              success: true,
              url
            })
          }
        )
      })
    } else {
      await uploadBytes(storageRef, file)
      const url = await getDownloadURL(storageRef)
      
      return {
        success: true,
        url
      }
    }
  } catch (error: any) {
    console.error('Document upload error:', error)
    return {
      success: false,
      error: error.message || 'Upload failed'
    }
  }
}

/**
 * Delete an image from storage
 */
export async function deleteImage(url: string): Promise<boolean> {
  try {
    // Extract path from URL
    const path = extractPathFromUrl(url)
    if (!path) return false

    const storageRef = ref(storage, path)
    await deleteObject(storageRef)
    return true
  } catch (error) {
    console.error('Delete error:', error)
    return false
  }
}

/**
 * Compress image using canvas
 */
async function compressImage(
  file: File,
  options: { maxWidthOrHeight: number; quality: number }
): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const img = new Image()
      
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        // Calculate new dimensions
        if (width > height) {
          if (width > options.maxWidthOrHeight) {
            height *= options.maxWidthOrHeight / width
            width = options.maxWidthOrHeight
          }
        } else {
          if (height > options.maxWidthOrHeight) {
            width *= options.maxWidthOrHeight / height
            height = options.maxWidthOrHeight
          }
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        ctx?.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now()
              })
              resolve(compressedFile)
            } else {
              reject(new Error('Compression failed'))
            }
          },
          file.type,
          options.quality
        )
      }

      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = e.target?.result as string
    }

    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

/**
 * Extract storage path from Firebase Storage URL
 */
function extractPathFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url)
    const pathMatch = urlObj.pathname.match(/\/o\/(.+)\?/)
    if (pathMatch) {
      return decodeURIComponent(pathMatch[1])
    }
    return null
  } catch {
    return null
  }
}

/**
 * Get file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Validate image file
 */
export function validateImageFile(file: File, maxSizeMB: number = 5): string | null {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return 'Please select an image file'
  }

  // Check file size
  const maxSize = maxSizeMB * 1024 * 1024
  if (file.size > maxSize) {
    return `File size must be less than ${maxSizeMB}MB`
  }

  // Check file extension
  const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp']
  const extension = file.name.split('.').pop()?.toLowerCase()
  if (!extension || !validExtensions.includes(extension)) {
    return 'Invalid file type. Please use JPG, PNG, GIF, or WebP'
  }

  return null
}
