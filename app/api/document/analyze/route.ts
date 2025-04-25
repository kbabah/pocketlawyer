import { NextRequest, NextResponse } from 'next/server'
import { openai, OPENAI_MODELS } from '@/lib/openai'

export const maxDuration = 30

export async function POST(req: NextRequest) {
  try {
    const { text, question, model = OPENAI_MODELS.GPT41 } = await req.json()
    if (!text || !question) {
      // User-friendly error
      return NextResponse.json({ error: 'Please ensure both the document text and your question are provided.' }, { status: 400 })
    }

    // Basic validation for text length (optional, but good practice)
    if (text.length < 10) {
      return NextResponse.json({ error: 'The document text seems too short to analyze effectively.' }, { status: 400 })
    }
    if (question.length < 3) {
      return NextResponse.json({ error: 'Please provide a more specific question about the document.' }, { status: 400 })
    }

    try {
      // Use OpenAI to answer the question based on the document text
      const prompt = `You are a legal assistant. Given the following document, answer the user's question as specifically as possible using only the document's content.\n\nDocument:\n${text}\n\nQuestion: ${question}`
      const completion = await openai.chat.completions.create({
        model: model, // Use the provided model or default to GPT-4.1
        messages: [
          { role: 'system', content: 'You are a helpful legal assistant.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 512,
        temperature: 0.2
      })
      const answer = completion.choices[0]?.message?.content?.trim() || ''

      if (!answer) {
        // Handle cases where the AI might not provide an answer
        return NextResponse.json({ error: 'The AI could not generate an answer based on the provided document and question. Please try rephrasing your question or using a different document.' }, { status: 500 })
      }

      return NextResponse.json({ answer })
    } catch (error: any) {
      console.error("OpenAI API error:", error);
      // More user-friendly error for AI failures
      let errorMessage = 'Failed to analyze the document due to an issue with the AI service.';
      if (error.code === 'context_length_exceeded') {
        errorMessage = 'The document is too long for the AI to process. Please try with a shorter document or section.';
      } else if (error.status === 429) {
        errorMessage = 'The analysis service is currently busy. Please try again in a few moments.';
      }
      return NextResponse.json({ error: errorMessage + " Please try again later or contact support if the issue persists." }, { status: 500 })
    }
  } catch (outerError: any) {
    console.error("Request parsing error:", outerError);
    // General server error for request issues
    return NextResponse.json({ error: 'There was a problem processing your request. Please ensure the data is correctly formatted.' }, { status: 400 })
  }
}