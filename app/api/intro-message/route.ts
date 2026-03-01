import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { senderName, receiverName, senderPassion, receiverPassion, senderSkills, receiverSkills } = await req.json()
  
  const clean = (s: unknown) => String(s || '').replace(/[^\x20-\x7E]/g, '')
  const key = (process.env.OPENAI_API_KEY || '').replace(/[^\x20-\x7E]/g, '')
  
  if (!key) {
    return NextResponse.json({ message: 'Hi! I came across your profile and think we could create something great together. Would love to connect and explore potential collaboration.' })
  }
  
  const prompt = 'Write a warm 3-sentence intro message from ' +
    clean(senderName) + ' to ' + clean(receiverName) + '. ' +
    'Sender passion: ' + clean(senderPassion) + '. ' +
    'Receiver passion: ' + clean(receiverPassion) + '. ' +
    'Sender skills: ' + clean(senderSkills) + '. ' +
    'Receiver skills: ' + clean(receiverSkills) + '. ' +
    'Sound human. Reference specific details. ' +
    'End with clear reason to connect. No emojis.'

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + key
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8,
        max_tokens: 150
      })
    })
    
    const data = await res.json()
    const message = data.choices?.[0]?.message?.content || ''
    return NextResponse.json({ message: clean(message) })
  } catch (error) {
    console.error('Intro message error:', error)
    return NextResponse.json({ message: 'Hi! I came across your profile and think we could create something great together. Would love to connect and explore potential collaboration.' })
  }
}
