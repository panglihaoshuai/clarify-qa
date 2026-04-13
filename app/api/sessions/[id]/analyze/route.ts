import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { getSkillPrompt } from '@/lib/skills'

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: '未登录' }, { status: 401 })
  const userId = (session.payload as { userId: string }).userId

  const s = await prisma.session.findFirst({ where: { id: params.id, userId } })
  if (!s) return NextResponse.json({ error: '未找到' }, { status: 404 })

  const formData = await req.formData()
  const files = formData.getAll('files') as File[]
  const methodology = (formData.get('methodology') as string) || s.methodology

  // 1. Save file metadata
  for (const file of files) {
    await prisma.fileMeta.create({
      data: {
        sessionId: params.id,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      },
    })
  }

  // 2. Build user message content
  let userContent = '请分析以下内容：\n\n'

  for (const file of files) {
    if (file.type.startsWith('image/')) {
      const buffer = await file.arrayBuffer()
      const base64 = Buffer.from(buffer).toString('base64')
      const ext = file.name.split('.').pop()?.toLowerCase() ?? 'png'
      const mimeType = ext === 'jpg' ? 'jpeg' : ext
      userContent += `[图片: ${file.name}]\n`
      userContent += `![${file.name}](data:image/${mimeType};base64,${base64})\n\n`
    } else {
      const text = await file.text()
      userContent += `[文件: ${file.name}]\n${text.slice(0, 3000)}\n\n`
    }
  }

  // 3. Get skill prompt
  const systemPrompt = getSkillPrompt(methodology)

  // 4. Trigger async AI analysis
  invokeAnalysis(params.id, userContent, systemPrompt, methodology)

  // Return immediately — frontend will poll
  return NextResponse.json({ sessionId: params.id, status: 'processing' })
}

async function invokeAnalysis(sessionId: string, userContent: string, systemPrompt: string, methodology: string) {
  try {
    const { minimaxChat } = await import('@/lib/minimax')
    const content = await minimaxChat([{ role: 'user', content: userContent }], systemPrompt)

    await prisma.session.update({
      where: { id: sessionId },
      data: { status: 'completed', title: `分析-${new Date().toLocaleDateString('zh-CN')}` },
    })

    await prisma.message.createMany({
      data: [
        { sessionId, role: 'user', content: userContent.slice(0, 500) },
        { sessionId, role: 'assistant', content },
      ],
    })
  } catch (err) {
    console.error('Analysis failed:', err)
    await prisma.message.create({
      data: { sessionId, role: 'assistant', content: '分析失败，请重试。' },
    })
  }
}
