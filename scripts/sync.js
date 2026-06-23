// Run with: node --env-file=.env.local scripts/sync.js
import { readFileSync, writeFileSync } from 'fs'

const GITHUB_TOKEN    = process.env.GITHUB_TOKEN
const GITHUB_USERNAME = process.env.GITHUB_USERNAME ?? 'AvanishSiva'
const README_LIMIT    = 3000

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

const headers = {
  Authorization: `Bearer ${GITHUB_TOKEN}`,
  Accept:        'application/vnd.github+json',
  'User-Agent':  'portfolio-sync',
}

async function gh(path) {
  const res = await fetch(`https://api.github.com${path}`, { headers })
  if (!res.ok) throw new Error(`GitHub ${path} → ${res.status} ${res.statusText}`)
  return res.json()
}

async function fetchReadme(repo) {
  try {
    const data = await gh(`/repos/${GITHUB_USERNAME}/${repo}/readme`)
    const text = Buffer.from(data.content, 'base64').toString('utf8')
    return text.slice(0, README_LIMIT)
  } catch {
    return null
  }
}

console.log(`Fetching repos for ${GITHUB_USERNAME}…`)

const allRepos = []
let page = 1
while (true) {
  const batch = await gh(`/users/${GITHUB_USERNAME}/repos?per_page=100&page=${page}&sort=pushed`)
  if (!batch.length) break
  allRepos.push(...batch)
  if (batch.length < 100) break
  page++
}

const filtered = allRepos.filter(r => !SKIP.includes(r.name) && !r.fork)
console.log(`Found ${allRepos.length} repos → ${filtered.length} after filtering forks + skip list`)

const repos = []
for (const r of filtered) {
  process.stdout.write(`  • ${r.name}… `)
  const readme = await fetchReadme(r.name)
  repos.push({
    name:        r.name,
    description: r.description ?? '',
    topics:      r.topics ?? [],
    stars:       r.stargazers_count,
    url:         r.html_url,
    readme:      readme ?? '',
    updated:     r.pushed_at,
  })
  console.log(readme ? `✓ (${readme.length} chars)` : 'no readme')
}

// Preserve existing portfolio section — only replace repos
const existing   = JSON.parse(readFileSync('data/knowledge.json', 'utf8'))
const updated    = { ...existing, repos }

writeFileSync('data/knowledge.json', JSON.stringify(updated, null, 2))
console.log(`\n✓ knowledge.json updated — ${repos.length} repos written`)
