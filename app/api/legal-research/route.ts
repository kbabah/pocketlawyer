import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"
import { OPENAI_MODELS } from "@/lib/openai"
import { logger } from "@/lib/logger"
import { rateLimit, getIdentifier } from "@/lib/rate-limit"
import { NextResponse } from "next/server"
import { getKnowledgeContext } from "@/lib/knowledge-base"

export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { userId, messages, language = "en", model = OPENAI_MODELS.GPT41 } = body

    // Rate limiting
    const identifier = getIdentifier(req, userId)
    const rateLimitConfig = userId
      ? { maxRequests: 20, windowMs: 60000 }
      : { maxRequests: 5, windowMs: 60000 }
    const rateLimitResult = rateLimit(identifier, rateLimitConfig)

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Rate limit exceeded", retryAfter: Math.ceil((rateLimitResult.reset - Date.now()) / 1000) },
        { status: 429 }
      )
    }

    // Extract the user's latest query to search knowledge base
    const lastUserMessage = messages?.filter((m: any) => m.role === "user").pop()?.content || ""
    const knowledgeContext = getKnowledgeContext(lastUserMessage, undefined)

    const systemPrompt = `You are PocketLawyer Legal Research Assistant — a specialised tool for researching Cameroonian law.

YOUR ROLE:
- Provide thorough, well-sourced legal research on Cameroonian law topics.
- Cite specific statutes, law numbers, articles, and dates whenever possible.
- Reference OHADA Uniform Acts where applicable to commercial/business matters.
- Explain both Common Law (Anglophone regions) and Civil Law (Francophone regions) perspectives when relevant.
- Differentiate between national legislation, decrees, and customary law.

RESEARCH FORMAT:
1. Start with a clear summary of the legal position.
2. Cite the primary legislation or legal authority.
3. Explain how the law applies in practice.
4. Note any recent amendments or pending reforms.
5. Highlight if the area differs between Anglophone and Francophone jurisdictions.
6. Suggest related areas of law the user might want to explore.

LIMITATIONS:
- Only provide information about Cameroonian law (and OHADA where it applies in Cameroon).
- If the topic is outside Cameroonian law, politely redirect.
- If you are uncertain, clearly state the limitation and recommend consulting a qualified Cameroonian lawyer.
- Never provide advice that could be construed as legal representation.

Language: Respond in ${language === "fr" ? "French" : "English"}.
${knowledgeContext}`

    const result = streamText({
      model: openai(model),
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
    const error = e as Error
    logger.error("Legal Research API Error:", error)
    return new Response(
      JSON.stringify({ error: "An error occurred while processing your legal research request" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}
