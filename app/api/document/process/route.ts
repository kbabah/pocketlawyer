import { NextRequest, NextResponse } from 'next/server'
import { getDocument, PDFDocumentProxy, TextContent } from 'pdfjs-dist'
import { GlobalWorkerOptions } from 'pdfjs-dist'

// Configure PDF.js for server-side usage
if (typeof window === 'undefined') {
  GlobalWorkerOptions.workerSrc = '/pdf.worker.js';
}

// Add a type guard to filter TextItem objects
function isTextItem(item: any): item is { str: string } {
  return 'str' in item;
}

export async function POST(request: NextRequest) {
  console.log('Processing document request...')
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)
    
    try {
      // Load the PDF document
      console.log('Starting to load PDF document...');
      const loadingTask = getDocument({ data: uint8Array });
      const pdf = await loadingTask.promise;
      console.log(`PDF loaded successfully with ${pdf.numPages} pages.`);

      // Extract text from all pages
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        console.log(`Processing page ${i}...`);
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items
          .filter(isTextItem)
          .map((item) => item.str)
          .join(' ');
        fullText += pageText + '\n';
        console.log(`Page ${i} processed successfully.`);
      }

      // Clean up the extracted text
      console.log('Cleaning up extracted text...');
      const cleanText = fullText
        .replace(/\x00/g, '') // Remove null bytes
        .replace(/[\r\n]+/g, '\n') // Normalize line endings
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();

      if (!cleanText) {
        throw new Error('No readable text found in PDF');
      }

      console.log('PDF text extraction completed successfully.');
      return NextResponse.json({ text: cleanText });
    } catch (pdfError) {
      console.error('PDF parsing error:', pdfError);
      return NextResponse.json(
        { error: 'Failed to parse PDF content', details: String(pdfError) },
        { status: 422 }
      );
    }
  } catch (error) {
    console.error('Request processing error:', error)
    return NextResponse.json(
      { error: 'Failed to process file', details: String(error) },
      { status: 500 }
    )
  }
}