import Anthropic from '@anthropic-ai/sdk'
import { getProfile }     from './tools/getProfile.js'
import { searchProjects } from './tools/searchProjects.js'
import { notifySiva }     from './tools/notifySiva.js'
import { getResume }      from './tools/getResume.js'
import { getLiveGithub }     from './tools/getLiveGithub.js'
import { personalizedTour }  from './tools/personalizedTour.js'
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
- Call personalized_tour when a recruiter states their role or what they're hiring for.
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
RecruiterCard  – curated recruiter tour:  { "component": "RecruiterCard", "props": { "role","intro","projects":[{"name","one_line","stack","recent_commit","last_active","url"}],"cta" } }
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
    name: 'personalized_tour',
    description: "Build a curated project tour for a recruiter based on their role and interest. Searches projects and fetches live GitHub data. Use when a recruiter states what they're hiring for.",
    input_schema: {
      type: 'object',
      properties: {
        role:     { type: 'string', description: 'The role the recruiter is hiring for e.g. "ML Engineer"' },
        interest: { type: 'string', description: 'Keywords describing what they want to see e.g. "machine learning Python"' },
      },
      required: ['role', 'interest'],
    },
  },
  {
    name: 'get_live_github',
    description: 'Fetch live GitHub data for a specific repo — current stars, forks, topics, and last 5 commits. Use when asked about recent activity or a specific project.',
    input_schema: {
      type: 'object',
      properties: {
        repo_name: { type: 'string', description: 'Exact GitHub repo name e.g. "Go-Safe"' },
      },
      required: ['repo_name'],
    },
  },
  {
    name: 'get_resume',
    description: 'Returns the download URL and summary for my resume. Call this when asked for a CV or resume.',
    input_schema: { type: 'object', properties: {}, required: [] },
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
    case 'get_resume':      return getResume()
    case 'get_live_github':    return getLiveGithub(input)
    case 'personalized_tour':  return personalizedTour(input)
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

async function runToolCalls(calls, send, toolsUsed) {
  for (const call of calls) {
    send('trace', { type: 'tool_call', tool: call.name, input: call.input })
  }
  return Promise.all(calls.map(async call => {
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
}

async function streamSynthesis(messages, send) {
  const LOOKAHEAD = '\nCOMPONENT:'.length 

  let fullText   = ''
  let pendingBuf = ''
  let parseState = 'pre'  // 'pre' | 'streaming' | 'done'

  const stream = anthropic.messages.stream({
    model:      'claude-sonnet-4-6',
    max_tokens: 1024,
    system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
    tools:    TOOLS,
    messages,
  })

  for await (const event of stream) {
    if (event.type !== 'content_block_delta' || event.delta.type !== 'text_delta') continue

    const delta = event.delta.text
    fullText   += delta

    if (parseState === 'done') continue

    pendingBuf += delta

    if (parseState === 'pre') {
      const idx = pendingBuf.indexOf('REPLY:')
      if (idx !== -1) {
        parseState = 'streaming'
        pendingBuf = pendingBuf.slice(idx + 6).replace(/^ /, '')
      }
    }

    if (parseState === 'streaming') {
      const compIdx = pendingBuf.indexOf('\nCOMPONENT:')
      if (compIdx !== -1) {
        // Flush everything before COMPONENT:
        if (compIdx > 0) send('stream', { text: pendingBuf.slice(0, compIdx) })
        parseState = 'done'
        pendingBuf = ''
      } else if (pendingBuf.length > LOOKAHEAD) {
        // Safe to emit everything except the last LOOKAHEAD chars
        send('stream', { text: pendingBuf.slice(0, -LOOKAHEAD) })
        pendingBuf = pendingBuf.slice(-LOOKAHEAD)
      }
    }
  }

  return { fullText, finalMsg: await stream.finalMessage() }
}

export async function runAgentLoop(query, history, send) {
  const messages = [...history, { role: 'user', content: query }]
  let iterations      = 0
  let toolsUsed       = []
  let hasMadeToolCalls = false

  while (iterations < 5) {
    iterations++

    // ── Streaming synthesis (after tool calls) ────────────────────────────
    if (hasMadeToolCalls) {
      const { fullText, finalMsg } = await streamSynthesis(messages, send)

      if (finalMsg.stop_reason === 'end_turn') {
        send('done', parseResponse(fullText))
        pushtoHistory(query, history, toolsUsed, finalMsg.usage.input_tokens,
          finalMsg.usage.cache_creation_input_tokens > 0).catch(() => {})
        return
      }

      if (finalMsg.stop_reason === 'tool_use') {
        const calls = finalMsg.content.filter(b => b.type === 'tool_use')
        const toolResults = await runToolCalls(calls, send, toolsUsed)
        messages.push({ role: 'assistant', content: finalMsg.content })
        messages.push({ role: 'user',      content: toolResults })
      }
      continue
    }

    // ── Non-streaming tool-selection call ─────────────────────────────────
    const response = await anthropic.messages.create({
      model:      'claude-sonnet-4-6',
      max_tokens: 1024,
      system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
      tools:    TOOLS,
      messages,
    })

    if (response.stop_reason === 'end_turn') {
      const text = response.content.find(b => b.type === 'text')?.text ?? ''
      send('done', parseResponse(text))
      pushtoHistory(query, history, toolsUsed, response.usage.input_tokens,
        response.usage.cache_creation_input_tokens > 0).catch(() => {})
      return
    }

    if (response.stop_reason === 'tool_use') {
      hasMadeToolCalls = true
      const calls = response.content.filter(b => b.type === 'tool_use')

      const thinkingText = response.content
        .filter(b => b.type === 'text').map(b => b.text).join(' ').trim()
      if (thinkingText) send('thinking', { text: thinkingText })

      const toolResults = await runToolCalls(calls, send, toolsUsed)
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

async function pushtoHistory(query, history, toolsUsed, inputTokens, cacheHit) {
  await kv.lpush("query_log", JSON.stringify({ query, history, toolsUsed, inputTokens, cacheHit }))
}
