import 'dotenv/config'
import { getLiveGithub } from '../lib/tools/getLiveGithub.js'

const repo = process.argv[2] || 'Go-Safe'

console.log(`Fetching live GitHub data for: ${repo}\n`)

try {
  const result = await getLiveGithub({ repo_name: repo })
  console.log(JSON.stringify(result, null, 2))
} catch (err) {
  console.error('Error:', err.message)
}
