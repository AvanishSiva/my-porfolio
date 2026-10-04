export const config = { runtime: 'nodejs', maxDuration: 60 }

// /api/agent is fetched same-origin in prod (relative '/api/agent'), but the local
// dev split (CRA on :3000, this server on :3001) genuinely needs CORS. Reflecting
// back only known-good origins keeps that working without leaving the endpoint
// wide open to any external site (which `*` did — free rein on a paid API key).
const ALLOWED_ORIGINS = new Set([
  'http://localhost:3000',
  'https://sivaavanish.dev',
  'https://www.sivaavanish.dev',
])

const MAX_QUERY_LEN           = 2000
const MAX_HISTORY_ENTRIES     = 6
const MAX_HISTORY_CONTENT_LEN = 4000
const MAX_BODY_BYTES          = 50_000
const RATE_LIMIT_MAX          = 12   // requests
const RATE_LIMIT_WINDOW_S     = 60   // per window, per IP

function sanitizeHistory(history) {
  if (!Array.isArray(history)) return []
  return history
    .filter(h => h && (h.role === 'user' || h.role === 'assistant') && typeof h.content === 'string')
    .slice(-MAX_HISTORY_ENTRIES)
    .map(h => ({ role: h.role, content: h.content.slice(0, MAX_HISTORY_CONTENT_LEN) }))
}

async function checkRateLimit(ip) {
  try {
    const { kv } = await import('@vercel/kv')
    const key = `ratelimit:agent:${ip}`
    const count = await kv.incr(key)
    if (count === 1) await kv.expire(key, RATE_LIMIT_WINDOW_S)
    return count <= RATE_LIMIT_MAX
  } catch {
    return true // fail open — a KV hiccup shouldn't take the whole agent down
  }
}

export default async function handler(req, res) {
  const origin = req.headers.origin
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }

  if (req.method !== 'POST') {
    res.writeHead(405)
    res.end('Method not allowed')
    return
  }

  // Read + validate the body BEFORE committing to the SSE response, so bad,
  // oversized, or rate-limited requests still get a normal HTTP status code
  // instead of a 200 stream with an apology event.
  let body = ''
  let tooLarge = false
  await new Promise(resolve => {
    req.on('data', chunk => {
      body += chunk
      if (body.length > MAX_BODY_BYTES) { tooLarge = true; req.destroy(); resolve() }
    })
    req.on('end', resolve)
    req.on('error', resolve)
  })

  if (tooLarge) {
    res.writeHead(413)
    res.end('Payload too large')
    return
  }

  let parsed
  try {
    parsed = JSON.parse(body)
  } catch {
    res.writeHead(400)
    res.end('Invalid JSON')
    return
  }

  const query   = typeof parsed.query === 'string' ? parsed.query.trim().slice(0, MAX_QUERY_LEN) : ''
  const history = sanitizeHistory(parsed.history)

  if (!query) {
    res.writeHead(400)
    res.end('No query provided')
    return
  }

  const ip = (req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress || 'unknown').trim()
  if (!(await checkRateLimit(ip))) {
    res.writeHead(429)
    res.end('Too many requests — please slow down and try again shortly.')
    return
  }

  res.writeHead(200, {
    'Content-Type':  'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection':    'keep-alive',
  })

  const send = (event, data) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
  }

  try {
    const { runAgentLoop } = await import('../lib/agentLoop.js')
    await runAgentLoop(query, history, send)
  } catch (err) {
    console.error('Agent loop error:', err)
    send('done', {
      reply: '',
      component: { component: 'TextResponse', props: { text: 'Something went wrong on my end — please try again in a moment.' } },
      followups: [],
    })
  } finally {
    res.end()
  }
}
