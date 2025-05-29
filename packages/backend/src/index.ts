import { Elysia, t } from 'elysia'
import { cors } from '@elysiajs/cors'

const isDev = process.env.NODE_ENV !== 'production'

// シンプルなセッションストア（メモリ内）
const sessions = new Map<string, { 
  userId: string
  username: string
  level: number
  loginTime: string
  expires: number 
}>()

// セッション管理関数
const generateSessionId = () => crypto.randomUUID()

const isSessionValid = (sessionId: string) => {
  const session = sessions.get(sessionId)
  if (!session) return false
  if (Date.now() > session.expires) {
    sessions.delete(sessionId)
    return false
  }
  return true
}

const getSession = (sessionId: string) => {
  if (!isSessionValid(sessionId)) return null
  return sessions.get(sessionId)
}

const createSession = (userData: { userId: string; username: string; level: number }) => {
  const sessionId = generateSessionId()
  const expires = Date.now() + (24 * 60 * 60 * 1000) // 24時間
  sessions.set(sessionId, {
    ...userData,
    loginTime: new Date().toISOString(),
    expires
  })
  return sessionId
}

const deleteSession = (sessionId: string) => {
  sessions.delete(sessionId)
}

const app = new Elysia()
  .use(cors({
    origin: 'http://localhost:3000',
    credentials: true
  }))
  .get('/', () => ({ message: 'Game API Server', env: isDev ? 'development' : 'production' }))
  .get('/api/health', () => ({ status: 'ok', timestamp: new Date().toISOString() }))
  
  // Authentication endpoints
  .post('/auth/login', ({ body, cookie: { game_session } }) => {
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
        // セッションを作成
        const sessionId = createSession({
          userId: user.id,
          username: user.username,
          level: user.level
        })
        
        // HttpOnlyクッキーを設定
        game_session.set({
          value: sessionId,
          httpOnly: true,
          secure: !isDev,
          sameSite: 'strict',
          maxAge: 24 * 60 * 60, // 24時間
          path: '/'
        })
        
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
  
  .get('/auth/verify', ({ cookie: { game_session } }) => {
    if (isDev) {
      const sessionId = game_session.value
      if (!sessionId) {
        return { valid: false, error: 'No session cookie' }
      }

      const session = getSession(sessionId)
      if (session) {
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
        return { valid: false, error: 'Invalid or expired session' }
      }
    }
    return { error: 'BaaS integration not implemented' }
  })
  
  .post('/auth/logout', ({ cookie: { game_session } }) => {
    if (isDev) {
      const sessionId = game_session.value
      if (sessionId) {
        deleteSession(sessionId)
      }
      
      // クッキーを削除
      game_session.remove()
      
      return { success: true, message: 'Logged out successfully' }
    }
    return { error: 'BaaS integration not implemented' }
  })
  
  // Game data endpoints
  .get('/player/profile', ({ cookie: { game_session } }) => {
    if (isDev) {
      const sessionId = game_session.value
      const session = getSession(sessionId)
      
      if (!session) {
        return { error: 'Not authenticated' }
      }
      
      return {
        id: session.userId,
        username: session.username,
        level: session.level,
        exp: 2840,
        maxExp: 3500,
        hp: 1250,
        maxHp: 1250,
        mp: 420,
        maxMp: 520,
        coins: 15420,
        gems: 127,
        lastLogin: session.loginTime
      }
    }
    return { error: 'BaaS integration not implemented' }
  })
  
  .listen(8000)

console.log(`🎮 Game API Server running at http://localhost:${app.server?.port}`)
console.log(`📱 Environment: ${isDev ? 'Development (Mock)' : 'Production (BaaS)'}`)