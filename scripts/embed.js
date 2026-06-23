// Run with: node --env-file=.env.local scripts/embed.js
import { readFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'
import { embedTexts } from '../lib/embeddings.js'

const SKIP = [
  'portfolio-data',
  'React-Documentation',
  'github-slideshow',
  'random_generator',
  'top-of-my-head',
  'SajuLoom',
  'zero2-bot',
  'attendence_system',
]

const knowledge = JSON.parse(readFileSync('data/knowledge.json', 'utf8'))
const supabase  = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)

const repos = knowledge.repos.filter(r =>
  !SKIP.includes(r.name) && (r.readme || r.description)
)

// Build embedding text: name + description + first 800 chars of readme
// (readme is the real content; description is often empty)
const texts = repos.map(r => {
  const parts = [r.name]
  if (r.description) parts.push(r.description)
  if (r.topics?.length) parts.push(`Tech: ${r.topics.join(', ')}`)
  if (r.readme) parts.push(r.readme.slice(0, 800))
  return parts.join('. ')
})

console.log(`Embedding ${repos.length} repos…`)
const embeddings = await embedTexts(texts)

const rows = repos.map((r, i) => ({
  name:      r.name,
  data:      r,
  embedding: embeddings[i],
}))

const { error } = await supabase
  .from('projects')
  .upsert(rows, { onConflict: 'name' })

if (error) {
  console.error('Upsert failed:', error)
  process.exit(1)
}

console.log(`✓ Upserted ${rows.length} rows to Supabase`)
rows.forEach(r => console.log(`  • ${r.name}`))
