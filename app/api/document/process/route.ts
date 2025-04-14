import { NextRequest, NextResponse } from 'next/server'
import pdfParse from 'pdf-parse'

export async function POST(request: NextRequest) {
  console.log('Processing document request...');
  try {
    const formData = await request.formData()
    console.log('Form data received');
    
    const file = formData.get('file') as File | null
    console.log('File from form:', file?.name, file?.type);

    if (!file) {
      console.log('No file provided');
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    console.log('File converted to ArrayBuffer, size:', arrayBuffer.byteLength);
    
    const buffer = Buffer.from(arrayBuffer)
    
    try {
      console.log('Starting PDF parsing...');
      const data = await pdfParse(buffer)
      console.log('PDF parsed successfully, text length:', data.text.length);
      
      const cleanText = data.text
        .replace(/\x00/g, '')
        .replace(/[\r\n]+/g, '\n')
        .replace(/\s+/g, ' ')
        .trim()

      if (!cleanText) {
        console.log('No readable text found in PDF');
        throw new Error('No readable text found in PDF')
      }

      console.log('Returning cleaned text, length:', cleanText.length);
      return NextResponse.json({ text: cleanText })
    } catch (pdfError) {
      console.error('PDF parsing error:', pdfError)
      return NextResponse.json(
        { error: 'Failed to parse PDF content', details: String(pdfError) },
        { status: 422 }
      )
    }
  } catch (error) {
    console.error('Request processing error:', error)
    return NextResponse.json(
      { error: 'Failed to process file', details: String(error) },
      { status: 500 }
    )
  }
}