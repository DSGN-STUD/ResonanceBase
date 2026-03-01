import { streamText } from 'ai'

export async function POST(req: Request) {
  const { query, myProfile, candidates } = await req.json()

  const systemPrompt = `You are a world-class professional matchmaker with deep understanding of startup dynamics and Ikigai philosophy.

Given the searcher's complete profile and their natural language query, evaluate each candidate and score them 0-100 based on:
1. Ikigai complementarity — do their life purposes align?
2. Skill gap filling — do they have what the searcher lacks?
3. Intent alignment — are both open to the same relationship type?
4. Working style compatibility — availability and remote preferences

For each match write a 2-sentence explanation referencing specific details from both profiles. Sound like a smart friend making an introduction.

Return ONLY valid JSON array, no other text:
[{"userId": "uuid", "score": number, "matchType": "Cofounder"|"Teammate"|"Client", "explanation": "string"}]
Rank by score descending. Only include scores above 40.`

  const userMessage = `Searcher profile: ${JSON.stringify(myProfile)}

Searcher query: "${query}"

Candidates: ${JSON.stringify(candidates.map((c: Record<string, unknown>) => ({
    id: c.id,
    full_name: c.full_name,
    bio: c.bio,
    skills: c.skills,
    interests: c.interests,
    ikigai_passion: c.ikigai_passion,
    ikigai_mission: c.ikigai_mission,
    ikigai_vocation: c.ikigai_vocation,
    ikigai_profession: c.ikigai_profession,
    intent: c.intent,
    availability: c.availability,
    working_style: c.working_style,
  })))}`

  const result = streamText({
    model: 'openai/gpt-4o-mini',
    system: systemPrompt,
    prompt: userMessage,
  })

  // Collect the full text response
  let fullText = ''
  for await (const chunk of result.textStream) {
    fullText += chunk
  }

  // Parse JSON from the response
  try {
    // Try to extract JSON array from the response
    const jsonMatch = fullText.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      return Response.json(parsed)
    }
    return Response.json([])
  } catch {
    return Response.json([])
  }
}
