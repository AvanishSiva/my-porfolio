import { VoyageAIClient } from 'voyageai'

const client = new VoyageAIClient({ apiKey: process.env.VOYAGE_API_KEY })
const cache  = new Map()

export async function embedTexts(texts) {
  const res = await client.embed({ input: texts, model: 'voyage-3' })
  return res.data.map(d => d.embedding)
}

export async function embedQuery(text) {
  const key = text.trim().toLowerCase()
  if (cache.has(key)) return cache.get(key)
  const [vec] = await embedTexts([text])
  cache.set(key, vec)
  return vec
}
