export const config = { runtime: 'nodejs' }

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (req.headers['x-admin-secret'] !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { kv } = await import('@vercel/kv')

  const raw = await kv.lrange('query_log', 0, 49)
  const entries = raw.map(item => {
    const { query, toolsUsed, inputTokens, cacheHit } = typeof item === 'string' ? JSON.parse(item) : item
    return { query, toolsUsed, inputTokens, cacheHit }
  })

  const summary = {
    total:      entries.length,
    cacheHits:  entries.filter(e => e.cacheHit).length,
    topTools:   countTools(entries),
    queries:    entries,
  }

  res.setHeader('Content-Type', 'application/json')
  res.status(200).json(summary)
}

function countTools(entries) {
  const counts = {}
  for (const e of entries) {
    for (const tool of e.toolsUsed ?? []) {
      counts[tool] = (counts[tool] ?? 0) + 1
    }
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([tool, count]) => ({ tool, count }))
}
