import { NextResponse } from 'next/server'
import { openai } from '@/lib/openai'

export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const { documentContent, question, language = "en" } = await req.json()

    if (!documentContent || !question) {
      return NextResponse.json(
        { error: 'Document content and question are required' },
        { status: 400 }
      )
    }

    // Add debug logging
    console.log('Document content type:', typeof documentContent)
    console.log('Document content length:', documentContent.length)
    console.log('Document content preview:', documentContent.slice(0, 200))

    // Clean and normalize the text content
    const cleanContent = documentContent
      .replace(/\x00/g, '') // Remove null bytes
      .replace(/[\r\n]+/g, '\n') // Normalize line endings
      .trim()

    if (!cleanContent) {
      return NextResponse.json(
        { error: 'Document content appears to be empty or invalid' },
        { status: 400 }
      )
    }

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are a legal document analysis assistant specialized in Cameroonian law. Analyze the following document content and answer questions about it in ${language === "fr" ? "French" : "English"}:\n\n${cleanContent}`
          },
          {
            role: "user",
            content: question
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      })

      const analysis = completion.choices[0]?.message?.content
      if (!analysis) {
        throw new Error('No analysis generated')
      }

      return NextResponse.json({ analysis })

    } catch (openaiError) {
      console.error('OpenAI API Error:', openaiError)
      return NextResponse.json(
        { error: 'Failed to generate analysis', details: String(openaiError) },
        { status: 503 }
      )
    }
  } catch (error) {
    console.error('Request Error:', error)
    return NextResponse.json(
      { error: 'Failed to process request', details: String(error) },
      { status: 500 }
    )
  }
}