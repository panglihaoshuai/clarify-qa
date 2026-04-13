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
