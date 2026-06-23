import { getKnowledge } from '../knowledge.js'
import { embedQuery }   from '../embeddings.js'
import { vectorSearch } from '../vectorSearch.js'

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

export async function searchProjects({ query, limit = 5 }) {
  try {
    const vec     = await embedQuery(query)
    const results = await vectorSearch(vec, { limit })
    if (results.length > 0) {
      return results.map(r => ({ ...r.data, similarity: r.similarity }))
    }
  } catch (err) {
    console.warn('Vector search failed, falling back to keyword:', err.message)
  }

  // Keyword fallback
  const { repos } = getKnowledge()
  const words = query.toLowerCase().split(/\s+/).filter(w => w.length > 2)

  return repos
    .filter(r => !SKIP.includes(r.name) && (r.description || r.readme))
    .map(r => {
      const text  = `${r.name} ${r.description} ${r.readme ?? ''}`.toLowerCase()
      const score = words.filter(w => text.includes(w)).length
      return { ...r, score }
    })
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ name, description, topics, url, readme }) => ({
      name, description, url,
      stack:   topics,
      excerpt: readme?.slice(0, 400),
    }))
}
