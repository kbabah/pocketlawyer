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
    const { userId, messages, contractType, language = "en", model = OPENAI_MODELS.GPT41 } = body

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
    const knowledgeContext = getKnowledgeContext(
      contractType || lastUserMessage,
      "contract_template"
    )

    const systemPrompt = `You are PocketLawyer Contract Drafting Assistant — a specialised tool for creating legal contracts compliant with Cameroonian law and OHADA regulations.

YOUR ROLE:
- Draft professional legal contracts tailored to the user's requirements.
- Ensure all contracts comply with relevant Cameroonian statutes and OHADA Uniform Acts.
- Include all legally required clauses and standard protective provisions.
- Use proper legal language appropriate for Cameroon's bijural system.

CONTRACT DRAFTING GUIDELINES:
1. **Identify the parties**: Full legal names, addresses, identification numbers (CNI, RCCM, NIU as applicable).
2. **Define the object clearly**: What the contract is about.
3. **Essential clauses**: Duration, obligations, compensation, termination, dispute resolution.
4. **Compliance**: Reference applicable law (Labour Code, OHADA Acts, Civil Code, Tax Code, etc.)
5. **Local requirements**:
   - Employment contracts must reference the Labour Code.
   - Commercial contracts must reference OHADA Uniform Acts.
   - Real estate contracts must reference applicable land tenure law.
   - Include withholding tax provisions where required.
6. **Format**: Use numbered articles, clear headings, and signature blocks.

AVAILABLE CONTRACT TYPES:
- Employment Contract (CDI/CDD)
- Service Agreement (Prestation de Services)
- Residential/Commercial Lease (Bail)
- Sale of Goods Agreement
- Non-Disclosure Agreement (NDA)
- Partnership Agreement
- Loan Agreement
- Power of Attorney (Procuration)
- Joint Venture Agreement
- Any other contract the user requests

IMPORTANT:
- Always include a clause specifying governing law (Cameroon / OHADA).
- Always include a dispute resolution clause (courts or arbitration).
- Use placeholders [brackets] for information the user needs to fill in.
- Remind the user to have important contracts reviewed by a lawyer and, where required, notarised.
- Contracts can be drafted in English or French based on user preference.

Language: Respond in ${language === "fr" ? "French" : "English"}.
${knowledgeContext}`

    const result = streamText({
      model: openai(model),
      system: systemPrompt,
      messages,
    })

    return result.toDataStreamResponse()
  } catch (e: unknown) {
    const error = e as Error
    logger.error("Draft Contract API Error:", error)
    return new Response(
      JSON.stringify({ error: "An error occurred while drafting your contract" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}
