import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const KNOWLEDGE = path.join(__dirname, "..", "data", "knowledge.json")

// knowledge.json only changes on deploy, so read + parse it once per process
// instead of on every tool call.
let cached = null

export function getKnowledge() {
  if (!cached) cached = JSON.parse(fs.readFileSync(KNOWLEDGE, "utf-8"))
  return cached
}
