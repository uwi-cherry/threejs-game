import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'My Game - ソーシャルRPG',
  description: 'ソーシャルRPGゲーム',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}