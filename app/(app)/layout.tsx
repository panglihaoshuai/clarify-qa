import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import Header from '@/components/Header'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect('/login')

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF8' }}>
      <Header email={(session as unknown as { email: string }).email} />
      {children}
    </div>
  )
}
