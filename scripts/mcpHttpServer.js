import 'dotenv/config'
import { createServer } from 'http'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js'
import { z } from 'zod'
import { getProfile }     from '../lib/tools/getProfile.js'
import { searchProjects } from '../lib/tools/searchProjects.js'
import { getResume }      from '../lib/tools/getResume.js'
import { getLiveGithub }  from '../lib/tools/getLiveGithub.js'
import { getKnowledge }   from '../lib/knowledge.js'

function buildServer() {
  const server = new McpServer({ name: 'siva-portfolio', version: '1.0.0' })

  server.tool('get_profile', 'Get Siva\'s personal info, experience, education, skills.', {}, async () => ({
    content: [{ type: 'text', text: JSON.stringify(getProfile(), null, 2) }],
  }))

  server.tool('search_projects', 'Search projects by technology or keyword.', {
    query: z.string(),
  }, async ({ query }) => ({
    content: [{ type: 'text', text: JSON.stringify(searchProjects({ query }), null, 2) }],
  }))

  server.tool('get_resume', 'Get resume URL and summary.', {}, async () => ({
    content: [{ type: 'text', text: JSON.stringify(getResume(), null, 2) }],
  }))

  server.tool('get_live_github', 'Fetch live GitHub data for a repo.', {
    repo_name: z.string(),
  }, async ({ repo_name }) => {
    try {
      return { content: [{ type: 'text', text: JSON.stringify(await getLiveGithub({ repo_name }), null, 2) }] }
    } catch (err) {
      return { content: [{ type: 'text', text: `Error: ${err.message}` }], isError: true }
    }
  })

  server.resource('knowledge', 'portfolio://knowledge', {}, async () => ({
    contents: [{ uri: 'portfolio://knowledge', text: JSON.stringify(getKnowledge(), null, 2), mimeType: 'application/json' }],
  }))

  return server
}

const PORT = 3002

createServer(async (req, res) => {
  const CORS = {
    'Access-Control-Allow-Origin':  '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, mcp-session-id',
  }

  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS)
    res.end()
    return
  }

  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  const body = Buffer.concat(chunks).toString()

  const webReq = new Request(`http://localhost:${PORT}${req.url}`, {
    method:  req.method,
    headers: Object.fromEntries(
      Object.entries(req.headers).filter(([, v]) => v !== undefined)
    ),
    body:    ['GET', 'HEAD'].includes(req.method) ? undefined : body,
  })

  const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined })
  const server = buildServer()
  await server.connect(transport)
  const webRes = await transport.handleRequest(webReq)

  const resHeaders = { ...CORS }
  webRes.headers.forEach((v, k) => { resHeaders[k] = v })
  res.writeHead(webRes.status, resHeaders)
  res.end(await webRes.text())
}).listen(PORT, () => {
  console.log(`MCP HTTP test server running at http://localhost:${PORT}`)
  console.log(`Test: curl -X POST http://localhost:${PORT} -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'`)
})
