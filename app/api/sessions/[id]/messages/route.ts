import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { getSkillPrompt } from '@/lib/skills'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: '未登录' }, { status: 401 })

  const messages = await prisma.message.findMany({
    where: { sessionId: params.id },
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json(messages)
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: '未登录' }, { status: 401 })
  const userId = (session as unknown as { userId: string }).userId

  const s = await prisma.session.findFirst({ where: { id: params.id, userId } })
  if (!s) return NextResponse.json({ error: '未找到' }, { status: 404 })

  const body = await req.json()
  const { content } = body

  const userMsg = await prisma.message.create({
    data: { sessionId: params.id, role: 'user', content },
  })

  // Build context from last 10 messages
  const history = await prisma.message.findMany({
    where: { sessionId: params.id },
    orderBy: { createdAt: 'desc' },
    take: 10,
  })
  const reversed = history.reverse().map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }))

  const systemPrompt = getSkillPrompt(s.methodology)

  try {
    const { minimaxChat } = await import('@/lib/minimax')
    const reply = await minimaxChat([...reversed, { role: 'user', content }], systemPrompt)

    const assistantMsg = await prisma.message.create({
      data: { sessionId: params.id, role: 'assistant', content: reply },
    })

    return NextResponse.json(assistantMsg)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'AI 响应失败' }, { status: 500 })
  }
}
