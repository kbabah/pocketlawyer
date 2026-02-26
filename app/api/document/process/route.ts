import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { logger } from "@/lib/logger";
import { openai } from '@/lib/openai';
import { adminAuth } from '@/lib/firebase-admin';

/** Verify the request has a valid, non-anonymous Firebase session cookie */
async function getAuthenticatedUid(req: NextRequest): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('firebase-session')?.value;
    if (!sessionCookie) return null;
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    // Reject anonymous sign-ins
    if (decoded.firebase?.sign_in_provider === 'anonymous') return null;
    return decoded.uid;
  } catch {
    return null;
  }
}

// Cache pdf-parse after first load — avoids re-running dynamic import on every request
let _pdfParse: ((buf: Buffer) => Promise<{ text: string }>) | null = null;
async function getPdfParse() {
  if (!_pdfParse) _pdfParse = (await import('pdf-parse')).default;
  return _pdfParse;
}

export const maxDuration = 60

// 10MB file size limit
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Accepted MIME types
const ACCEPTED_TYPES: Record<string, string> = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'text/plain': 'txt',
};

/** Strip excessive whitespace while preserving paragraph structure */
function normalizeWhitespace(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Returns true if the text looks like real human-readable content */
function isReadableText(text: string): boolean {
  if (!text || text.length < 20) return false;
  // Strip whitespace before ratio check — PDFs often have lots of spacing
  const stripped = text.replace(/\s/g, '');
  if (stripped.length < 10) return false;
  const alphaCount = (stripped.match(/[a-zA-Z\u00C0-\u024F\u4E00-\u9FFF\u0600-\u06FF]/g) || []).length;
  // Accept if at least 15% of non-whitespace chars are letters (covers legal docs with numbers/symbols)
  return (alphaCount / stripped.length) > 0.15;
}

/**
 * OCR a scanned PDF by uploading it to OpenAI's Files API and reading it with GPT-4o.
 * No native binary dependencies — works in any serverless environment.
 * Cost: ~$0.001–0.003 per page depending on content density.
 */
async function ocrPDFWithVision(buffer: Buffer, filename: string): Promise<string> {
  // Upload the PDF to OpenAI temporarily (purpose: 'user_data' allows Chat Completions access)
  const uploadedFile = await openai.files.create({
    file: new File([buffer], filename || 'document.pdf', { type: 'application/pdf' }),
    purpose: 'user_data' as any,
  });

  logger.info(`Uploaded PDF to OpenAI for OCR: file_id=${uploadedFile.id}`);

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'file' as any,
              file: { file_id: uploadedFile.id },
            },
            {
              type: 'text',
              text: 'Extract all the text from this document page by page. Preserve paragraph structure, headings, and reading order. Output only the raw extracted text — no commentary, no formatting markup.',
            },
          ],
        },
      ],
      max_tokens: 16000,
      temperature: 0,
    });

    return response.choices[0]?.message?.content?.trim() || '';
  } finally {
    // Delete the temporary file from OpenAI to avoid storage accumulation
    await openai.files.del(uploadedFile.id).catch((e: any) => {
      logger.warn('Failed to delete OpenAI temp file:', e.message);
    });
  }
}

/** Extract text from a PDF — pdf-parse first (fast/free), Vision OCR fallback for scanned docs */
async function extractTextFromPDF(buffer: Buffer, filename: string): Promise<{ text: string; ocr: boolean }> {
  // Primary: pdf-parse (handles text-embedded PDFs, no API cost)
  try {
    const pdfParse = await getPdfParse();
    const result = await pdfParse(buffer);
    const text = normalizeWhitespace(result.text);
    const rawLen = result.text?.length ?? 0;
    const normLen = text.length;
    logger.info(`pdf-parse raw=${rawLen} norm=${normLen} preview="${text.slice(0, 80).replace(/\n/g, '\\n')}" isReadable=${isReadableText(text)}`);
    if (isReadableText(text)) {
      return { text, ocr: false };
    }
    logger.info('pdf-parse returned insufficient text — falling back to Vision OCR');
  } catch (err: any) {
    logger.warn('pdf-parse failed:', err.message);
  }

  // Fallback: GPT-4o Vision via Files API (for scanned / image-only PDFs)
  if (!process.env.OPENAI_API_KEY) {
    logger.warn('OPENAI_API_KEY not set — cannot perform Vision OCR');
    return { text: '', ocr: false };
  }
  try {
    const text = normalizeWhitespace(await ocrPDFWithVision(buffer, filename));
    if (isReadableText(text)) {
      logger.info(`Vision OCR extracted ${text.length} chars`);
      return { text, ocr: true };
    }
  } catch (err: any) {
    logger.error('Vision OCR failed:', err.message);
  }

  return { text: '', ocr: false };
}

/** Extract text from a plain text buffer */
function extractTextFromTxt(buffer: Buffer): string {
  return normalizeWhitespace(buffer.toString('utf-8'));
}

/** Extract text from a DOCX buffer by parsing the embedded word/document.xml */
async function extractTextFromDocx(buffer: Buffer): Promise<string> {
  try {
    const JSZip = (await import('jszip')).default;
    const zip = await JSZip.loadAsync(buffer);
    const xmlFile = zip.file('word/document.xml');
    if (!xmlFile) throw new Error('word/document.xml not found in DOCX');

    const xmlContent = await xmlFile.async('string');
    const text = xmlContent
      .replace(/<w:t[^>]*>/gi, ' ')
      .replace(/<w:br[^>]*\/>/gi, '\n')
      .replace(/<w:p[^>]*\/>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&#x[0-9A-Fa-f]+;/g, ' ');

    return normalizeWhitespace(text);
  } catch (err: any) {
    logger.error('DOCX extraction failed:', err.message);
    return '';
  }
}

export async function POST(req: NextRequest) {
  const uid = await getAuthenticatedUid(req);
  if (!uid) {
    return NextResponse.json({ error: 'Authentication required.', success: false }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file was selected.', success: false }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'The file exceeds the 10MB limit.', success: false }, { status: 400 });
    }

    const fileType = ACCEPTED_TYPES[file.type];
    if (!fileType) {
      return NextResponse.json(
        { error: 'Unsupported file type. Please upload a PDF, DOCX, or TXT file.', success: false },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (fileType === 'pdf' && buffer.toString('ascii', 0, 5) !== '%PDF-') {
      return NextResponse.json({ error: 'The file does not appear to be a valid PDF.', success: false }, { status: 400 });
    }

    let text = '';
    let ocr = false;
    if (fileType === 'pdf') {
      const result = await extractTextFromPDF(buffer, file.name);
      text = result.text;
      ocr = result.ocr;
    } else if (fileType === 'docx') {
      text = await extractTextFromDocx(buffer);
    } else if (fileType === 'txt') {
      text = extractTextFromTxt(buffer);
    }

    if (!text || !isReadableText(text)) {
      return NextResponse.json(
        {
          error: 'Could not extract readable text from this document. It may be password-protected or contain only unsupported image formats.',
          success: false
        },
        { status: 422 }
      );
    }

    logger.info(`Extracted ${text.length} chars from "${file.name}" (${fileType}${ocr ? ', OCR' : ''})`);
    return NextResponse.json({ text, success: true, charCount: text.length, fileType, ocr });

  } catch (error: any) {
    logger.error('Document processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process document. Please try again.', success: false },
      { status: 500 }
    );
  }
}
