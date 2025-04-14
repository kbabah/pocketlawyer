import { NextResponse } from 'next/server'
import { openai } from '@/lib/openai'

export const maxDuration = 30

// Temporarily disabled the document analysis API route
export async function POST(req) {
  return new Response("Document analysis is temporarily disabled.", { status: 503 });
}