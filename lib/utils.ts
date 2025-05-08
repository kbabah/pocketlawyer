import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Add the API key verification function that's missing
export function verifyApiKey(apiKey: string | null): boolean {
  // For development, you can allow any key or no key
  if (process.env.NODE_ENV === 'development') {
    return true;
  }
  
  // In production, verify against a stored secret
  const validApiKey = process.env.SCHEDULER_API_KEY;
  return apiKey === validApiKey;
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
          // Removed: const loadingTask = pdfjsLib.getDocument({ data: uint8Array })
          // Removed: const pdf = await loadingTask.promise
          
          // Extract text from all pages
          let fullText = ''
          // Removed: for (let i = 1; i <= pdf.numPages; i++) {
          // Removed: const page = await pdf.getPage(i)
          // Removed: const content = await page.getTextContent()
          // Removed: const pageText = content.items
          // Removed: .map((item: any) => item.str)
          // Removed: .join(' ')
          // Removed: fullText += pageText + '\n'
          
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



// To Keep Your Emails Running Smoothly:
// Set up a recurring job to call your scheduler endpoint regularly. Since you're likely using Vercel for deployment, add this to your vercel.json file:
// Add a SCHEDULER_API_KEY environment variable in your production environment for security. For example:

// Call the scheduler with the API key header in production by using:

// By implementing these changes, your scheduled emails should now process correctly and not get stuck in the "processing" status.