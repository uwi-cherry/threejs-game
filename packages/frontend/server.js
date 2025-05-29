import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

const server = Bun.serve({
  port: 3000,
  development: true,
  async fetch(req) {
    const url = new URL(req.url)
    
    if (url.pathname === '/') {
      const html = readFileSync(join(import.meta.dir, 'index.html'), 'utf8')
      return new Response(html, {
        headers: { 'Content-Type': 'text/html' }
      })
    }
    
    if (url.pathname.startsWith('/src/')) {
      try {
        const result = await Bun.build({
          entrypoints: [join(import.meta.dir, url.pathname.slice(1))],
          format: 'esm',
          target: 'browser'
        })
        
        if (result.success && result.outputs[0]) {
          const code = await result.outputs[0].text()
          return new Response(code, {
            headers: { 'Content-Type': 'application/javascript' }
          })
        }
      } catch (e) {
        console.error('Build error:', e)
      }
    }
    
    if (url.pathname.endsWith('.css')) {
      try {
        const filePath = join(import.meta.dir, url.pathname.slice(1))
        if (existsSync(filePath)) {
          const file = readFileSync(filePath, 'utf8')
          return new Response(file, {
            headers: { 'Content-Type': 'text/css' }
          })
        }
      } catch (e) {
        console.error('CSS error:', e)
      }
    }
    
    return new Response('Not found', { status: 404 })
  }
})

console.log(`Frontend server running at http://localhost:${server.port}`)