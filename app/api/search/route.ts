import { NextResponse } from 'next/server';
import { openai, OPENAI_MODELS } from '@/lib/openai';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const language = searchParams.get('lang') || 'en';

  if (!query) {
    return NextResponse.json({ error: 'Query is required' }, { status: 400 });
  }

  try {
    // Sanitize input to prevent XSS
    const sanitizedQuery = query.replace(/[<>]/g, '').trim();
    if (sanitizedQuery.length > 200) {
      return NextResponse.json({ error: 'Query too long' }, { status: 400 });
    }

    // Use the search-optimized model directly (gpt-4o-search-preview supports web search natively)
    const completion = await openai.chat.completions.create({
      model: OPENAI_MODELS.GPT4O_SEARCH,
      messages: [
        {
          role: "system",
          content: `You are a helpful web search assistant with access to real-time web information. 
Search the web and provide comprehensive results for the user's query.

Provide search results in ${language === 'fr' ? 'French' : 'English'}.
Return at least 8-10 high-quality, diverse search results when available.

Format your response as a JSON object with this exact structure:
{
  "results": [
    {
      "title": "Title of the result",
      "link": "https://example.com/url",
      "snippet": "Brief description or excerpt"
    }
  ]
}

Important guidelines:
- Include varied, authoritative sources
- Ensure URLs are complete and valid
- Keep titles under 200 characters
- Keep snippets under 300 characters  
- Prioritize recent and relevant content
- Include diverse perspectives and sources
- Focus on factual, reliable information
- ONLY return the JSON object, no other text`
        },
        {
          role: "user",
          content: `Please search the web for: "${sanitizedQuery}"`
        }
      ]
    });

    const message = completion.choices[0]?.message;
    
    if (message?.content) {
      try {
        // Try to extract JSON from the response
        let jsonContent = message.content.trim();
        
        // If the response contains JSON wrapped in markdown or other text, extract it
        const jsonMatch = jsonContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          jsonContent = jsonMatch[0];
        }
        
        const results = JSON.parse(jsonContent);
        
        // Validate and sanitize results
        if (results && results.results && Array.isArray(results.results)) {
          const sanitizedResults = results.results.map((result: any) => ({
            title: String(result.title || '').substring(0, 200),
            link: String(result.link || '').substring(0, 500),
            snippet: String(result.snippet || '').substring(0, 300)
          })).filter((result: any) => result.title && result.link);

          return NextResponse.json({
            results: sanitizedResults,
            total: sanitizedResults.length
          });
        } else {
          // If no proper JSON structure, try to parse as plain text and create mock results
          const fallbackResults = [{
            title: "Search Results",
            link: "#",
            snippet: message.content.substring(0, 300)
          }];
          
          return NextResponse.json({
            results: fallbackResults,
            total: fallbackResults.length,
            note: "Fallback response - search model may need adjustment"
          });
        }
      } catch (parseError) {
        console.error('Failed to parse search response:', parseError);
        console.log('Raw response:', message.content);
        
        // Fallback: return raw content as single result
        return NextResponse.json({
          results: [{
            title: "Search Results",
            link: "#",
            snippet: message.content?.substring(0, 300) || "No results available"
          }],
          total: 1,
          error: 'Parse error - returned raw response',
          details: process.env.NODE_ENV === 'development' ? String(parseError) : undefined
        });
      }
    }

    return NextResponse.json({
      error: 'No response received from search service',
      details: 'Empty response from AI assistant'
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