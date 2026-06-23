import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

export async function vectorSearch(queryEmbedding, { threshold = 0.18, limit = 5 } = {}) {
  const { data, error } = await supabase.rpc('search_projects', {
    query_embedding: queryEmbedding,
    match_threshold: threshold,
    match_count:     limit,
  })
  if (error) throw new Error(`Supabase RPC error: ${error.message}`)
  return data
}
