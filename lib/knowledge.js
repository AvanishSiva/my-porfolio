import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const KNOWLEDGE = path.join(__dirname, "..", "data", "knowledge.json")

export function getKnowledge() {
  return JSON.parse(fs.readFileSync(KNOWLEDGE, "utf-8"))
}
