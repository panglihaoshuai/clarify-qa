const MINIMAX_API_URL = process.env.MINIMAX_API_URL || 'https://api.minimax.chat'
const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY

interface MiniMaxMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export async function minimaxChat(messages: MiniMaxMessage[], systemPrompt?: string) {
  if (!MINIMAX_API_KEY) {
    throw new Error('MINIMAX_API_KEY not set')
  }

  const body: Record<string, unknown> = {
    model: 'MiniMax-Text-01',
    messages: [
      ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
      ...messages,
    ],
  }

  const res = await fetch(`${MINIMAX_API_URL}/v1/text/chatcompletion_v2`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${MINIMAX_API_KEY}`,
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    throw new Error(`MiniMax API error: ${res.status}`)
  }

  const data = await res.json()
  return data.choices?.[0]?.message?.content ?? ''
}
