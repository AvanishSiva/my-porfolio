import 'dotenv/config'
import { personalizedTour } from '../lib/tools/personalizedTour.js'

const role     = process.argv[2] || 'ML Engineer'
const interest = process.argv[3] || 'machine learning Python AI'

console.log(`Role: ${role} | Interest: ${interest}\n`)

try {
  const result = await personalizedTour({ role, interest })
  console.log(JSON.stringify(result, null, 2))
} catch (err) {
  console.error('Error:', err.message)
}
