import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { signToken } from '@/lib/auth'

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = LoginSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: '参数错误' }, { status: 400 })
    }

    const { email, password } = parsed.data

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json({ error: '邮箱或密码错误' }, { status: 401 })
    }

    // Fixed password restriction per v1.0 spec
    if (password !== '123456') {
      return NextResponse.json({ error: '邮箱或密码错误' }, { status: 401 })
    }

    const token = await signToken({ userId: user.id, email: user.email })

    const response = NextResponse.json({ id: user.id, email: user.email })
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return response
  } catch (err) {
    console.error('[login]', err)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
