export const config = { runtime: 'nodejs' }

export default async function handler(req) {

  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin':  '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const { query, history = [] } = await req.json()

  if (!query?.trim()) {
    return new Response(JSON.stringify({ error: 'No query' }), { status: 400 })
  }

  const { runAgentLoop } = await import('../lib/agentLoop.js')

  const encoder = new TextEncoder()
  const stream  = new TransformStream()
  const writer  = stream.writable.getWriter()

  const send = (event, data) => {
    writer.write(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`))
  }

  ;(async () => {
    try {
      await runAgentLoop(query, history, send)
    } catch (err) {
      send('done', {
        reply: 'Something went wrong. Try again in a moment.',
        component: { component: 'TextResponse', props: { text: err.message } },
        followups: [],
      })
    } finally {
      writer.close()
    }
  })()

  return new Response(stream.readable, {
    headers: {
      'Content-Type':                'text/event-stream',
      'Cache-Control':               'no-cache',
      'Access-Control-Allow-Origin': '*',
    },
  })
}
