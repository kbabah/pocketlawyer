import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import pdfParse from 'pdf-parse'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function extractTextFromPDF(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = async function(event) {
      try {
        if (!event.target?.result) {
          throw new Error('Failed to read file')
        }
        
        // Convert ArrayBuffer to Uint8Array for browser compatibility
        const arrayBuffer = event.target.result as ArrayBuffer
        const uint8Array = new Uint8Array(arrayBuffer)
        
        try {
          const data = await pdfParse(uint8Array)
          // Clean up the extracted text
          const cleanText = data.text
            .replace(/\x00/g, '') // Remove null bytes
            .replace(/[\r\n]+/g, '\n') // Normalize line endings
            .replace(/\s+/g, ' ') // Normalize whitespace
            .trim()
          
          if (!cleanText) {
            throw new Error('No readable text found in PDF')
          }
          
          resolve(cleanText)
        } catch (pdfError) {
          console.error('PDF parsing error:', pdfError)
          reject(new Error('Failed to parse PDF content'))
        }
      } catch (error) {
        reject(error)
      }
    }
    
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsArrayBuffer(file)
  })
}
