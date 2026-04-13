import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = RegisterSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: '参数错误' }, { status: 400 })
    }

    const { email, password } = parsed.data

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: '邮箱已被注册' }, { status: 400 })
    }

    const passwordHash = await hash(password, 10)

    const user = await prisma.user.create({
      data: { email, passwordHash },
      select: { id: true, email: true },
    })

    return NextResponse.json(user, { status: 201 })
  } catch (err) {
    console.error('[register]', err)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
