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
    const { userId, messages, caseDetails, language = "en", model = OPENAI_MODELS.GPT41 } = body

    const identifier = getIdentifier(req, userId)
    const rateLimitConfig = userId
      ? { maxRequests: 15, windowMs: 60000 }
      : { maxRequests: 3, windowMs: 60000 }
    const rateLimitResult = rateLimit(identifier, rateLimitConfig)

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Rate limit exceeded", retryAfter: Math.ceil((rateLimitResult.reset - Date.now()) / 1000) },
        { status: 429 }
      )
    }

    const lastUserMessage = messages?.filter((m: any) => m.role === "user").pop()?.content || ""
    const knowledgeContext = getKnowledgeContext(lastUserMessage, "case_law")

    let caseContext = ""
    if (caseDetails) {
      caseContext = `\n\nCASE DETAILS PROVIDED BY USER:\n${caseDetails}\n`
    }

    const systemPrompt = `You are PocketLawyer Case Review Assistant — a specialised tool for analysing legal cases under Cameroonian law.

YOUR ROLE:
- Analyse the facts of a case and identify relevant legal issues under Cameroonian law.
- Identify the applicable laws, statutes, and legal principles.
- Assess the strengths and weaknesses of each party's position.
- Suggest potential legal strategies and outcomes.
- Reference relevant case law or legal precedents where known.

CASE REVIEW FORMAT:
1. **Case Summary**: Brief restatement of the key facts.
2. **Legal Issues Identified**: List each distinct legal question.
3. **Applicable Law**: Cite specific statutes, articles, and legal provisions for each issue.
4. **Analysis**: For each issue:
   - Strength of the claim/defence (Strong / Moderate / Weak)
   - Key arguments for each side
   - Relevant precedents or common judicial interpretations
5. **Jurisdictional Notes**: Flag if the matter falls under Common Law (Anglophone) or Civil Law (Francophone) procedure, or both.
6. **Recommended Next Steps**: Practical advice (file complaint, seek mediation, consult specialist, gather evidence, etc.)
7. **Risk Assessment**: Overall assessment of likely outcome.

IMPORTANT NOTES:
- This is an analytical tool, not legal advice. Always recommend the user consult a qualified lawyer.
- Focus exclusively on Cameroonian law and applicable OHADA provisions.
- If the case involves matters outside Cameroon's jurisdiction, note this clearly.

Language: Respond in ${language === "fr" ? "French" : "English"}.
${knowledgeContext}${caseContext}`

    const result = streamText({
      model: openai(model),
      system: systemPrompt,
      messages,
    })

    return result.toDataStreamResponse()
  } catch (e: unknown) {
    const error = e as Error
    logger.error("Case Review API Error:", error)
    return new Response(
      JSON.stringify({ error: "An error occurred while processing your case review" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}
