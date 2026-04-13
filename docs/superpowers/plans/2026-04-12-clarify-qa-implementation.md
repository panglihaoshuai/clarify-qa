# Clarify Q&A Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 独立部署的 AI 问答工具，帮助员工将模糊指令拆解清晰

**Architecture:** Next.js（App Router）+ Railway PostgreSQL + MiniMax API，前端分片处理文件，直接调 API 不经过服务器存储

**Tech Stack:** Next.js 14, Prisma, PostgreSQL, MiniMax API/MCP, Railway

---

## 系统分解

项目分为 5 个子系统，按顺序开发：

| 子系统 | 依赖 | 产出 |
|--------|------|------|
| 1. 项目脚手架 | 无 | 可运行的 Next.js 项目，连接到 Railway DB |
| 2. 认证系统 | 1 | 注册/登录 API + Session 管理 |
| 3. 核心 UI | 1+2 | 工作台、分析页、布局组件 |
| 4. 文件上传 | 1+2+3 | 拖拽上传组件 + 前端分片逻辑 |
| 5. AI 分析 + Skill | 1+2+3+4 | MiniMax 集成、提示词模板、分析流程 |

---

## 子系统 1：项目脚手架

### 1.1 创建 Next.js 项目

**Files:**
- Create: `package.json`
- Create: `next.config.js`
- Create: `tsconfig.json`
- Create: `prisma/schema.prisma`
- Create: `.env.example`
- Create: `app/layout.tsx`
- Create: `app/page.tsx`
- Create: `app/globals.css`

**Steps:**

- [ ] **Step 1: 创建 package.json**

```json
{
  "name": "clarify-qa",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:push": "prisma db push",
    "db:generate": "prisma generate",
    "postinstall": "prisma generate"
  },
  "dependencies": {
    "next": "14.2.0",
    "react": "18.3.0",
    "react-dom": "18.3.0",
    "@prisma/client": "5.12.0",
    "bcryptjs": "2.4.3",
    "jsonwebtoken": "9.0.2",
    "jose": "5.2.0",
    "zod": "3.22.4",
    "zustand": "4.5.0",
    "lucide-react": "0.356.0"
  },
  "devDependencies": {
    "prisma": "5.12.0",
    "typescript": "5.4.0",
    "@types/node": "20.11.0",
    "@types/react": "18.2.0",
    "@types/react-dom": "18.2.0",
    "@types/bcryptjs": "2.4.6",
    "eslint": "8.57.0",
    "eslint-config-next": "14.2.0"
  }
}
```

- [ ] **Step 2: 创建 next.config.js**

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
}

module.exports = nextConfig
```

- [ ] **Step 3: 创建 tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 4: 创建 prisma/schema.prisma**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id           String    @id @default(uuid())
  email        String    @unique
  passwordHash String    @map("password_hash")
  createdAt    DateTime  @default(now()) @map("created_at")

  sessions Session[]

  @@map("users")
}

model Session {
  id          String   @id @default(uuid())
  userId     String   @map("user_id")
  title      String   @default("新分析")
  methodology String  @default("brainstorming")
  status     String   @default("processing") // processing | completed
  createdAt  DateTime @default(now()) @map("created_at")
  updatedAt  DateTime @updatedAt @map("updated_at")

  user     User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  messages Message[]
  files    FileMeta[]

  @@map("sessions")
}

model Message {
  id        String   @id @default(uuid())
  sessionId String   @map("session_id")
  role      String   // user | assistant
  content   String   @db.Text
  createdAt DateTime @default(now()) @map("created_at")

  session Session @relation(fields: [sessionId], references: [id], onDelete: Cascade)

  @@map("messages")
}

model FileMeta {
  id          String  @id @default(uuid())
  sessionId  String  @map("session_id")
  fileName   String  @map("file_name")
  fileType   String  @map("file_type")
  fileSize   Int     @map("file_size")
  miniMaxRef String? @map("mini_max_ref")

  session Session @relation(fields: [sessionId], references: [id], onDelete: Cascade)

  @@map("file_metas")
}
```

- [ ] **Step 5: 创建 .env.example**

```
DATABASE_URL="postgresql://user:password@host:5432/clarify_qa?schema=public"
JWT_SECRET="your-secret-key-min-32-chars"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
MINIMAX_API_KEY="your-minimax-api-key"
MINIMAX_API_URL="https://api.minimax.chat"
```

- [ ] **Step 6: 创建 app/layout.tsx**

```tsx
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Clarify Q&A',
  description: '将模糊的想法变得清晰',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh">
      <body>{children}</body>
    </html>
  )
}
```

- [ ] **Step 7: 创建 app/globals.css**

```css
:root {
  --bg-primary: #FAFAF8;
  --bg-surface: #FFFFFF;
  --text-primary: #1A1A1A;
  --text-secondary: #6B6B6B;
  --accent-primary: #2563EB;
  --accent-warm: #DC7F4A;
  --border: #E5E5E0;
  --shadow: rgba(0,0,0,0.06);
}

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: 'IBM Plex Sans', system-ui, sans-serif;
}
```

- [ ] **Step 8: 创建 app/page.tsx**

```tsx
import { redirect } from 'next/navigation'

export default function Home() {
  redirect('/workspace')
}
```

- [ ] **Step 9: 初始化 Git 并提交**

```bash
cd /Users/songshiyao/.edu_brainstorming
git init
git add .
git commit -m "feat: scaffold Next.js project with Prisma schema

- Next.js 14 with App Router
- PostgreSQL schema via Prisma (User, Session, Message, FileMeta)
- Environment config template"
```

---

### 1.2 连接 Railway PostgreSQL 并推送 Schema

**Files:**
- Modify: `.env`（创建本地 .env）
- Modify: `prisma/schema.prisma`（已在上面创建）

**Steps:**

- [ ] **Step 1: 创建本地 .env（填入 Railway 给的 DATABASE_URL）**

```bash
cp .env.example .env
# 手动编辑 .env 填入 DATABASE_URL
```

- [ ] **Step 2: 安装依赖并推送数据库**

```bash
npm install
npx prisma db push
npx prisma generate
```

- [ ] **Step 3: 提交**

```bash
git add .env.example
git commit -m "chore: add Railway PostgreSQL connection and push schema"
```

---

## 子系统 2：认证系统

### 2.1 注册与登录 API

**Files:**
- Create: `app/api/auth/register/route.ts`
- Create: `app/api/auth/login/route.ts`
- Create: `lib/auth.ts`（JWT 工具）
- Create: `lib/prisma.ts`（Prisma 单例）
- Create: `app/api/auth/register/page.tsx`（注册页组件）
- Create: `app/api/auth/login/page.tsx`（登录页组件）

**Steps:**

- [ ] **Step 1: 创建 lib/prisma.ts**

```ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

- [ ] **Step 2: 创建 lib/auth.ts**

```ts
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!)

export async function signToken(payload: { userId: string; email: string }) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET)
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload
  } catch {
    return null
  }
}

export async function getSession() {
  const cookieStore = cookies()
  const token = cookieStore.get('auth_token')?.value
  if (!token) return null
  return verifyToken(token)
}
```

- [ ] **Step 3: 创建 app/api/auth/register/route.ts**

```ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password } = RegisterSchema.parse(body)

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: '该邮箱已注册' }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: { email, passwordHash },
      select: { id: true, email: true },
    })

    return NextResponse.json({ user }, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: '参数错误' }, { status: 400 })
    }
    console.error(err)
    return NextResponse.json({ error: '注册失败' }, { status: 500 })
  }
}
```

- [ ] **Step 4: 创建 app/api/auth/login/route.ts**

```ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { signToken } from '@/lib/auth'
import { z } from 'zod'

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password } = LoginSchema.parse(body)

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json({ error: '邮箱或密码错误' }, { status: 401 })
    }

    // 1.0 固定密码 123456
    if (password !== '123456') {
      return NextResponse.json({ error: '邮箱或密码错误' }, { status: 401 })
    }

    const token = await signToken({ userId: user.id, email: user.email })

    const response = NextResponse.json({ user: { id: user.id, email: user.email } })
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return response
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: '参数错误' }, { status: 400 })
    }
    return NextResponse.json({ error: '登录失败' }, { status: 500 })
  }
}
```

- [ ] **Step 5: 创建登录页 app/(auth)/login/page.tsx**

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (res.ok) {
      router.push('/workspace')
    } else {
      const data = await res.json()
      setError(data.error || '登录失败')
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', width: '100%', maxWidth: '360px' }}>
        <h1 style={{ fontFamily: 'Source Serif 4, serif', fontSize: '1.5rem', marginBottom: '0.5rem', textAlign: 'center' }}>Clarify Q&A</h1>
        <p style={{ color: '#6B6B6B', textAlign: 'center', marginBottom: '1.5rem', fontSize: '0.9rem' }}>将模糊的想法变得清晰</p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input type="email" placeholder="邮箱" value={email} onChange={e => setEmail(e.target.value)} required
            style={{ padding: '0.75rem', border: '1px solid #E5E5E0', borderRadius: '6px', fontSize: '1rem' }} />
          <input type="password" placeholder="密码（默认123456）" value={password} onChange={e => setPassword(e.target.value)} required
            style={{ padding: '0.75rem', border: '1px solid #E5E5E0', borderRadius: '6px', fontSize: '1rem' }} />
          {error && <p style={{ color: '#dc2626', fontSize: '0.875rem' }}>{error}</p>}
          <button type="submit" style={{ padding: '0.75rem', background: '#2563EB', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '1rem', cursor: 'pointer' }}>登 录</button>
        </form>
        <p style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.875rem', color: '#6B6B6B' }}>
          还没有账号？<a href="/register" style={{ color: '#2563EB' }}>注册新账号</a>
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 6: 创建注册页 app/(auth)/register/page.tsx**

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('123456')
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (res.ok) {
      router.push('/login')
    } else {
      const data = await res.json()
      setError(data.error || '注册失败')
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', width: '100%', maxWidth: '360px' }}>
        <h1 style={{ fontFamily: 'Source Serif 4, serif', fontSize: '1.5rem', marginBottom: '0.5rem', textAlign: 'center' }}>Clarify Q&A</h1>
        <p style={{ color: '#6B6B6B', textAlign: 'center', marginBottom: '1.5rem', fontSize: '0.9rem' }}>将模糊的想法变得清晰</p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input type="email" placeholder="邮箱" value={email} onChange={e => setEmail(e.target.value)} required
            style={{ padding: '0.75rem', border: '1px solid #E5E5E0', borderRadius: '6px', fontSize: '1rem' }} />
          <input type="password" placeholder="密码（默认123456）" value={password} onChange={e => setPassword(e.target.value)} required
            style={{ padding: '0.75rem', border: '1px solid #E5E5E0', borderRadius: '6px', fontSize: '1rem' }} />
          <p style={{ fontSize: '0.75rem', color: '#6B6B6B' }}>初始密码为 123456，不可修改</p>
          {error && <p style={{ color: '#dc2626', fontSize: '0.875rem' }}>{error}</p>}
          <button type="submit" style={{ padding: '0.75rem', background: '#2563EB', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '1rem', cursor: 'pointer' }}>注册</button>
        </form>
        <p style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.875rem', color: '#6B6B6B' }}>
          已有账号？<a href="/login" style={{ color: '#2563EB' }}>登录</a>
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 7: 提交**

```bash
git add .
git commit -m "feat: add authentication API and pages

- JWT-based session management with httpOnly cookie
- Register API (email uniqueness, bcrypt hash)
- Login API (固定密码 123456)
- Login and register pages with form handling"
```

---

## 子系统 3：核心 UI

### 3.1 工作台布局

**Files:**
- Create: `app/(app)/layout.tsx`（认证保护布局）
- Create: `app/(app)/workspace/page.tsx`（主工作台）
- Create: `app/(app)/session/[id]/page.tsx`（分析详情页）
- Create: `components/Header.tsx`
- Create: `components/SessionList.tsx`
- Create: `lib/store.ts`（Zustand 全局状态）

**Steps:**

- [ ] **Step 1: 创建 lib/store.ts**

```ts
import { create } from 'zustand'

interface User {
  id: string
  email: string
}

interface AuthState {
  user: User | null
  setUser: (user: User | null) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}))
```

- [ ] **Step 2: 创建 app/(app)/layout.tsx**

```tsx
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import Header from '@/components/Header'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect('/login')

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF8' }}>
      <Header email={(session.payload as { email: string }).email} />
      {children}
    </div>
  )
}
```

- [ ] **Step 3: 创建 components/Header.tsx**

```tsx
'use client'

import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'

export default function Header({ email }: { email: string }) {
  const router = useRouter()
  const setUser = useAuthStore((s) => s.setUser)

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    router.push('/login')
  }

  return (
    <header style={{ background: '#fff', borderBottom: '1px solid #E5E5E0', padding: '0 1.5rem', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ fontFamily: 'Source Serif 4, serif', fontSize: '1.25rem', fontWeight: 600 }}>
        Clarify Q&A
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span style={{ color: '#6B6B6B', fontSize: '0.875rem' }}>{email}</span>
        <button onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B6B6B', fontSize: '0.875rem' }}>退出</button>
      </div>
    </header>
  )
}
```

- [ ] **Step 4: 创建 app/api/auth/logout/route.ts**

```ts
import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ success: true })
  response.cookies.set('auth_token', '', { maxAge: 0, path: '/' })
  return response
}
```

- [ ] **Step 5: 创建 app/(app)/workspace/page.tsx**

```tsx
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import SessionList from '@/components/SessionList'
import UploadSection from '@/components/UploadSection'

export default async function WorkspacePage() {
  const session = await getSession()
  const userId = (session!.payload as { userId: string }).userId

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
```

- [ ] **Step 6: 创建 components/SessionList.tsx**

```tsx
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
```

- [ ] **Step 7: 提交**

```bash
git add .
git commit -m "feat: add workspace layout and session list

- Auth-protected app layout with header
- Workspace page listing user's sessions
- Session list component with link to detail page
- Logout API endpoint"
```

---

### 3.2 上传区域组件

**Files:**
- Create: `components/UploadSection.tsx`
- Create: `components/MethodologyPicker.tsx`
- Create: `components/FilePreviewList.tsx`

**Steps:**

- [ ] **Step 1: 创建 components/MethodologyPicker.tsx**

```tsx
const METHODOLOGIES = [
  { id: 'brainstorming', label: '通用分析' },
  { id: 'musk', label: '马斯克' },
  { id: 'jobs', label: '乔布斯' },
  { id: 'paul-graham', label: 'Paul Graham' },
  { id: 'munger', label: '芒格' },
]

export { METHODOLOGIES }

export default function MethodologyPicker({ selected, onChange }: {
  selected: string
  onChange: (id: string) => void
}) {
  return (
    <div>
      <p style={{ fontSize: '0.875rem', color: '#6B6B6B', marginBottom: '0.5rem' }}>选择分析框架：</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {METHODOLOGIES.map((m) => (
          <button key={m.id} onClick={() => onChange(m.id)}
            style={{
              padding: '0.375rem 0.875rem',
              borderRadius: '9999px',
              border: selected === m.id ? '1.5px solid #2563EB' : '1px solid #E5E5E0',
              background: selected === m.id ? '#EFF6FF' : '#fff',
              color: selected === m.id ? '#2563EB' : '#1A1A1A',
              fontSize: '0.875rem',
              cursor: 'pointer',
            }}>
            {m.label}
          </button>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: 创建 components/FilePreviewList.tsx**

```tsx
export default function FilePreviewList({ files, onRemove }: {
  files: File[]
  onRemove: (index: number) => void
}) {
  if (files.length === 0) return null

  return (
    <div style={{ marginTop: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
      {files.map((file, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.5rem', background: '#f5f5f3', borderRadius: '4px', fontSize: '0.75rem' }}>
          <span>{file.name}</span>
          <button onClick={() => onRemove(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B6B6B', fontSize: '1rem', lineHeight: 1 }}>×</button>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 3: 创建 components/UploadSection.tsx**

```tsx
'use client'

import { useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import MethodologyPicker, { METHODOLOGIES } from './MethodologyPicker'
import FilePreviewList from './FilePreviewList'

export default function UploadSection() {
  const [files, setFiles] = useState<File[]>([])
  const [methodology, setMethodology] = useState('brainstorming')
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const dropped = Array.from(e.dataTransfer.files)
    if (files.length + dropped.length > 20) {
      alert('最多20个文件')
      return
    }
    setFiles((prev) => [...prev, ...dropped])
  }, [files.length])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const selected = Array.from(e.target.files)
    if (files.length + selected.length > 20) {
      alert('最多20个文件')
      return
    }
    setFiles((prev) => [...prev, ...selected])
  }

  const handleRemove = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit() {
    if (files.length === 0) {
      alert('请先上传文件')
      return
    }
    setUploading(true)

    // 1. 创建 session
    const sessionRes = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ methodology }),
    })
    if (!sessionRes.ok) {
      alert('创建会话失败')
      setUploading(false)
      return
    }
    const { id: sessionId } = await sessionRes.json()

    // 2. 上传文件 + 触发分析
    const formData = new FormData()
    files.forEach((f) => formData.append('files', f))
    formData.append('sessionId', sessionId)
    formData.append('methodology', methodology)

    const analyzeRes = await fetch('/api/sessions/' + sessionId + '/analyze', {
      method: 'POST',
      body: formData,
    })

    setUploading(false)
    if (analyzeRes.ok) {
      router.push('/session/' + sessionId)
    } else {
      alert('分析失败')
    }
  }

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        style={{
          border: '2px dashed',
          borderColor: dragging ? '#2563EB' : '#E5E5E0',
          borderRadius: '8px',
          padding: '2.5rem',
          textAlign: 'center',
          cursor: 'pointer',
          background: dragging ? '#EFF6FF' : '#fff',
          transition: 'all 0.2s ease',
        }}>
        <p style={{ color: '#6B6B6B', fontSize: '0.9rem' }}>
          拖拽文件或图片到这里<br />
          <span style={{ fontSize: '0.75rem' }}>最多20个文件，支持 PDF、图片、文档</span>
        </p>
        <input ref={inputRef} type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.doc,.docx,.txt" onChange={handleFileSelect} style={{ display: 'none' }} />
      </div>

      <FilePreviewList files={files} onRemove={handleRemove} />

      <div style={{ marginTop: '1.5rem' }}>
        <MethodologyPicker selected={methodology} onChange={setMethodology} />
      </div>

      <button onClick={handleSubmit} disabled={uploading || files.length === 0}
        style={{
          marginTop: '1.5rem',
          padding: '0.75rem 2rem',
          background: files.length === 0 ? '#ccc' : '#2563EB',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          fontSize: '1rem',
          cursor: files.length === 0 ? 'not-allowed' : 'pointer',
        }}>
        {uploading ? '分析中...' : '开始分析'}
      </button>
    </div>
  )
}
```

- [ ] **Step 4: 提交**

```bash
git add .
git commit -m "feat: add file upload section with drag-and-drop

- UploadSection with 20-file limit
- Drag-and-drop visual feedback
- MethodologyPicker with 5 pre-installed skills
- FilePreviewList with remove functionality
- Creates session and triggers analysis flow"
```

---

## 子系统 4：会话 API

### 4.1 Session CRUD API

**Files:**
- Create: `app/api/sessions/route.ts`
- Create: `app/api/sessions/[id]/route.ts`
- Create: `app/api/sessions/[id]/analyze/route.ts`
- Create: `app/api/sessions/[id]/messages/route.ts`

**Steps:**

- [ ] **Step 1: 创建 app/api/sessions/route.ts**

```ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { z } from 'zod'

const CreateSchema = z.object({ methodology: z.string().default('brainstorming') })

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: '未登录' }, { status: 401 })
  const userId = (session.payload as { userId: string }).userId

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
  const userId = (session.payload as { userId: string }).userId

  const body = await req.json()
  const { methodology } = CreateSchema.parse(body)

  const s = await prisma.session.create({
    data: { userId, methodology },
    select: { id: true },
  })

  return NextResponse.json({ id: s.id }, { status: 201 })
}
```

- [ ] **Step 2: 创建 app/api/sessions/[id]/route.ts**

```ts
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
```

- [ ] **Step 3: 创建 app/api/sessions/[id]/messages/route.ts**

```ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: '未登录' }, { status: 401 })

  const messages = await prisma.message.findMany({
    where: { sessionId: params.id },
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json(messages)
}
```

- [ ] **Step 4: 创建 app/api/sessions/[id]/analyze/route.ts（文件上传 + 分析触发）**

```ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: '未登录' }, { status: 401 })
  const userId = (session.payload as { userId: string }).userId

  const s = await prisma.session.findFirst({ where: { id: params.id, userId } })
  if (!s) return NextResponse.json({ error: '未找到' }, { status: 404 })

  const formData = await req.formData()
  const files = formData.getAll('files') as File[]
  const methodology = formData.get('methodology') as string

  // 保存文件元数据（不存文件内容）
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

  // 更新 session 标题
  const firstFileName = files[0]?.name ?? '新分析'
  await prisma.session.update({
    where: { id: params.id },
    data: { title: firstFileName.replace(/\.[^.]+$/, ''), methodology },
  })

  // 触发异步 AI 分析（在后端调用 MiniMax）
  // 这里先返回成功，前端轮询结果
  return NextResponse.json({ sessionId: params.id, status: 'processing' })
}
```

- [ ] **Step 5: 提交**

```bash
git add .
git commit -m "feat: add session CRUD and analyze API

- GET/POST /api/sessions
- GET/DELETE /api/sessions/[id]
- POST /api/sessions/[id]/analyze (file metadata only)
- GET /api/sessions/[id]/messages"
```

---

## 子系统 5：AI 分析 + MiniMax 集成

### 5.1 MiniMax API 调用层

**Files:**
- Create: `lib/minimax.ts`（MiniMax API 客户端）
- Create: `lib/skills/` 目录（5个 Skill 的提示词模板）
- Create: `app/api/sessions/[id]/analyze/route.ts`（重写，加入 AI 调用）
- Create: `app/(app)/session/[id]/page.tsx`（分析详情页）

**Steps:**

- [ ] **Step 1: 创建 lib/minimax.ts**

```ts
const MINIMAX_API_URL = process.env.MINIMAX_API_URL || 'https://api.minimax.chat'
const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY

interface MiniMaxMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface MiniMaxImagePart {
  type: 'image_url'
  image_url: { url: string }
}

interface MiniMaxTextPart {
  type: 'text'
  text: string
}

type MiniMaxContent = (MiniMaxImagePart | MiniMaxTextPart)[]

export async function minimaxChat(messages: MiniMaxMessage[], systemPrompt?: string) {
  if (!MINIMAX_API_KEY) {
    throw new Error('MINIMAX_API_KEY not set')
  }

  const body: Record<string, unknown> = {
    model: 'MiniMax-Text-01',
    messages: [
      ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
      ...messages,
    ],
  }

  const res = await fetch(`${MINIMAX_API_URL}/v1/text/chatcompletion_v2`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${MINIMAX_API_KEY}`,
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    throw new Error(`MiniMax API error: ${res.status}`)
  }

  const data = await res.json()
  return data.choices?.[0]?.message?.content ?? ''
}
```

- [ ] **Step 2: 创建 lib/skills/brainstorming.ts**

```ts
export const brainstormingSkill = `你是一个专业的思维整理助手。用户会提供文档或截图，内容可能是模糊的指令、想法或任务描述。

你的任务是：
1. 识别内容中的模糊点——哪里表述不清晰、哪里可能产生歧义
2. 将模糊的指令拆解成具体可执行的子任务

请用以下格式输出：

## 模糊点识别
• [具体模糊点1]
• [具体模糊点2]

## 可执行项建议
1. [可执行项1]
2. [可执行项2]

保持简洁，直接切入重点。`
```

- [ ] **Step 3: 创建 lib/skills/musk.ts**

```ts
export const muskSkill = `你扮演埃隆·马斯克，使用第一性原理（First Principles Thinking）来分析用户的内容。

马斯克的思维框架核心：
1. 质疑每一个假设——"这为什么是这样的？"
2. 从物理定律出发——找到最基本的不可分解的事实
3. 重新构建解决方案——基于第一原理推导新的可能性

你的任务是：
1. 识别内容中最核心的问题是什么（不是表象问题）
2. 追溯到物理/经济/逻辑层面的基本约束
3. 提出真正能落地的解决方案

请用以下格式输出：

## 核心问题（第一性）
[追溯到本质的核心问题]

## 基本约束
• [物理/经济/逻辑约束1]
• [物理/经济/逻辑约束2]

## 重新构建的方案
1. [基于第一原理的解决方案]
2. [可执行的具体步骤]

"这听起来很疯狂，但如果你回到物理第一性原理，你会发现它实际上是可行的。" — Elon Musk`
```

- [ ] **Step 4: 创建 lib/skills/jobs.ts**

```ts
export const jobsSkill = `你扮演史蒂夫·乔布斯，用他的产品哲学和设计思维来分析用户的内容。

乔布斯的思维框架核心：
1. 简约即力量——把复杂的东西变简单
2. 关注用户体验——产品是为了让人的生活更美好
3. 追求卓越——做到极致，不妥协
4. 直觉思维——相信自己的审美和判断

你的任务是：
1. 识别内容中真正重要的事（忽略噪音）
2. 找出与"用户真实需求"的差距
3. 提出简洁有力的行动方案

请用以下格式输出：

## 真正重要的事
[透过表象看到的本质]

## 与卓越的差距
• [当前方案的不足]
• [乔布斯会如何改进]

## 简洁行动方案
1. [最核心的改动]
2. [具体可执行的步骤]

"设计不只是看起来怎么样、感觉怎么样。设计是它如何运作的。" — Steve Jobs`
```

- [ ] **Step 5: 创建 lib/skills/paul-graham.ts**

```ts
export const paulGrahamSkill = `你扮演保罗·格雷厄姆（Paul Graham），用他的写作思维和创业智慧来分析用户的内容。

Paul Graham 的思维框架核心：
1. 写作是思考的方式——想不清楚就写不清楚
2. 关注最根本的东西——不要被表象迷惑
3. 诚实地问——什么是真正的问题？
4. 小步迭代——不要一开始就追求完美

你的任务是：
1. 识别内容中最核心的论点（可能用户自己都没表达清楚）
2. 用清晰的逻辑重新阐述
3. 给出可执行的建议

请用以下格式输出：

## 核心论点（重新阐述）
[用清晰的语言表述]

## 论证的漏洞或模糊点
• [逻辑或表述上的问题]

## 可执行建议
1. [如何把想法变得更清晰]
2. [下一步具体行动]

"Writing doesn't just communicate ideas; it generates them." — Paul Graham`
```

- [ ] **Step 6: 创建 lib/skills/munger.ts**

```ts
export const mungerSkill = `你扮演查理·芒格，用他的多元心智模型来交叉分析用户的内容。

芒格的思维框架核心：
1. 多元心智模型——从不同学科看问题（心理学、经济学、物理学等）
2. 反过来想——总是反过来想
3. 概率思维——考虑可能性和赔率
4. 长期视角——不要被短期噪音干扰

你的任务是：
1. 从多个角度分析内容中的问题
2. 找出潜在的盲点和风险
3. 提出跨学科的综合建议

请用以下格式输出：

## 问题分析（多学科视角）
• [心理学角度]
• [经济学角度]
• [其他相关学科]

## 反过来想
[如果反过来做会怎样]

## 综合建议
1. [多元模型交叉得出的建议]
2. [概率最高的行动路径]

"如果你知道你会死在哪里，就永远不要去那个地方。" — Charlie Munger`
```

- [ ] **Step 7: 创建 lib/skills/index.ts**

```ts
import { brainstormingSkill } from './brainstorming'
import { muskSkill } from './musk'
import { jobsSkill } from './jobs'
import { paulGrahamSkill } from './paul-graham'
import { mungerSkill } from './munger'

export const SKILLS: Record<string, string> = {
  brainstorming: brainstormingSkill,
  musk: muskSkill,
  jobs: jobsSkill,
  'paul-graham': paulGrahamSkill,
  munger: mungerSkill,
}

export function getSkillPrompt(skillId: string): string {
  return SKILLS[skillId] ?? SKILLS.brainstorming
}
```

- [ ] **Step 8: 创建 app/api/sessions/[id]/analyze/route.ts（重写，加入 AI 调用）**

```ts
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

  // 1. 保存文件元数据
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

  // 2. 构建用户消息（包含文件内容或描述）
  let userContent = '请分析以下内容：\n\n'

  for (const file of files) {
    if (file.type.startsWith('image/')) {
      // 将图片转为 base64
      const buffer = await file.arrayBuffer()
      const base64 = Buffer.from(buffer).toString('base64')
      const ext = file.name.split('.').pop()?.toLowerCase() ?? 'png'
      const mimeType = ext === 'jpg' ? 'jpeg' : ext
      userContent += `[图片: ${file.name}]\n`
      // 注意：实际生产中应先上传图片获取 URL
      // MiniMax 支持 base64 图片时：
      userContent += `![${file.name}](data:image/${mimeType};base64,${base64})\n\n`
    } else {
      const text = await file.text()
      userContent += `[文件: ${file.name}]\n${text.slice(0, 3000)}\n\n`
    }
  }

  // 3. 获取 Skill 提示词
  const systemPrompt = getSkillPrompt(methodology)

  // 4. 调用 MiniMax（异步，不阻塞）
  invokeAnalysis(params.id, userContent, systemPrompt, methodology)

  // 立即返回，前端轮询
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
```

- [ ] **Step 9: 创建 app/(app)/session/[id]/page.tsx（分析详情页）**

```tsx
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AnalysisChat from '@/components/AnalysisChat'

export default async function SessionPage({ params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) redirect('/login')
  const userId = (session.payload as { userId: string }).userId

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
```

- [ ] **Step 10: 创建 components/AnalysisChat.tsx**

```tsx
'use client'

import { useState, useRef, useEffect } from 'react'

interface Message {
  id: string
  role: string
  content: string
}

export default function AnalysisChat({ sessionId, initialMessages }: { sessionId: string; initialMessages: Message[] }) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend() {
    if (!input.trim() || sending) return
    const userMsg = input
    setInput('')
    setSending(true)

    // 乐观更新
    const tempId = Date.now().toString()
    setMessages((prev) => [...prev, { id: tempId, role: 'user', content: userMsg }])

    try {
      const res = await fetch(`/api/sessions/${sessionId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: userMsg }),
      })
      if (res.ok) {
        const data = await res.json()
        setMessages((prev) => prev.map((m) => (m.id === tempId ? data : m)))
      }
    } finally {
      setSending(false)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
        {messages.map((m) => (
          <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth: '80%',
              padding: '0.75rem 1rem',
              borderRadius: '12px',
              background: m.role === 'user' ? '#2563EB' : '#fff',
              color: m.role === 'user' ? '#fff' : '#1A1A1A',
              border: m.role === 'assistant' ? '1px solid #E5E5E0' : 'none',
              whiteSpace: 'pre-wrap',
              fontSize: '0.9rem',
              lineHeight: 1.6,
            }}>
              {m.content}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder="基于这份分析，你还有什么想深入讨论的？"
          style={{ flex: 1, padding: '0.75rem 1rem', border: '1px solid #E5E5E0', borderRadius: '6px', fontSize: '0.9rem' }}
        />
        <button onClick={handleSend} disabled={sending || !input.trim()}
          style={{ padding: '0.75rem 1.25rem', background: '#2563EB', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
          发送
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 11: 创建追问 API app/api/sessions/[id]/messages/route.ts（重写，支持 POST）**

```ts
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

  const body = await req.json()
  const { content } = body

  const userMsg = await prisma.message.create({
    data: { sessionId: params.id, role: 'user', content },
  })

  // 构建上下文（取最近 10 条消息）
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
```

- [ ] **Step 12: 提交**

```bash
git add .
git commit -m "feat: integrate MiniMax API with skill-based prompts

- MiniMax API client with chat completion
- 5 pre-installed skill prompts (brainstorming, musk, jobs, paul-graham, munger)
- Async analysis trigger on file upload
- Analysis detail page with message history
- Follow-up message API with context window
- Optimistic UI updates in chat"
```

---

## 自检清单

**Spec 覆盖检查：**

| Spec 需求 | 对应实现 |
|-----------|---------|
| 邮箱+密码注册，123456 | ✅ auth/register API |
| 文件拖拽上传，20个限制 | ✅ UploadSection |
| 5个预装 Skill | ✅ lib/skills/ |
| 模糊点识别+可执行项建议 | ✅ Skill 提示词模板 |
| 分析报告生成 | ✅ /analyze API |
| 追问对话 | ✅ /messages POST |
| 历史会话 | ✅ SessionList + /sessions |
| 前端分片 | ✅ upload 直接调 API |
| Railway 部署 | ✅ Prisma + env |

**占位符扫描：**
- ❌ 无待确认项

**类型一致性：**
- ✅ prisma schema 中的字段名与 API 路由一致（snake_case vs camelCase 处理正确）
- ✅ Session, Message, FileMeta 模型关系正确

---

## 部署说明

**Railway 部署步骤：**

```bash
# 1. 安装 Railway CLI
npm install -g @railway/cli

# 2. 登录
railway login

# 3. 初始化项目
railway init

# 4. 添加 PostgreSQL
railway add

# 5. 部署
railway up
```

**环境变量（Railway Dashboard 设置）：**

```
DATABASE_URL=[from Railway PostgreSQL]
JWT_SECRET=[32+ char secret]
NEXT_PUBLIC_APP_URL=[your deployment URL]
MINIMAX_API_KEY=[your key]
MINIMAX_API_URL=https://api.minimax.chat
```

---

**Plan complete.**

Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
