'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('123456')
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (res.ok) {
      router.push('/login')
    } else {
      const data = await res.json()
      setError(data.error || '注册失败')
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', width: '100%', maxWidth: '360px' }}>
        <h1 style={{ fontFamily: 'Source Serif 4, serif', fontSize: '1.5rem', marginBottom: '0.5rem', textAlign: 'center' }}>Clarify Q&amp;A</h1>
        <p style={{ color: '#6B6B6B', textAlign: 'center', marginBottom: '1.5rem', fontSize: '0.9rem' }}>将模糊的想法变得清晰</p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input type="email" placeholder="邮箱" value={email} onChange={e => setEmail(e.target.value)} required
            style={{ padding: '0.75rem', border: '1px solid #E5E5E0', borderRadius: '6px', fontSize: '1rem' }} />
          <input type="password" placeholder="密码（默认123456）" value={password} onChange={e => setPassword(e.target.value)} required
            style={{ padding: '0.75rem', border: '1px solid #E5E5E0', borderRadius: '6px', fontSize: '1rem' }} />
          <p style={{ fontSize: '0.75rem', color: '#6B6B6B' }}>初始密码为 123456，不可修改</p>
          {error && <p style={{ color: '#dc2626', fontSize: '0.875rem' }}>{error}</p>}
          <button type="submit" style={{ padding: '0.75rem', background: '#2563EB', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '1rem', cursor: 'pointer' }}>注册</button>
        </form>
        <p style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.875rem', color: '#6B6B6B' }}>
          已有账号？<a href="/login" style={{ color: '#2563EB' }}>登录</a>
        </p>
      </div>
    </div>
  )
}
