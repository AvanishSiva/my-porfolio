const BASE = 'https://api.github.com'
const OWNER = process.env.GITHUB_USERNAME || 'AvanishSiva'
const TOKEN = process.env.GITHUB_TOKEN

function ghFetch(path) {
  return fetch(`${BASE}${path}`, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  })
}

export async function getLiveGithub({ repo_name }) {
  const [repoRes, commitsRes] = await Promise.all([
    ghFetch(`/repos/${OWNER}/${repo_name}`),
    ghFetch(`/repos/${OWNER}/${repo_name}/commits?per_page=5`),
  ])

  if (!repoRes.ok) {
    throw new Error(`GitHub repo not found: ${repo_name} (${repoRes.status})`)
  }

  const repo = await repoRes.json()
  const commits = commitsRes.ok ? await commitsRes.json() : []

  return {
    name: repo.name,
    description: repo.description,
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    topics: repo.topics ?? [],
    last_pushed: repo.pushed_at,
    url: repo.html_url,
    recent_commits: commits.map(c => ({
      message: c.commit.message.split('\n')[0],
      date: c.commit.author.date.slice(0, 10),
    })),
  }
}
