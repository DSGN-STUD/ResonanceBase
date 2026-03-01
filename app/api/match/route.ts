// Nuclear sanitize - catches everything by filtering char codes > 255
const nuclearClean = (input: unknown): unknown => {
  if (typeof input === 'string') {
    return input.split('').filter(c => c.charCodeAt(0) <= 255).join('')
  }
  if (Array.isArray(input)) {
    return input.map(nuclearClean)
  }
  if (typeof input === 'object' && input !== null) {
    return Object.fromEntries(
      Object.entries(input).map(([k, v]) => [k, nuclearClean(v)])
    )
  }
  return input
}

export async function POST(req: Request) {
  const { query, myProfile, candidates } = await req.json()

  if (!candidates || candidates.length === 0) {
    return Response.json([])
  }

  // Apply nuclear sanitization to ALL inputs
  const cleanQuery = nuclearClean(query) as string
  const cleanMyProfile = nuclearClean(myProfile)
  const cleanCandidates = nuclearClean(candidates) as Record<string, unknown>[]

  // Use string concatenation to avoid Unicode line separators in template literals
  const systemPrompt = "You are a world-class professional matchmaker. " +
    "Given the searcher profile and search query, evaluate each candidate " +
    "and score them 0-100 based on: " +
    "1. Ikigai complementarity. " +
    "2. Skill gap filling. " +
    "3. Intent alignment. " +
    "4. Working style compatibility. " +
    "For each match write a 2-sentence explanation. " +
    "Return ONLY valid JSON array: " +
    "[{\"userId\": \"uuid\", \"score\": number, \"matchType\": \"Cofounder\"|\"Teammate\"|\"Client\", \"explanation\": \"string\"}] " +
    "Rank by score descending. Only include scores above 40."

  const userMessage = "Searcher profile: " + JSON.stringify(cleanMyProfile) +
    " Searcher query: " + JSON.stringify(cleanQuery) +
    " Candidates: " + JSON.stringify(cleanCandidates)

  try {
    const requestBody = {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      temperature: 0.7
    }
    
    // Serialize to JSON and apply nuclear filter as last line of defense
    const finalBody = JSON.stringify(requestBody)
    const safeBody = finalBody
      .split('')
      .filter(c => c.charCodeAt(0) <= 255)
      .join('')
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: safeBody
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
