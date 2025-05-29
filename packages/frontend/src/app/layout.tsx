import './globals.css'

export const metadata = {
  title: 'My Game',
  description: 'ソーシャルRPG',
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
