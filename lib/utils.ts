import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.js';

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
        
        const arrayBuffer = event.target.result as ArrayBuffer
        const uint8Array = new Uint8Array(arrayBuffer)
        
        try {
          // Load the PDF document
          const loadingTask = pdfjsLib.getDocument({ data: uint8Array })
          const pdf = await loadingTask.promise
          
          // Extract text from all pages
          let fullText = ''
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i)
            const content = await page.getTextContent()
            const pageText = content.items
              .map((item: any) => item.str)
              .join(' ')
            fullText += pageText + '\n'
          }
          
          // Clean up the extracted text
          const cleanText = fullText
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
