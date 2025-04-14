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

// Temporarily disabled the document processing API route
export async function POST(req) {
  return new Response("Document processing is temporarily disabled.", { status: 503 });
}