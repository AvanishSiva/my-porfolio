import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js'
import { z } from 'zod'
import { getProfile }     from '../lib/tools/getProfile.js'
import { searchProjects } from '../lib/tools/searchProjects.js'
import { getResume }      from '../lib/tools/getResume.js'
import { getLiveGithub }  from '../lib/tools/getLiveGithub.js'
import { getKnowledge }   from '../lib/knowledge.js'

export const config = { runtime: 'edge' }

function buildServer() {
  const server = new McpServer({
    name: 'siva-portfolio',
    version: '1.0.0',
  })

  server.tool(
    'get_profile',
    'Get Siva\'s personal info, experience, education, skills, and availability.',
    {},
    async () => ({
      content: [{ type: 'text', text: JSON.stringify(getProfile(), null, 2) }],
    })
  )

  server.tool(
    'search_projects',
    'Search Siva\'s projects by technology or keyword. Returns top matches.',
    { query: z.string().describe('Keywords to search e.g. "Flutter Firebase"') },
    async ({ query }) => ({
      content: [{ type: 'text', text: JSON.stringify(searchProjects({ query }), null, 2) }],
    })
  )

  server.tool(
    'get_resume',
    'Get the URL and summary for Siva\'s resume.',
    {},
    async () => ({
      content: [{ type: 'text', text: JSON.stringify(getResume(), null, 2) }],
    })
  )

  server.tool(
    'get_live_github',
    'Fetch live GitHub data for a specific repo — stars, forks, topics, last 5 commits.',
    { repo_name: z.string().describe('Exact GitHub repo name e.g. "Go-Safe"') },
    async ({ repo_name }) => {
      try {
        const data = await getLiveGithub({ repo_name })
        return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] }
      } catch (err) {
        return { content: [{ type: 'text', text: `Error: ${err.message}` }], isError: true }
      }
    }
  )

  server.resource(
    'knowledge',
    'portfolio://knowledge',
    { description: 'Full knowledge base — repos, profile, and skills.' },
    async () => ({
      contents: [{
        uri: 'portfolio://knowledge',
        text: JSON.stringify(getKnowledge(), null, 2),
        mimeType: 'application/json',
      }],
    })
  )

  server.resource(
    'repos',
    'portfolio://repos',
    { description: 'All GitHub repos with descriptions and READMEs.' },
    async () => ({
      contents: [{
        uri: 'portfolio://repos',
        text: JSON.stringify(getKnowledge().repos, null, 2),
        mimeType: 'application/json',
      }],
    })
  )

  return server
}

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, mcp-session-id',
}

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS })
  }

  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  })

  const server = buildServer()
  await server.connect(transport)

  const response = await transport.handleRequest(req)

  return new Response(response.body, {
    status: response.status,
    headers: { ...Object.fromEntries(response.headers.entries()), ...CORS },
  })
}
