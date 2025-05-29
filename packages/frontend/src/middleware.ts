import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // 認証が必要なパス
  const protectedPaths = ['/home', '/profile', '/settings']
  const publicPaths = ['/', '/login', '/register']
  
  const { pathname } = request.nextUrl
  
  // 保護されたパスかチェック
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path))
  const isPublicPath = publicPaths.includes(pathname)
  
  if (isProtectedPath) {
    // トークンをcookieから取得
    const token = request.cookies.get('auth_token')?.value
    
    if (!token) {
      // トークンがない場合はログイン画面にリダイレクト
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
    
    // トークンがある場合は続行（サーバーサイドでの検証は別途必要）
    return NextResponse.next()
  }
  
  // 認証済みユーザーがログイン画面にアクセスした場合
  if (pathname === '/login') {
    const token = request.cookies.get('auth_token')?.value
    if (token) {
      // ホーム画面にリダイレクト
      return NextResponse.redirect(new URL('/home', request.url))
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    // 静的ファイルとAPI routesを除外
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}