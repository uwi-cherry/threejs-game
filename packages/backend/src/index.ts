import { Elysia } from 'elysia'

const isDev = process.env.NODE_ENV !== 'production'

const app = new Elysia()
  .get('/', () => ({ message: 'Game API Server', env: isDev ? 'development' : 'production' }))
  .get('/api/health', () => ({ status: 'ok', timestamp: new Date().toISOString() }))
  
  // Authentication endpoints
  .post('/auth/login', ({ body }) => {
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
        return {
          success: true,
          user: {
            id: user.id,
            username: user.username,
            level: user.level,
            createdAt: new Date().toISOString()
          },
          token: `token_${user.id}_${Date.now()}`
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
  
  
  .get('/auth/verify', ({ headers }) => {
    if (isDev) {
      const token = headers.authorization?.replace('Bearer ', '')
      
      if (!token) {
        return { valid: false, error: 'No token provided' }
      }

      // 簡易トークン検証（実際のプロダクションではJWT等を使用）
      if (token.startsWith('token_user_')) {
        const userId = token.split('_')[2]
        const validUsers = [
          { id: 'user_001', username: 'admin', level: 50 },
          { id: 'user_002', username: 'player1', level: 25 },
          { id: 'user_003', username: 'test', level: 1 }
        ]

        const user = validUsers.find(u => u.id === userId)
        if (user) {
          return {
            valid: true,
            user: {
              id: user.id,
              username: user.username,
              level: user.level
            }
          }
        }
      }

      return { valid: false, error: 'Invalid token' }
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