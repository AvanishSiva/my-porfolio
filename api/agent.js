export const config = { runtime: 'nodejs' }

export default async function handler(req, res) {

  res.setHeader('Access-Control-Allow-Origin', '*')
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

  res.writeHead(200, {
    'Content-Type':  'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection':    'keep-alive',
  })

  const send = (event, data) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
  }

  let body = ''
  req.on('data', chunk => { body += chunk })
  req.on('end', async () => {
    try {
      const { query, history = [] } = JSON.parse(body)

      if (!query?.trim()) {
        send('done', { reply: 'No query provided.', component: { component: 'TextResponse', props: { text: 'No query provided.' } }, followups: [] })
        res.end()
        return
      }

      const { runAgentLoop } = await import('../lib/agentLoop.js')
      await runAgentLoop(query, history, send)
    } catch (err) {
      send('done', {
        reply: 'Something went wrong. Try again in a moment.',
        component: { component: 'TextResponse', props: { text: err.message } },
        followups: [],
      })
    } finally {
      res.end()
    }
  })
}
