'use client'

import './globals.css'
import { GameProviders } from 'narraleaf-react'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>
        <GameProviders>
          {children}
        </GameProviders>
      </body>
    </html>
  )
}
