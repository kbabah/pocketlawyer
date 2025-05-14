import { NextRequest, NextResponse } from 'next/server'
import { createWorker } from 'tesseract.js';

// Define types for Tesseract logger messages
interface TesseractLoggerMessage {
  jobId: string;
  status: string;
  progress: number;
  workerId: string;
}

// Languages supported by Tesseract OCR
const TESSERACT_LANGUAGES = {
  eng: "English",
  spa: "Spanish",
  fra: "French",
  deu: "German",
  chi_sim: "Chinese (Simplified)",
  rus: "Russian",
  ara: "Arabic",
  hin: "Hindi",
  por: "Portuguese"
};

// Default languages to try
const DEFAULT_LANGUAGES = ['eng']; 

export const maxDuration = 60 // Extended to allow more processing time

// 5MB file size limit in bytes
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Extract text from PDF using simple methods first, then try OCR if needed
async function extractTextFromPDF(buffer: Buffer, options?: { language?: string }): Promise<string> {
  try {
    // First attempt: Simple regex-based text extraction
    const pdfText = buffer.toString('utf8');
    
    // Function to check if text is mostly readable
    const isReadableText = (text: string): boolean => {
      if (!text || text.length < 20) return false;
      const alphaCount = (text.match(/[a-zA-Z]/g) || []).length;
      const totalCount = text.length;
      return (alphaCount / totalCount) > 0.3;
    };
    
    // Extract readable text blocks
    const textBlocks = pdfText.match(/[a-zA-Z][a-zA-Z0-9 \.,;:'"?!-]{10,}/g) || [];
    let extractedText = textBlocks.join(' ').replace(/\s+/g, ' ').trim();
    
    if (isReadableText(extractedText)) {
      return extractedText;
    }
    
    // Second attempt: Look for content in parentheses
    const textMatches = pdfText.match(/\(([^\)]{3,})\)/g) || [];
    extractedText = textMatches
      .map(match => match.replace(/^\(|\)$/g, ''))
      .join(' ')
      .replace(/\\(\d{3}|n|r|t|f|\\|\(|\))/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
      
    if (isReadableText(extractedText)) {
      return extractedText;
    }
    
    // Last resort: Try OCR directly on the PDF buffer
    try {
      console.log('Starting direct OCR processing...');
      
      // Get language from options or use default
      const requestLanguage = options?.language || '';
      const languagesToTry = requestLanguage && 
        Object.keys(TESSERACT_LANGUAGES).includes(requestLanguage) ? 
        [requestLanguage, ...DEFAULT_LANGUAGES] : 
        DEFAULT_LANGUAGES;
      
      console.log(`Using language(s): ${languagesToTry.join(', ')}`);
      
      // Simple Tesseract processing without the PDF.js complexity
      const worker = await createWorker({ 
        logger: (m: TesseractLoggerMessage) => console.log(`OCR: ${m.status}`)
      });
      
      await worker.loadLanguage(languagesToTry);
      await worker.initialize(languagesToTry[0]);
      
      // Treat the PDF as an image directly - this only works well for single-page PDFs
      // but is more reliable in serverless environments
      const { data } = await worker.recognize(buffer);
      await worker.terminate();
      
      if (data.text && data.text.length > 20) {
        return data.text.trim();
      }
    } catch (error: any) {
      console.error('OCR process failed:', error.message);
    }
    
    return "Could not extract readable text. The document may be image-based, encrypted, or use non-standard encoding.";
  } catch (error: any) {
    console.error('Text extraction error:', error.message);
    return "An error occurred while processing the document.";
  }
}

export async function POST(req: NextRequest) {
  try {
    // Wrap everything in try-catch to ensure we always return JSON
    try {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      
      if (!file) {
        return NextResponse.json({ error: 'No file was selected.', success: false }, { status: 400 });
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({
          error: `The file exceeds the 1MB limit.`,
          success: false
        }, { status: 400 });
      }

      if (!file.type || !file.type.includes('pdf')) {
        return NextResponse.json({ error: 'Only PDF documents are accepted.', success: false }, { status: 400 });
      }

      // Process the file
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      if (buffer.toString('ascii', 0, 5) !== '%PDF-') {
        return NextResponse.json({ error: 'Not a valid PDF document.', success: false }, { status: 400 });
      }
      
      const language = formData.get('language')?.toString() || 'eng';
      const text = await extractTextFromPDF(buffer, { language });
      
      if (text.startsWith("Could not extract") || text.startsWith("An error occurred")) {
        return NextResponse.json({ error: text, success: false }, { status: 500 });
      }
      
      return NextResponse.json({ text, success: true });
    } catch (innerError: any) {
      // Always return JSON even if processing fails
      console.error('Document processing error:', innerError);
      return NextResponse.json({ 
        error: 'Failed to process document. Please try again later.',
        success: false
      }, { status: 500 });
    }
  } catch (outerError: any) {
    // Final fallback - guarantee JSON response
    console.error('Critical API error:', outerError);
    return NextResponse.json({ 
      error: 'Server error occurred. Please try again.',
      success: false
    }, { status: 500 });
  }
}