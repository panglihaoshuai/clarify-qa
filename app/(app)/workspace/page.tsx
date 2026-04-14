import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import SessionList from '@/components/SessionList'
import UploadSection from '@/components/UploadSection'

export default async function WorkspacePage() {
  const session = await getSession()
  const userId = (session as unknown as { userId: string }).userId

  const sessions = await prisma.session.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
    select: { id: true, title: true, methodology: true, status: true, createdAt: true },
  })

  return (
    <main style={{ maxWidth: '960px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <SessionList sessions={sessions} />
      <div style={{ marginTop: '2rem' }}>
        <UploadSection />
      </div>
    </main>
  )
}
