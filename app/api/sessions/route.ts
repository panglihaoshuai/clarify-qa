import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { z } from 'zod'

const CreateSchema = z.object({ methodology: z.string().default('brainstorming') })

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: '未登录' }, { status: 401 })
  const userId = (session as unknown as { userId: string }).userId

  const sessions = await prisma.session.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
    select: { id: true, title: true, methodology: true, status: true, createdAt: true },
  })

  return NextResponse.json(sessions)
}

export async function POST(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: '未登录' }, { status: 401 })
  const userId = (session as unknown as { userId: string }).userId

  const body = await req.json()
  const { methodology } = CreateSchema.parse(body)

  const s = await prisma.session.create({
    data: { userId, methodology },
    select: { id: true },
  })

  return NextResponse.json({ id: s.id }, { status: 201 })
}
