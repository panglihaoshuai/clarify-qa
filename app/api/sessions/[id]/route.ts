import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: '未登录' }, { status: 401 })
  const userId = (session.payload as { userId: string }).userId

  const s = await prisma.session.findFirst({ where: { id: params.id, userId } })
  if (!s) return NextResponse.json({ error: '未找到' }, { status: 404 })

  const [messages, files] = await Promise.all([
    prisma.message.findMany({ where: { sessionId: params.id }, orderBy: { createdAt: 'asc' } }),
    prisma.fileMeta.findMany({ where: { sessionId: params.id } }),
  ])

  return NextResponse.json({ ...s, messages, files })
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: '未登录' }, { status: 401 })
  const userId = (session.payload as { userId: string }).userId

  const s = await prisma.session.findFirst({ where: { id: params.id, userId } })
  if (!s) return NextResponse.json({ error: '未找到' }, { status: 404 })

  await prisma.session.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
