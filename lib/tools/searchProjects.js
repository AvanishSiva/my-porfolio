import { getKnowledge } from '../knowledge.js'

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

export function searchProjects({ query, limit = 5 }) {
  const { repos } = getKnowledge()

  const words = query
    .toLowerCase()
    .split(/\s+/)
    .filter(w => w.length > 2)

  return repos
    .filter(repo => !SKIP.includes(repo.name) && (repo.description || repo.readme))

    .map(repo => {
      const searchableText = [
        repo.name,
        repo.description ?? '',
        repo.readme    ?? '',
      ].join(' ').toLowerCase()

      const score = words.filter(word => searchableText.includes(word)).length

      return { ...repo, score }
    })

    .filter(repo => repo.score > 0)

    .sort((a, b) => b.score - a.score)

    .slice(0, limit)

    .map(({ name, description, topics, url, readme }) => ({
      name,
      description,
      url,
      stack:   topics,
      excerpt: readme?.slice(0, 400),
    }))
}
