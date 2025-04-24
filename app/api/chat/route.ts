import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"
import { OPENAI_MODELS } from '@/lib/openai'

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

// Validate the requested model or fallback to default
function validateModel(requestedModel: string): string {
  // Array of supported models
  const supportedModels = Object.values(OPENAI_MODELS);
  
  // If the requested model is supported, use it
  if (supportedModels.includes(requestedModel)) {
    return requestedModel;
  }
  
  // Otherwise fallback to default model
  console.warn(`Unsupported model requested: ${requestedModel}. Using default: ${OPENAI_MODELS.GPT41}`);
  return OPENAI_MODELS.GPT41;
}

export async function POST(req: Request) {
  try {
    // Use DEFAULT_MODEL constant for better clarity and consistency
    const DEFAULT_MODEL = OPENAI_MODELS.GPT41;
    const { messages, userId, documentContent, language = "en", model = DEFAULT_MODEL } = await req.json()

    // Validate the model parameter
    const validatedModel = validateModel(model);

    // Base system prompt that strictly enforces Cameroonian law focus
    const basePrompt = `You are PocketLawyer, a virtual legal assistant focused exclusively on Cameroonian law.
Your job is to provide clear, accurate, and practical information strictly related to Cameroonian legal matters—this includes laws, legal procedures, and how the legal system works in Cameroon.

Only respond to questions directly related to Cameroonian law.

If a question is outside this scope, politely let the user know you can only assist with Cameroonian legal topics.

Style guidelines:

Use simple, clear, and concise language.

Write in an active voice to keep explanations direct and actionable.

Break your responses into bullet points and use line breaks to separate ideas.

Avoid passive constructions and legal jargon that might confuse non-lawyers.

Avoid generalizations, clichés, metaphors, hashtags, emojis, asterisks, and semicolons.

Speak directly to the user—use "you" and "your" to make the information more relatable.

Encourage engagement by posing thoughtful questions where appropriate.

If you are unsure about any aspect of Cameroonian law, acknowledge your limitations and suggest consulting a qualified legal professional in Cameroon:
${language === "fr" ? 
      "Je ne peux répondre qu'aux questions concernant le droit camerounais. Veuillez reformuler votre question en relation avec le système juridique camerounais." :
      "I can only answer questions about Cameroonian law. Please rephrase your question to relate to the Cameroonian legal system."
}`

    // Enhanced system prompt for authenticated users with language preference
    let systemPrompt = userId
      ? `${basePrompt}\n\nFor authenticated users, provide detailed responses with specific legal references and citations from Cameroonian law. If you're unsure about any aspect of Cameroonian law, acknowledge your limitations and suggest consulting a qualified legal professional in Cameroon. Please respond in ${language === "fr" ? "French" : "English"}`
      : `${basePrompt}\n\nProvide helpful information strictly about Cameroonian law. If you're unsure about any aspect of Cameroonian law, acknowledge your limitations and suggest consulting a qualified legal professional in Cameroon. Please respond in ${language === "fr" ? "French" : "English"}`

    // If document content is provided, add it to the system prompt
    if (documentContent) {
      systemPrompt += `\n\nThe user has provided the following Cameroonian legal document for analysis. Use this document to inform your responses when relevant to Cameroonian law:\n\n${documentContent}`
    }

    const result = streamText({
      model: openai(validatedModel), // Use the validated model
      system: systemPrompt,
      messages,
      tools: {
        web_search_preview: openai.tools.webSearchPreview({
          searchContextSize: "high",
        }),
      },
    })

    return result.toDataStreamResponse()
  } catch (e: unknown) {
    const error = e as Error;
    console.error('Chat API Error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'An error occurred while processing your request',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}
