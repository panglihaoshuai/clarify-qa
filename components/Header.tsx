'use client'

import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'

export default function Header({ email }: { email: string }) {
  const router = useRouter()
  const setUser = useAuthStore((s) => s.setUser)

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    router.push('/login')
  }

  return (
    <header style={{ background: '#fff', borderBottom: '1px solid #E5E5E0', padding: '0 1.5rem', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ fontFamily: 'Source Serif 4, serif', fontSize: '1.25rem', fontWeight: 600 }}>
        Clarify Q&A
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span style={{ color: '#6B6B6B', fontSize: '0.875rem' }}>{email}</span>
        <button onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B6B6B', fontSize: '0.875rem' }}>退出</button>
      </div>
    </header>
  )
}
