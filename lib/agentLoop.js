import Anthropic from '@anthropic-ai/sdk'
import { getProfile }     from './tools/getProfile.js'
import { searchProjects } from './tools/searchProjects.js'
import { notifySiva }     from './tools/notifySiva.js'
import { kv } from '@vercel/kv'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `
You ARE Sivaavanish Kanagasabapathi. Speak in first person always — "I", "my", "I built".
Never refer to yourself in third person.

RULES:
- Always use tools to get accurate information. Never make up facts.
- Call get_profile first when asked about background, experience, or skills.
- Call search_projects when asked about specific technologies or projects.
- Call notify_siva when a recruiter expresses hiring intent.
- After gathering information, respond in this exact format:

REPLY: <1-2 sentences of natural conversational text>
COMPONENT: <one valid JSON object from the list below>
FOLLOWUPS: <JSON array of 2-3 suggested next questions>

AVAILABLE COMPONENTS:
ProjectCard    – one project in detail:   { "component": "ProjectCard",  "props": { "title","description","stack","highlight","url" } }
ProjectList    – multiple projects:       { "component": "ProjectList",  "props": { "intro","projects":[{"name","one_line","stack"}] } }
SkillList      – skills overview:         { "component": "SkillList",    "props": { "intro","skills":[{"name","level","context"}] } }
AboutCard      – who I am:               { "component": "AboutCard",    "props": { "summary","highlights":[] } }
Timeline       – career history:         { "component": "Timeline",     "props": { "entries":[{"period","title","detail"}] } }
ContactCard    – how to reach me:        { "component": "ContactCard",  "props": { "message","email","availability" } }
TextResponse   – fallback:               { "component": "TextResponse", "props": { "text" } }
`

const TOOLS = [
  {
    name: 'get_profile',
    description: 'Get personal info, experience, education, skills, and availability. Call this first for most questions.',
    input_schema: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'search_projects',
    description: 'Search projects by technology or keyword. Returns top matches with descriptions.',
    input_schema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Keywords to search e.g. "Flutter Firebase"' }
      },
      required: ['query'],
    },
  },
  {
    name: 'notify_siva',
    description: 'Send Siva a real-time email when a recruiter wants to connect.',
    input_schema: {
      type: 'object',
      properties: {
        recruiter_name: { type: 'string' },
        company:        { type: 'string' },
        role:           { type: 'string' },
        message:        { type: 'string' },
      },
      required: ['recruiter_name', 'company', 'role'],
    },
  },
]

async function executeTool(name, input) {
  switch (name) {
    case 'get_profile':     return getProfile()
    case 'search_projects': return searchProjects({ query: input.query })
    case 'notify_siva':     return notifySiva(input)
    default: throw new Error(`Unknown tool: ${name}`)
  }
}

function tryParse(str, fallback = null) {
  try { return JSON.parse(str) } catch { return fallback }
}

function parseResponse(text) {
  const reply   = text.match(/REPLY:\s*(.+?)(?=\nCOMPONENT:|\nFOLLOWUPS:|$)/s)?.[1]?.trim() ?? ''
  const compRaw = text.match(/COMPONENT:\s*(\{[\s\S]+?\})\s*(?=\nFOLLOWUPS:|$)/)?.[1]
  const fuRaw   = text.match(/FOLLOWUPS:\s*(\[[\s\S]+?\])/)?.[1]
  return {
    reply,
    component: compRaw ? tryParse(compRaw)   : null,
    followups: fuRaw   ? tryParse(fuRaw, []) : [],
  }
}

export async function runAgentLoop(query, history, send) {
  debugger;
  const messages = [...history, { role: 'user', content: query }]
  let iterations = 0
  toolsUsed = []

  while (iterations < 5) {
    iterations++

    const response = await anthropic.messages.create({
      model:      'claude-sonnet-4-6',
      max_tokens: 4096,
      system: [{
        type:          'text',
        text:          SYSTEM_PROMPT,
        cache_control: { type: 'ephemeral' },
      }],
      tools:    TOOLS,
      messages,
    })

    if (response.stop_reason === 'end_turn') {
      console.log("response: ", response)
      const text = response.content.find(b => b.type === 'text')?.text ?? ''
      send('done', parseResponse(text))
      pushtoHistory(query, history, toolUsed, response.usage.input_tokens, response.usage.cache_creation_input_tokens > 0)
      return
    }

    if (response.stop_reason === 'tool_use') {
      const calls = response.content.filter(b => b.type === 'tool_use')

      for (const call of calls) {
        send('trace', { type: 'tool_call', tool: call.name, input: call.input })
      }

      const toolResults = await Promise.all(calls.map(async call => {
        const start = Date.now()
        try {
          const result = await executeTool(call.name, call.input)
          send('trace', { type: 'tool_result', tool: call.name, ms: Date.now() - start,
            preview: JSON.stringify(result).slice(0, 80) })
            toolsUsed.push(call.name)
          return { type: 'tool_result', tool_use_id: call.id, content: JSON.stringify(result) }
        } catch (err) {
          send('trace', { type: 'tool_error', tool: call.name, error: err.message })
          toolsUsed.push(call.name)
          return { type: 'tool_result', tool_use_id: call.id, is_error: true, content: err.message }
        }
      }))

      messages.push({ role: 'assistant', content: response.content })
      messages.push({ role: 'user',      content: toolResults })
    }
  }
  pushtoHistory(query, history, null, 0, false)
  send('done', {
    reply: 'I ran into a complexity limit. Could you try asking more specifically?',
    component: null,
    followups: [],
  })


}

async function pushtoHistory( query,history, toolUsed, inputTokens, cacheHit) {
  await kv.lpush("query_log", JSON.stringify({ query, history ,toolUsed, inputTokens, cacheHit }))
}
