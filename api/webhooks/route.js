import { NextResponse } from "next/server"

const GITHUB_TOKEN = process.env.GITHUB_TOKEN
const GITHUB_USERNAME = process.env.GITHUB_USERNAME
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET

export async function POST(req) {
  const secret = req.headers.get("x-webhook-secret")
  if (secret !== WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const knowledge = await fetchAllREADMEs()
    const { kv } = await import("@vercel/kv")
    await kv.set("knowledge", JSON.stringify(knowledge))

    return NextResponse.json({ synced: knowledge.repos.length })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Sync failed" }, { status: 500 })
  }
}

async function fetchAllREADMEs() {
  const reposRes = await fetch(
    `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=pushed`,
    { headers: { Authorization: `Bearer ${GITHUB_TOKEN}` } }
  )
  const repos = await reposRes.json()

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
        return {
          name:        repo.name,
          description: repo.description ?? "",
          topics:      repo.topics ?? [],
          stars:       repo.stargazers_count,
          url:         repo.html_url,
          readme:      readme.slice(0, 3000),
          updated:     repo.pushed_at,
        }
      } catch {
        return null
      }
    })
  )

  let portfolioData = {}
  try {
    const pfRes = await fetch(
      `https://raw.githubusercontent.com/${GITHUB_USERNAME}/portfolio-data/main/portfolio.json`,
      { headers: { Authorization: `Bearer ${GITHUB_TOKEN}` } }
    )
    if (pfRes.ok) portfolioData = await pfRes.json()
  } catch {}

  return {
    repos:     repoData.filter(Boolean),
    portfolio: portfolioData,
    synced_at: new Date().toISOString(),
  }
}