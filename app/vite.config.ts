import { defineConfig, type Plugin, type PreviewServer, type ViteDevServer } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const CRAWLER_UA = /Twitterbot|facebookexternalhit|Slackbot|Discordbot|LinkedInBot|WhatsApp/i
const STATIC_EXT = /\.(?:js|css|png|jpe?g|gif|svg|ico|webp|woff2?|ttf|json|map|txt|xml)$/i
const API_BASE = (process.env.API_PUBLIC_URL || 'https://api.thebidboard.lol').replace(/\/$/, '')

function headerValue(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value.join(',') : (value ?? '')
}

function ogCrawlerPlugin(): Plugin {
  const attach = (server: ViteDevServer | PreviewServer) => {
    server.middlewares.use(async (req, res, next) => {
      const method = req.method || 'GET'
      const pathname = (req.url || '/').split('?')[0]
      const ua = headerValue(req.headers['user-agent'])

      if (
        (method !== 'GET' && method !== 'HEAD') ||
        !CRAWLER_UA.test(ua) ||
        STATIC_EXT.test(pathname)
      ) {
        next()
        return
      }

      try {
        const upstream = await fetch(`${API_BASE}/api/og-card.html`, {
          headers: { accept: 'text/html' },
        })
        const html = await upstream.text()
        res.statusCode = upstream.ok ? 200 : upstream.status
        res.setHeader('Content-Type', 'text/html; charset=utf-8')
        res.setHeader('Cache-Control', 'no-store')
        res.end(html)
      } catch {
        next()
      }
    })
  }

  return {
    name: 'og-crawler-html',
    configureServer: attach,
    configurePreviewServer: attach,
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), ogCrawlerPlugin()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: ['thebidboard.lol', 'www.thebidboard.lol'],
  },
  preview: {
    host: '0.0.0.0',
    port: Number(process.env.PORT) || 4173,
    allowedHosts: ['thebidboard.lol', 'www.thebidboard.lol'],
  },
})
