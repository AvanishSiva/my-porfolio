// sync.js — run this manually whenever you want to update your knowledge base
// Usage: node sync.js
// Then commit the updated data/knowledge.json and push to redeploy

import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const GITHUB_TOKEN    = process.env.GITHUB_TOKEN
const GITHUB_USERNAME = process.env.GITHUB_USERNAME || "AvanishSiva"

if (!GITHUB_TOKEN) {
  console.error("❌  Missing GITHUB_TOKEN — add it to your .env.local or export it in your terminal")
  console.error("    export GITHUB_TOKEN=ghp_your_token_here")
  process.exit(1)
}

async function fetchAllREADMEs() {
  console.log(`\n🐙  Fetching repos for ${GITHUB_USERNAME}...`)

  // 1. Get all public repos
  const reposRes = await fetch(
    `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=pushed`,
    { headers: { Authorization: `Bearer ${GITHUB_TOKEN}` } }
  )

  if (!reposRes.ok) {
    throw new Error(`GitHub API error: ${reposRes.status} ${reposRes.statusText}`)
  }

  const repos = await reposRes.json()
  console.log(`✅  Found ${repos.length} repos`)

  // 2. Fetch README for each repo in parallel
  console.log("📄  Fetching READMEs...")

  const repoData = await Promise.all(
    repos.map(async (repo) => {
      try {
        const readmeRes = await fetch(
          `https://api.github.com/repos/${GITHUB_USERNAME}/${repo.name}/readme`,
          {
            headers: {
              Authorization: `Bearer ${GITHUB_TOKEN}`,
              Accept: "application/vnd.github.raw",
            },
          }
        )

        const readme = readmeRes.ok ? await readmeRes.text() : ""

        if (readme) {
          console.log(`   ✓ ${repo.name}`)
        } else {
          console.log(`   – ${repo.name} (no README)`)
        }

        return {
          name:        repo.name,
          description: repo.description ?? "",
          topics:      repo.topics ?? [],
          stars:       repo.stargazers_count,
          url:         repo.html_url,
          readme:      readme.slice(0, 3000), // cap at 3k chars per repo
          updated:     repo.pushed_at,
        }
      } catch {
        console.log(`   ✗ ${repo.name} (failed)`)
        return null
      }
    })
  )

  // 3. Fetch your portfolio.json
  console.log("\n📋  Fetching portfolio.json...")

  let portfolioData = {}
  try {
    const pfRes = await fetch(
      `https://raw.githubusercontent.com/${GITHUB_USERNAME}/portfolio-data/main/portfolio.json`,
      { headers: { Authorization: `Bearer ${GITHUB_TOKEN}` } }
    )
    if (pfRes.ok) {
      portfolioData = await pfRes.json()
      console.log("✅  portfolio.json loaded")
    } else {
      console.log("⚠️   portfolio.json not found — skipping (add it to a portfolio-data repo)")
    }
  } catch {
    console.log("⚠️   Could not fetch portfolio.json — skipping")
  }

  return {
    repos:     repoData.filter(Boolean),
    portfolio: portfolioData,
    synced_at: new Date().toISOString(),
  }
}

async function main() {
  try {
    const knowledge = await fetchAllREADMEs()

    // Save to data/knowledge.json
    const outputDir  = path.join(__dirname, "data")
    const outputFile = path.join(outputDir, "knowledge.json")

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    fs.writeFileSync(outputFile, JSON.stringify(knowledge, null, 2))

    console.log(`\n🎉  Done! Synced ${knowledge.repos.length} repos`)
    console.log(`📁  Saved to data/knowledge.json`)
    console.log(`\nNext steps:`)
    console.log(`   git add data/knowledge.json`)
    console.log(`   git commit -m "sync knowledge base"`)
    console.log(`   git push`)
  } catch (err) {
    console.error("\n❌  Sync failed:", err.message)
    process.exit(1)
  }
}

main()