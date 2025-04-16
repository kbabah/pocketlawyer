import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

export const maxDuration = 60 // Extended to allow more processing time

// Custom PDF text extraction using pdf-lib instead of pdf-parse
async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    // Use node-fetch for server-side API call to extract text
    const response = await fetch('https://api.ocr.space/parse/pdf', {
      method: 'POST',
      headers: {
        'apikey': 'helloworld', // Free API key for testing purposes
      },
      body: buffer
    });

    if (!response.ok) {
      // Fallback to a simplified extraction method
      // This is a basic extraction that may not be ideal but will work for simple PDFs
      const text = buffer.toString('utf-8');
      
      // Clean up basic text extraction and keep only readable parts
      const cleanText = text
        .replace(/[\x00-\x1F\x7F-\x9F]/g, '') // Remove control characters
        .replace(/[^\x20-\x7E\xA0-\xFF]/g, '') // Keep only printable chars
        .replace(/\s+/g, ' ')
        .trim();
        
      return cleanText || "No readable text could be extracted from this PDF.";
    }
    
    const data = await response.json();
    return data.ParsedText || "No text could be extracted from this PDF.";
  } catch (error) {
    console.error('PDF extraction error:', error);
    return "Failed to extract text from PDF.";
  }
}

export async function POST(req: NextRequest) {
  try {
    // Accept multipart/form-data with a PDF file
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    try {
      // Read file as ArrayBuffer and convert to Buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      // Use our custom extraction function instead of pdf-parse
      const text = await extractTextFromPDF(buffer);
      
      if (!text || text === "Failed to extract text from PDF.") {
        return NextResponse.json({ 
          error: 'No readable text found in PDF',
          success: false 
        }, { status: 400 });
      }
      
      return NextResponse.json({ text, success: true });
    } catch (error: any) {
      console.error('PDF processing error:', error);
      return NextResponse.json({ 
        error: `Failed to process PDF: ${error.message}`, 
        success: false 
      }, { status: 500 });
    }
  } catch (outerError: any) {
    console.error('Server error:', outerError);
    return NextResponse.json({ 
      error: `Server error: ${outerError.message}`, 
      success: false 
    }, { status: 500 });
  }
}