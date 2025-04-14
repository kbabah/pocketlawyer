import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const language = searchParams.get('lang') || 'en';

  if (!query) {
    return NextResponse.json({ error: 'Query is required' }, { status: 400 });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a web search assistant. Search for relevant information and return results in ${language === 'fr' ? 'French' : 'English'}. Format your response as a JSON object exactly like this:
{
  "results": [
    {
      "title": "Title of the result",
      "link": "URL of the result",
      "snippet": "Brief description or excerpt"
    }
  ]
}`
        },
        {
          role: "user",
          content: query
        }
      ]
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content received from OpenAI');
    }

    // Parse the content as JSON
    const results = JSON.parse(content);
    return NextResponse.json(results);
  } catch (error: any) {
    console.error('Search API Error:', error);
    return NextResponse.json({ 
      error: 'An error occurred while processing your request',
      details: process.env.NODE_ENV === 'development' ? error?.message : undefined 
    }, { status: 500 });
  }
}