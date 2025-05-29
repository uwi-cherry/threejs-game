import { Elysia } from 'elysia'

const isDev = process.env.NODE_ENV !== 'production'

const app = new Elysia()
  .get('/', () => ({ message: 'Game API Server', env: isDev ? 'development' : 'production' }))
  .get('/api/health', () => ({ status: 'ok', timestamp: new Date().toISOString() }))
  
  // Authentication endpoints
  .post('/auth/login', ({ body }) => {
    if (isDev) {
      // Mock response for development
      return {
        success: true,
        user: {
          id: 'mock_user_123',
          username: body?.username || 'TestPlayer',
          level: 1,
          createdAt: new Date().toISOString()
        },
        token: 'mock_jwt_token_12345'
      }
    }
    // In production, call actual BaaS
    return { error: 'BaaS integration not implemented' }
  })
  
  
  .get('/auth/verify', ({ headers }) => {
    if (isDev) {
      const token = headers.authorization?.replace('Bearer ', '')
      if (token) {
        return {
          valid: true,
          user: {
            id: 'mock_user_123',
            username: 'TestPlayer',
            level: 1
          }
        }
      }
      return { valid: false }
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