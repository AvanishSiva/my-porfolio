import { VoyageAIClient } from 'voyageai'

const client = new VoyageAIClient({ apiKey: process.env.VOYAGE_API_KEY })
const cache  = new Map()
const CACHE_MAX = 200 // bounded so a long-lived process can't grow this forever

export async function embedTexts(texts) {
  const res = await client.embed({ input: texts, model: 'voyage-3' })
  return res.data.map(d => d.embedding)
}

export async function embedQuery(text) {
  const key = text.trim().toLowerCase()
  if (cache.has(key)) return cache.get(key)
  const [vec] = await embedTexts([text])
  if (cache.size >= CACHE_MAX) cache.delete(cache.keys().next().value) // evict oldest
  cache.set(key, vec)
  return vec
}
