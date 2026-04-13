'use client'

import Link from 'next/link'

interface Session {
  id: string
  title: string
  methodology: string
  status: string
  createdAt: Date
}

export default function SessionList({ sessions }: { sessions: Session[] }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1rem', color: '#6B6B6B' }}>历史会话</h2>
        <Link href="/workspace" style={{ fontSize: '0.875rem', color: '#2563EB' }}>+ 新建分析</Link>
      </div>
      {sessions.length === 0 ? (
        <p style={{ color: '#6B6B6B', fontSize: '0.875rem' }}>暂无分析记录</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {sessions.map((s) => (
            <Link key={s.id} href={`/session/${s.id}`}
              style={{ padding: '0.75rem 1rem', background: '#fff', borderRadius: '6px', border: '1px solid #E5E5E0', textDecoration: 'none', color: 'inherit', display: 'block' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 500 }}>{s.title}</span>
                <span style={{ fontSize: '0.75rem', color: '#6B6B6B' }}>{new Date(s.createdAt).toLocaleDateString('zh-CN')}</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#6B6B6B', marginTop: '0.25rem' }}>{s.methodology}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
