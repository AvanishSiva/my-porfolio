// Shared agent loop — tools, system prompt, and while loop all live in agentLoop.js
// Same logic runs locally (via server.js) and in production (this Edge Function)
import { runAgentLoop } from '../lib/agentLoop.js'

// Tell Vercel: run this on Edge Runtime — required for SSE streaming in production
export const config = { runtime: 'edge' }

// Vercel calls this function on every POST request to /api/agent
export default async function handler(req) {

  // Handle CORS preflight — browser sends this before every cross-origin POST
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

  // Set up the SSE pipe — browser reads from stream.readable, we write to writer
  const encoder = new TextEncoder()
  const stream  = new TransformStream()
  const writer  = stream.writable.getWriter()

  // send() pushes one SSE event down the pipe to the browser immediately
  const send = (event, data) => {
    writer.write(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`))
  }

  // Run the agent in the background without awaiting — so Response opens immediately
  // and events stream as they happen rather than waiting for everything to finish
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
      writer.close() // close the pipe — tells the browser the stream is done
    }
  })()

  // Return the readable end of the pipe as the HTTP response
  return new Response(stream.readable, {
    headers: {
      'Content-Type':                'text/event-stream',
      'Cache-Control':               'no-cache',
      'Access-Control-Allow-Origin': '*',
    },
  })
}
