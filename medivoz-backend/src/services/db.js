import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dataDir = join(__dirname, '../data')

const paths = {
  profile: join(dataDir, 'profile.json'),
  chat: join(dataDir, 'chat.json'),
  doctor: join(dataDir, 'doctor.json'),
}

export function readJSON(key) {
  return JSON.parse(readFileSync(paths[key], 'utf-8'))
}

export function writeJSON(key, data) {
  writeFileSync(paths[key], JSON.stringify(data, null, 2))
}
