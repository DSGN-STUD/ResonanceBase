// Sanitize strings to remove ALL Unicode including line/paragraph separators
const sanitize = (str: unknown): string => {
  if (!str) return ''
  return String(str)
    .replace(/\u2028/g, ' ')
    .replace(/\u2029/g, ' ')
    .replace(/[^\u0000-\u00FF]/g, ' ')
    .trim()
}

const sanitizeArray = (arr: unknown): string[] =>
  Array.isArray(arr) ? arr.map(item => sanitize(item)) : []

const sanitizeProfile = (profile: Record<string, unknown>) => ({
  id: profile.id,
  full_name: sanitize(profile.full_name),
  bio: sanitize(profile.bio),
  skills: sanitizeArray(profile.skills),
  interests: sanitizeArray(profile.interests),
  ikigai_passion: sanitize(profile.ikigai_passion),
  ikigai_mission: sanitize(profile.ikigai_mission),
  ikigai_vocation: sanitize(profile.ikigai_vocation),
  ikigai_profession: sanitize(profile.ikigai_profession),
  intent: sanitizeArray(profile.intent),
  availability: sanitize(profile.availability),
  working_style: sanitize(profile.working_style),
})

export async function POST(req: Request) {
  const { query, myProfile, candidates } = await req.json()

  if (!candidates || candidates.length === 0) {
    return Response.json([])
  }

  const sanitizedQuery = sanitize(query)
  const sanitizedMyProfile = myProfile ? sanitizeProfile(myProfile) : null
  const sanitizedCandidates = candidates.map((c: Record<string, unknown>) => sanitizeProfile(c))

  const systemPrompt = `You are a world-class professional matchmaker with deep understanding of startup dynamics and Ikigai philosophy.

Given the searcher's complete profile and their natural language query, evaluate each candidate and score them 0-100 based on:
1. Ikigai complementarity — do their life purposes align?
2. Skill gap filling — do they have what the searcher lacks?
3. Intent alignment — are both open to the same relationship type?
4. Working style compatibility — availability and remote preferences

For each match write a 2-sentence explanation referencing specific details from both profiles. Sound like a smart friend making an introduction.

Return ONLY valid JSON array, no markdown, no code blocks, no other text:
[{"userId": "uuid", "score": number, "matchType": "Cofounder"|"Teammate"|"Client", "explanation": "string"}]
Rank by score descending. Only include scores above 40.`

  const userMessage = `Searcher profile: ${JSON.stringify(sanitizedMyProfile)}

Searcher query: "${sanitizedQuery}"

Candidates: ${JSON.stringify(sanitizedCandidates)}`

  try {
    const requestBody = {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      temperature: 0.7
    }
    
    // Final sanitization pass on the entire JSON body
    const cleanedBody = JSON.stringify(requestBody)
      .replace(/\u2028/g, ' ')
      .replace(/\u2029/g, ' ')
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: cleanedBody
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('OpenAI API error:', errorData)
      return Response.json({ error: `OpenAI API error: ${response.status}` }, { status: 500 })
    }

    const data = await response.json()
    const text = data.choices?.[0]?.message?.content || ''

    // Parse JSON from the response - handle markdown code blocks
    let jsonText = text
    const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (codeBlockMatch) {
      jsonText = codeBlockMatch[1].trim()
    }
    
    // Try to extract JSON array
    const jsonMatch = jsonText.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      return Response.json(parsed)
    }
    
    return Response.json([])
  } catch (error) {
    console.error('Error in match API:', error)
    return Response.json({ error: String(error) }, { status: 500 })
  }
}
