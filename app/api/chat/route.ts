import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json()
    const apiKey = process.env.OPENAI_API_KEY
    console.log('OpenAI API Key:', apiKey)
    if (!apiKey) {
      console.error('OpenAI API key not configured.')
      return NextResponse.json({ error: 'OpenAI API key not configured.' }, { status: 500 })
    }
    if (!message) {
      console.error('No message provided.')
      return NextResponse.json({ error: 'No message provided.' }, { status: 400 })
    }
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful travel assistant for Latvia. Answer questions about destinations, weather, food, events, and travel tips.' },
          { role: 'user', content: message },
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    })
    const data = await openaiRes.json()
    if (data.error) {
      console.error('OpenAI API error:', data.error)
      return NextResponse.json({ error: data.error.message }, { status: 500 })
    }
    return NextResponse.json({ reply: data.choices[0].message.content })
  } catch (err) {
    console.error('API route error:', err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}