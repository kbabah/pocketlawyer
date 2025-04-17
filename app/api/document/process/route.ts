import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 60 // Extended to allow more processing time

// OCR-prioritized PDF text extraction
async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    // Check for OCR API key first
    const ocr_api_key = process.env.OCR_API_KEY;
    
    // If OCR API key exists, prioritize OCR processing
    if (ocr_api_key) {
      try {
        // Prepare form data for OCR.space API
        const formData = new FormData();
        formData.append('file', new Blob([buffer], { type: 'application/pdf' }), 'document.pdf');
        formData.append('language', 'eng');
        formData.append('isOverlayRequired', 'false');
        formData.append('filetype', 'pdf');
        formData.append('detectOrientation', 'true');
        formData.append('scale', 'true');
        formData.append('OCREngine', '2'); // Use more accurate OCR engine
        
        // Set a timeout to prevent indefinite waiting
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 second timeout
        
        // Make the API request with timeout
        const response = await fetch('https://api.ocr.space/parse/image', {
          method: 'POST',
          headers: { 'apikey': ocr_api_key },
          body: formData,
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const data = await response.json();
          if (data.ParsedResults && data.ParsedResults.length > 0) {
            const extractedText = data.ParsedResults[0].ParsedText;
            if (extractedText && extractedText.length > 20) {
              // Successfully got text from OCR API
              return extractedText;
            }
          }
        }
        // If OCR failed, log it but don't fall back yet - throw to try local extraction
        throw new Error("OCR API extraction failed or returned insufficient text");
      } catch (ocrError) {
        console.error("OCR API error - falling back to local extraction:", ocrError.message);
        // Continue to fallback methods below
      }
    }
    
    // Fallback method 1: Use regex pattern matching targeting readable text
    // This method looks specifically for alphabetic content in the PDF
    const pdfText = buffer.toString('utf8');
    
    // Function to check if text is mostly readable (not binary/encoded)
    const isReadableText = (text: string): boolean => {
      if (!text || text.length < 20) return false;
      
      // Count alphabetic characters vs special characters
      const alphaCount = (text.match(/[a-zA-Z]/g) || []).length;
      const totalCount = text.length;
      
      // If at least 30% of characters are alphabetic, consider it readable
      return (alphaCount / totalCount) > 0.3;
    };
    
    // Look for blocks of text that are likely to be readable content
    const textBlocks = pdfText.match(/[a-zA-Z][a-zA-Z0-9 \.,;:'"?!-]{10,}/g) || [];
    let extractedText = textBlocks.join(' ').replace(/\s+/g, ' ').trim();
    
    if (isReadableText(extractedText)) {
      return extractedText;
    }
    
    // Fallback method 2: Try extracting parenthesized content (common in PDFs)
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
    
    // If all methods failed, return a helpful message
    return "Could not extract readable text from this PDF. It may be an image-based document, encrypted, or contain non-standard text encoding. Please try a different document.";
    
  } catch (error: any) {
    console.error('PDF processing error:', error.message);
    return "Failed to extract text from PDF. If you're seeing encoded characters, the document may not contain extractable text.";
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Check file type
    if (!file.type || !file.type.includes('pdf')) {
      return NextResponse.json({ error: 'Invalid file type. Please upload a PDF document.', success: false }, { status: 400 });
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      // Check if it's a valid PDF
      const isPDF = buffer.toString('ascii', 0, 5) === '%PDF-';
      if (!isPDF) {
        return NextResponse.json({ error: 'The file is not a valid PDF document.', success: false }, { status: 400 });
      }
      
      // Process the PDF with OCR-prioritized extraction
      const text = await extractTextFromPDF(buffer);
      
      return NextResponse.json({ text, success: true });
    } catch (error: any) {
      return NextResponse.json({ error: `Failed to process PDF: ${error.message}`, success: false }, { status: 500 });
    }
  } catch (outerError: any) {
    return NextResponse.json({ error: `Server error: ${outerError.message}`, success: false }, { status: 500 });
  }
}