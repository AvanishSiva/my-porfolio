import Anthropic from '@anthropic-ai/sdk'
import { searchProjects } from '../../lib/tools/searchProjects.js'
import { getProfile } from '../../lib/tools/getProfile.js'
import { notifySiva } from '../../lib/tools/notifySiva.js'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const TOOLS = [
  {
    name: 'searchProjects',
    description: 'Search for projects based on keywords.',
    input_schema: { type: 'object', properties: { keywords: { type: 'string' } }, required: ['keywords'] },
  },
  {
    name: 'getProfile',
    description: 'Get the user\'s profile information.',
    input_schema: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'notifySiva',
    description: 'Notify Siva about a new recruiter lead.',
    input_schema: { type: 'object', properties: { recruiter_name: { type: 'string' }, company: { type: 'string' }, role: { type: 'string' }, message: { type: 'string' } }, required: ['recruiter_name', 'company', 'role'] },
  }
]

async function executeTool(name, input) {
  switch (name) {
    case 'searchProjects': return searchProjects(input)
    case 'getProfile': return getProfile()
    case 'notifySiva': return notifySiva(input)
    default: throw new Error(`Unknown tool: ${name}`)
  }
}

async function agent() {
  const messages = [
    { role: 'user', content: 'who are you? Use the tools.' }
  ]

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    tools: TOOLS,
    messages,
  })

  console.log('stop_reason:', response.stop_reason)

  if (response.stop_reason === 'tool_use') {
    const toolUse = response.content.find(b => b.type === 'tool_use')
    console.log('Tool called:', toolUse.name, 'Input:', toolUse.input)

    const result = await executeTool(toolUse.name, toolUse.input)
    console.log('Tool result:', result)

    const final = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      tools: TOOLS,
      messages: [
        ...messages,
        { role: 'assistant', content: response.content },
        { role: 'user', content: [{ type: 'tool_result', tool_use_id: toolUse.id, content: JSON.stringify(result) }] }
      ],
    })

    console.log('\nFinal answer:', final.content[0]?.text)
  } else {
    console.log('Claude did not use a tool:', response.content[0]?.text)
  }
}

agent().catch(console.error)  