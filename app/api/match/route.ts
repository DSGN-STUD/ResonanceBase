export async function POST(req: Request) {
  const { query, myProfile, candidates } = await req.json()

  if (!candidates || candidates.length === 0) {
    return Response.json([])
  }

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

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.7
      })
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
