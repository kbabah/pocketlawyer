import { NextRequest, NextResponse } from 'next/server'
import { openai } from '@/lib/openai'

export const maxDuration = 30

export async function POST(req: NextRequest) {
  // Accept JSON with { text: string, question: string }
  const { text, question } = await req.json()
  if (!text || !question) {
    return NextResponse.json({ error: 'Missing document text or question' }, { status: 400 })
  }

  try {
    // Use OpenAI to answer the question based on the document text
    const prompt = `You are a legal assistant. Given the following document, answer the user's question as specifically as possible using only the document's content.\n\nDocument:\n${text}\n\nQuestion: ${question}`
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: 'system', content: 'You are a helpful legal assistant.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 512,
      temperature: 0.2
    })
    const answer = completion.choices[0]?.message?.content || ''
    return NextResponse.json({ answer })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to analyze document' }, { status: 500 })
  }
}