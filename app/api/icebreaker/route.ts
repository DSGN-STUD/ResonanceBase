import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { senderName, receiverName, senderPassion, receiverPassion } = await req.json()
  
  const clean = (s: unknown) => 
    String(s || '').replace(/[^\x20-\x7E]/g, '')
  const key = (process.env.OPENAI_API_KEY || '')
    .replace(/[^\x20-\x7E]/g, '')

  const prompt = 'Generate exactly 3 short icebreaker ' +
    'conversation starters for a first message from ' +
    clean(senderName) + ' to ' + clean(receiverName) + '. ' +
    'Sender passion: ' + clean(senderPassion) + '. ' +
    'Receiver passion: ' + clean(receiverPassion) + '. ' +
    'Each must be under 12 words. ' +
    'Make them specific, warm, and curious. ' +
    'Return ONLY a JSON array of 3 strings. ' +
    'Example: ["Question 1","Question 2","Question 3"]'

  try {
    const res = await fetch(
      'https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + key
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.9,
        max_tokens: 100
      })
    })

    const data = await res.json()
    const text = data.choices?.[0]?.message?.content || '[]'
    const cleaned = text.replace(/```json|```/g, '').trim()
    
    try {
      const icebreakers = JSON.parse(cleaned)
      return NextResponse.json({ icebreakers })
    } catch {
      return NextResponse.json({ icebreakers: [] })
    }
  } catch {
    return NextResponse.json({ icebreakers: [] })
  }
}
