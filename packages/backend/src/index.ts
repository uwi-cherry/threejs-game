import { Elysia } from 'elysia'

const app = new Elysia()
  .get('/', () => 'ソシャゲ API サーバー')
  .get('/api/health', () => ({ status: 'ok', timestamp: new Date().toISOString() }))
  .listen(8000)

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`)