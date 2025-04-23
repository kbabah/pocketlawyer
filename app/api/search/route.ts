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
    // Initial completion call
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1",
      messages: [
        {
          role: "system",
          content: `You are a helpful assistant that searches the web to answer user queries. 
Provide the search results in ${language === 'fr' ? 'French' : 'English'}. 
Your response must be a valid JSON object with this exact structure:
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
      ],
      tools: [{
        type: "function",
        function: {
          name: "web_search",
          description: "Search the web for the most relevant results",
          parameters: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "The search query"
              }
            },
            required: ["query"]
          }
        }
      }],
      tool_choice: {
        type: "function",
        function: { name: "web_search" }
      }
    });

    const message = completion.choices[0]?.message;
    const toolCalls = message?.tool_calls;

    // Handle tool calls
    if (toolCalls && toolCalls.length > 0) {
      const toolCall = toolCalls[0];
      if (toolCall.function.name === "web_search") {
        // Get the search arguments
        const searchArgs = JSON.parse(toolCall.function.arguments);
        
        // Make a second completion call with the tool call results
        const secondCompletion = await openai.chat.completions.create({
          model: "gpt-4.1",
          messages: [
            {
              role: "system",
              content: `You are a helpful assistant that formats web search results. 
Format your response as a JSON object with this structure:
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
            },
            message,
            {
              role: "tool",
              tool_call_id: toolCall.id,
              content: JSON.stringify({ query: searchArgs.query })
            }
          ],
          response_format: { type: "json_object" }
        });

        const finalMessage = secondCompletion.choices[0]?.message;
        
        if (finalMessage?.content) {
          try {
            const results = JSON.parse(finalMessage.content);
            return NextResponse.json(results);
          } catch (parseError) {
            console.error('Failed to parse final response:', parseError);
            return NextResponse.json({
              error: 'Failed to parse search results.',
              raw_content: finalMessage.content
            }, { status: 500 });
          }
        }
      }
    }

    // If we get here, something went wrong
    return NextResponse.json({
      error: 'Failed to get search results',
      details: 'No valid response from the AI assistant'
    }, { status: 500 });

  } catch (error: any) {
    console.error('Search API Error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({
      error: 'An error occurred while processing your request',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    }, { status: 500 });
  }
}