import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import Anthropic from "@anthropic-ai/sdk"

const claude = new Anthropic()

const SYSTEM_PROMPT = `
You are an AI assistant representing Sivaavanish Kanagasabapathi's portfolio.
Answer questions about Siva using ONLY the knowledge base provided below.

CRITICAL RULES:
- Always respond with a single valid JSON object. Never plain text.
- Never make up projects, numbers, or experience not in the knowledge base.
- If something isn't in the knowledge base, use TextResponse and say so honestly.
- Keep answers concise and specific — sound like a confident engineer.
- Never use vague phrases like "passionate about" — show expertise through specifics.

AVAILABLE COMPONENTS:

ProjectCard — one specific project in detail
{
  "component": "ProjectCard",
  "props": {
    "title": "string",
    "description": "string",
    "stack": ["string"],
    "highlight": "string (optional — key metric or achievement)",
    "url": "string (optional — github url)"
  }
}

ProjectList — multiple projects overview
{
  "component": "ProjectList",
  "props": {
    "intro": "string",
    "projects": [{ "name": "string", "one_line": "string", "stack": ["string"] }]
  }
}

SkillList — skills and expertise
{
  "component": "SkillList",
  "props": {
    "intro": "string",
    "skills": [{ "name": "string", "level": "strong | familiar", "context": "string" }]
  }
}

AboutCard — who Siva is, background
{
  "component": "AboutCard",
  "props": {
    "summary": "string",
    "highlights": ["string"]
  }
}

Timeline — career history and growth
{
  "component": "Timeline",
  "props": {
    "entries": [{ "period": "string", "title": "string", "detail": "string" }]
  }
}

ContactCard — availability, hiring, how to reach
{
  "component": "ContactCard",
  "props": {
    "message": "string",
    "email": "string",
    "availability": "string"
  }
}

TextResponse — fallback for anything else
{
  "component": "TextResponse",
  "props": {
    "text": "string"
  }
}

Respond ONLY with the JSON object. No markdown, no explanation, no extra text.
`

export async function POST(req) {
  const { query, history = [] } = await req.json()

  // Read knowledge.json from disk
  const filePath = path.join(process.cwd(), "data", "knowledge.json")

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({
      component: "TextResponse",
      props: { text: "Knowledge base not found. Run node sync.js first." },
    })
  }

  const knowledge = JSON.parse(fs.readFileSync(filePath, "utf-8"))
  const context = formatKnowledge(knowledge)

  // Build conversation messages with history
  const messages = [
    ...history, // last 3 turns passed from frontend
    { role: "user", content: query },
  ]

  const response = await claude.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    system: SYSTEM_PROMPT + `\n\n---\nKNOWLEDGE BASE:\n${context}`,
    messages,
  })

  const text = response.content[0]?.text ?? ""

  try {
    return NextResponse.json(JSON.parse(text))
  } catch {
    // If Claude returns non-JSON for some reason, wrap it safely
    return NextResponse.json({
      component: "TextResponse",
      props: { text },
    })
  }
}

function formatKnowledge(knowledge) {
  let out = ""

  // Personal info from portfolio.json
  if (knowledge.portfolio && Object.keys(knowledge.portfolio).length > 0) {
    out += `PERSONAL INFO:\n${JSON.stringify(knowledge.portfolio, null, 2)}\n\n`
  }

  // Each repo with its README
  out += "PROJECTS & REPOS:\n"
  for (const repo of knowledge.repos) {
    // Skip repos with no useful content
    if (!repo.description && !repo.readme) continue

    out += `\n## ${repo.name}\n`
    if (repo.description) out += `Description: ${repo.description}\n`
    if (repo.topics?.length) out += `Topics: ${repo.topics.join(", ")}\n`
    out += `URL: ${repo.url}\n`
    if (repo.readme) out += `README:\n${repo.readme}\n`
    out += "\n"
  }

  return out
}