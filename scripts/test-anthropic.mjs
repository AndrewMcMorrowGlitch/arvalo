import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import Anthropic from '@anthropic-ai/sdk'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function loadLocalEnv() {
  const envPath = path.join(__dirname, '..', 'src', 'app', 'process.env')
  if (!fs.existsSync(envPath)) {
    return
  }

  const lines = fs.readFileSync(envPath, 'utf8').split('\n')
  for (const raw of lines) {
    const line = raw.trim()
    if (!line || line.startsWith('#')) continue
    const idx = line.indexOf('=')
    if (idx === -1) continue
    const key = line.slice(0, idx).trim()
    const value = line.slice(idx + 1).trim()
    if (!process.env[key]) {
      process.env[key] = value
    }
  }
}

loadLocalEnv()

const apiKey = process.env.ANTHROPIC_API_KEY

if (!apiKey) {
  console.error('❌ ANTHROPIC_API_KEY is not set. Set it in the environment or src/app/process.env.')
  process.exit(1)
}

const anthropic = new Anthropic({ apiKey })

async function main() {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 64,
      messages: [
        {
          role: 'user',
          content: 'Reply with the single word PONG if you can read this.',
        },
      ],
    })

    const textBlock = response.content.find((block) => block.type === 'text')
    const reply = textBlock?.text?.trim() || '<no text response>'

    console.log('✅ Anthropic request succeeded!')
    console.log(`Model: ${response.model}`)
    console.log(`Reply: ${reply}`)
    if (response.id) {
      console.log(`Response ID: ${response.id}`)
    }
  } catch (error) {
    console.error('❌ Anthropic request failed:')
    if (error?.response) {
      console.error(`Status: ${error.response.status}`)
      try {
        console.error(await error.response.text())
      } catch {
        console.error('<failed to read error body>')
      }
    } else {
      console.error(error)
    }
    process.exit(1)
  }
}

main()
