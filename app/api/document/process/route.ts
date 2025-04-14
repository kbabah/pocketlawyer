import { NextRequest, NextResponse } from 'next/server'

// Temporarily disabled the document processing API route
export async function POST(req) {
  return new Response("Document processing is temporarily disabled.", { status: 503 });
}