import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AnalysisChat from '@/components/AnalysisChat'

export default async function SessionPage({ params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) redirect('/login')
  const userId = (session as unknown as { userId: string }).userId

  const s = await prisma.session.findFirst({ where: { id: params.id, userId } })
  if (!s) redirect('/workspace')

  const [messages, files] = await Promise.all([
    prisma.message.findMany({ where: { sessionId: params.id }, orderBy: { createdAt: 'asc' } }),
    prisma.fileMeta.findMany({ where: { sessionId: params.id } }),
  ])

  return (
    <main style={{ maxWidth: '800px', margin: '0 auto', padding: '1.5rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <a href="/workspace" style={{ color: '#6B6B6B', fontSize: '0.875rem', textDecoration: 'none' }}>← 返回工作台</a>
      </div>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontFamily: 'Source Serif 4, serif', fontSize: '1.25rem', marginBottom: '0.25rem' }}>{s.title}</h1>
          <p style={{ fontSize: '0.75rem', color: '#6B6B6B' }}>使用 {s.methodology} 方法论</p>
        </div>
      </div>
      <AnalysisChat sessionId={params.id} initialMessages={messages} />
    </main>
  )
}
