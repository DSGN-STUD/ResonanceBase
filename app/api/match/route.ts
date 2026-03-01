import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { searchQuery, currentUser, candidates } = await req.json()
    
    const clean = (s: any) => String(s || '').replace(/[^\x20-\x7E]/g, '')
    const key = (process.env.OPENAI_API_KEY || '').replace(/[^\x20-\x7E]/g, '')
    
    const prompt = 'You are a matchmaker. Score each candidate 0-100. ' +
      'Query: ' + clean(searchQuery) + ' ' +
      'Searcher skills: ' + clean((currentUser.skills || []).join(',')) + ' ' +
      'Candidates: ' + candidates.map((c: any) => 
        clean(c.id) + ':' + clean(c.full_name) + ':' + 
        clean((c.skills || []).join(',')) + ':' + 
        clean(c.ikigai_passion)
      ).join('|') +
      ' Return ONLY JSON array: ' +
      '[{"userId":"id","score":90,"matchType":"cofounder",' +
      '"explanation":"reason"}]'

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + key
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 1000
      })
    })

    const data = await res.json()
    const text = data.choices?.[0]?.message?.content || '[]'
    const cleaned = text.replace(/```json|```/g, '').trim()
    const matches = JSON.parse(cleaned)
    return NextResponse.json({ matches })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
