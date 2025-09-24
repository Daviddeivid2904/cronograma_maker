// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

function serveXml() {
  return {
    name: 'serve-xml',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url) return next()

        if (req.url === '/sitemap.xml' || req.url === '/robots.txt') {
          const filePath = path.resolve(__dirname, 'public' + req.url)
          if (fs.existsSync(filePath)) {
            const isXml = req.url.endsWith('.xml')
            res.setHeader(
              'Content-Type',
              isXml ? 'application/xml; charset=utf-8' : 'text/plain; charset=utf-8'
            )
            res.statusCode = 200
            res.end(fs.readFileSync(filePath))
            return
          }
        }
        next()
      })
    }
  }
}

export default defineConfig({
  plugins: [react(), serveXml()],
  server: { host: true, port: 5173 }
})
