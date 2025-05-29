import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { sessionPlugin } from 'elysia-session'
import { CookieStore } from 'elysia-session/stores/cookie'

const isDev = process.env.NODE_ENV !== 'production'

const app = new Elysia()
  .use(cors({
    origin: 'http://localhost:3000',
    credentials: true
  }))
  .use(sessionPlugin({
    cookieName: 'game_session',
    store: new CookieStore({
      cookieOptions: { 
        httpOnly: true,
        secure: !isDev,
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 // 24時間
      }
    }),
    expireAfter: 24 * 60 * 60 // 24時間
  }))
  .get('/', () => ({ message: 'Game API Server', env: isDev ? 'development' : 'production' }))
  .get('/api/health', () => ({ status: 'ok', timestamp: new Date().toISOString() }))
  
  // Authentication endpoints
  .post('/auth/login', ({ body, session }) => {
    if (isDev) {
      // 簡易認証ロジック（開発用）
      const { username, password } = body as { username?: string; password?: string }
      
      if (!username || !password) {
        return {
          success: false,
          error: 'Username and password are required'
        }
      }

      // 簡易認証（実際のプロダクションではDB等で検証）
      const validUsers = [
        { username: 'admin', password: 'admin123', id: 'user_001', level: 50 },
        { username: 'player1', password: 'pass123', id: 'user_002', level: 25 },
        { username: 'test', password: 'test', id: 'user_003', level: 1 }
      ]

      const user = validUsers.find(u => u.username === username && u.password === password)
      
      if (user) {
        // セッションにユーザー情報を保存
        session.userId = user.id
        session.username = user.username
        session.level = user.level
        session.loginTime = new Date().toISOString()
        
        return {
          success: true,
          user: {
            id: user.id,
            username: user.username,
            level: user.level,
            createdAt: new Date().toISOString()
          }
        }
      } else {
        return {
          success: false,
          error: 'Invalid username or password'
        }
      }
    }
    // In production, call actual BaaS
    return { error: 'BaaS integration not implemented' }
  })
  
  
  .get('/auth/verify', ({ session }) => {
    if (isDev) {
      // セッションからユーザー情報を確認
      if (session.userId) {
        return {
          valid: true,
          user: {
            id: session.userId,
            username: session.username,
            level: session.level,
            loginTime: session.loginTime
          }
        }
      } else {
        return { valid: false, error: 'No active session' }
      }
    }
    return { error: 'BaaS integration not implemented' }
  })
  
  .post('/auth/logout', ({ session }) => {
    if (isDev) {
      // セッションを削除
      session.userId = undefined
      session.username = undefined
      session.level = undefined
      session.loginTime = undefined
      
      return { success: true, message: 'Logged out successfully' }
    }
    return { error: 'BaaS integration not implemented' }
  })
  
  // Game data endpoints
  .get('/player/profile', ({ headers }) => {
    if (isDev) {
      return {
        id: 'mock_user_123',
        username: 'TestPlayer',
        level: 25,
        exp: 2840,
        maxExp: 3500,
        hp: 1250,
        maxHp: 1250,
        mp: 420,
        maxMp: 520,
        coins: 15420,
        gems: 127,
        lastLogin: new Date().toISOString()
      }
    }
    return { error: 'BaaS integration not implemented' }
  })
  
  .listen(8000)

console.log(`🎮 Game API Server running at http://localhost:${app.server?.port}`)
console.log(`📱 Environment: ${isDev ? 'Development (Mock)' : 'Production (BaaS)'}`)