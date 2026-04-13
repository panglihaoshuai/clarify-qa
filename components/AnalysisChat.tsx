'use client'

import { useState, useRef, useEffect } from 'react'

interface Message {
  id: string
  role: string
  content: string
}

export default function AnalysisChat({ sessionId, initialMessages }: { sessionId: string; initialMessages: Message[] }) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend() {
    if (!input.trim() || sending) return
    const userMsg = input
    setInput('')
    setSending(true)

    const tempId = Date.now().toString()
    setMessages((prev) => [...prev, { id: tempId, role: 'user', content: userMsg }])

    try {
      const res = await fetch(`/api/sessions/${sessionId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: userMsg }),
      })
      if (res.ok) {
        const data = await res.json()
        setMessages((prev) => prev.map((m) => (m.id === tempId ? data : m)))
      }
    } finally {
      setSending(false)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
        {messages.map((m) => (
          <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth: '80%',
              padding: '0.75rem 1rem',
              borderRadius: '12px',
              background: m.role === 'user' ? '#2563EB' : '#fff',
              color: m.role === 'user' ? '#fff' : '#1A1A1A',
              border: m.role === 'assistant' ? '1px solid #E5E5E0' : 'none',
              whiteSpace: 'pre-wrap',
              fontSize: '0.9rem',
              lineHeight: 1.6,
            }}>
              {m.content}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder="基于这份分析，你还有什么想深入讨论的？"
          style={{ flex: 1, padding: '0.75rem 1rem', border: '1px solid #E5E5E0', borderRadius: '6px', fontSize: '0.9rem' }}
        />
        <button onClick={handleSend} disabled={sending || !input.trim()}
          style={{ padding: '0.75rem 1.25rem', background: '#2563EB', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
          发送
        </button>
      </div>
    </div>
  )
}
