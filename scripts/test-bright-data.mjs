import puppeteer from 'puppeteer-core'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function loadProcessEnv() {
  const envPath = path.join(__dirname, '..', 'src', 'app', 'process.env')
  if (!fs.existsSync(envPath)) return
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

loadProcessEnv()

const customerId = process.env.BRIGHT_DATA_CUSTOMER_ID
const password = process.env.BRIGHT_DATA_SBR_PASSWORD || process.env.BRIGHT_DATA_SBP_PASSWORD
const zone = process.env.BRIGHT_DATA_ZONE || 'scraping_browser1'

if (!customerId || !password) {
  console.error('❌ Missing BRIGHT_DATA_CUSTOMER_ID or BRIGHT_DATA_SBR_PASSWORD in env or src/app/process.env')
  process.exit(1)
}

const endpoint = `wss://brd-customer-${customerId}-zone-${zone}:${password}@brd.superproxy.io:9222`

async function main() {
  try {
    console.log(`Connecting to ${endpoint.replace(/:(.*)@/, ':****@')}`)
    const browser = await puppeteer.connect({
      browserWSEndpoint: endpoint,
    })
    console.log('✅ Connected! Opening blank page...')
    const page = await browser.newPage()
    await page.goto('https://example.com', { waitUntil: 'domcontentloaded', timeout: 30000 })
    const title = await page.title()
    console.log(`Loaded page title: ${title}`)
    await browser.close()
    console.log('Done.')
  } catch (error) {
    console.error('❌ Bright Data connection failed:')
    console.error(error)
    if (error?.message?.includes('407')) {
      console.error('HTTP 407 = proxy auth/allowlist issue. Ensure your zone allows this IP and the password is correct.')
    }
    process.exit(1)
  }
}

main()
