import { request as httpsRequest } from 'node:https'
import puppeteer from 'puppeteer-core'
import type { Page } from 'puppeteer-core'
import { Anthropic } from '@anthropic-ai/sdk'

const {
  BRIGHT_DATA_CUSTOMER_ID,
  BRIGHT_DATA_SBR_PASSWORD,
  BRIGHT_DATA_ZONE = 'scraping_browser1',
  BRIGHT_DATA_WS_URL,
  TARGET_URL = '',
  PRODUCT_NAME = 'Apple iPhone 17 Pro 512GB Silver',
  BRAVE_API_KEY,
  PREFERRED_RETAILER_DOMAIN = 'apple.com',
  ANTHROPIC_API_KEY,
} = process.env

const anthropicClient = ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: ANTHROPIC_API_KEY })
  : null

export interface ScrapeOptions {
  url?: string
  productName?: string
  retailerDomain?: string
  braveApiKey?: string
}

export interface PriceExtraction {
  price: number | null
  currency: string | null
  confidence: number | null
}

export interface BrightDataScrapeResult {
  url: string
  title: string
  productName: string
  retailerDomain: string
  price: PriceExtraction
}

function buildWsUrl(customer?: string | null, password?: string | null, zone?: string | null) {
  if (!customer || !password) return null
  const zoneName = zone || 'scraping_browser1'
  return `wss://brd-customer-${customer}-zone-${zoneName}:${password}@brd.superproxy.io:9222`
}

function getBrowserEndpoint() {
  return BRIGHT_DATA_WS_URL || buildWsUrl(BRIGHT_DATA_CUSTOMER_ID, BRIGHT_DATA_SBR_PASSWORD, BRIGHT_DATA_ZONE)
}

function resolveRetailerDomain(input?: string | null) {
  if (!input) return PREFERRED_RETAILER_DOMAIN
  try {
    const hostname = new URL(input).hostname.replace(/^www\./, '')
    return hostname || PREFERRED_RETAILER_DOMAIN
  } catch {
    return input.replace(/^www\./, '').toLowerCase()
  }
}

export async function scrape(options: ScrapeOptions = {}): Promise<BrightDataScrapeResult> {
  const endpoint = getBrowserEndpoint()
  if (!endpoint) {
    throw new Error(
      'Provide Bright Data credentials via BRIGHT_DATA_CUSTOMER_ID, BRIGHT_DATA_SBR_PASSWORD, BRIGHT_DATA_ZONE, or BRIGHT_DATA_WS_URL.',
    )
  }

  const resolvedProductName = options.productName?.trim() || PRODUCT_NAME
  const resolvedRetailerDomain = options.retailerDomain?.trim().toLowerCase() || PREFERRED_RETAILER_DOMAIN
  const braveKey = options.braveApiKey || BRAVE_API_KEY

  let targetUrl = options.url || TARGET_URL

  if (!targetUrl) {
    if (!braveKey) {
      throw new Error('Set BRAVE_API_KEY to search for product URLs automatically.')
    }
    console.log(`Searching Brave for "${resolvedProductName}" with retailer ${resolvedRetailerDomain}...`)
    targetUrl = await searchProduct(resolvedProductName, {
      braveApiKey: braveKey,
      retailerDomain: resolvedRetailerDomain,
    })
    if (!targetUrl) {
      throw new Error('No matching product URL found from Brave search.')
    }
  }

  console.log('Connecting to Bright Data Scraping Browser...')
  const browser = await puppeteer.connect({ browserWSEndpoint: endpoint })

  try {
    console.log(`Navigating to ${targetUrl}...`)
    const page = await browser.newPage()

    try {
      const client = await page.createCDPSession()
      const frameTree = (await client.send('Page.getFrameTree')) as {
        frameTree?: { frame?: { id?: string } }
      }
      const frameId = frameTree?.frameTree?.frame?.id
      if (frameId) {
        const inspectResult = await (client as any).send('Page.inspect', { frameId })
        const inspectUrl = inspectResult?.url as string | undefined
        if (inspectUrl) {
          console.log(`Inspect session: ${inspectUrl}`)
        }
      }
    } catch (sessionError: any) {
      console.warn('CDP inspection failed:', sessionError?.message || sessionError)
    }

    await page.goto(targetUrl, { timeout: 120_000 })
    await page.setJavaScriptEnabled(true)
    await page.waitForNetworkIdle({ timeout: 5_000 }).catch(() => {})
    await page
      .waitForSelector(
        '[data-testid="customer-price"], [data-testid="pricing-price"], [data-automation="product-price"]',
        { timeout: 8_000 },
      )
      .catch(() => {})

    const pageTextOnly = await page.evaluate(() => document.body?.innerText || '')
    const shadowText = await getShadowText(page)
    const combinedPageText = `Page Text:\n${pageTextOnly}\n\nShadow DOM Text:\n${shadowText}`

    const domainFromUrl = (() => {
      try {
        return resolveRetailerDomain(targetUrl!)
      } catch {
        return resolvedRetailerDomain || 'unknown'
      }
    })()

    const llmPrice = await extractPriceLLM(resolvedProductName, domainFromUrl, combinedPageText)
    const pageTitle = (await page.title().catch(() => null)) || resolvedProductName

    if (!llmPrice.price) {
      throw new Error('Claude could not extract a confident price from the page.')
    }

    return {
      url: targetUrl!,
      title: pageTitle,
      productName: resolvedProductName,
      retailerDomain: domainFromUrl,
      price: llmPrice,
    }
  } finally {
    await browser.close()
  }
}

async function getShadowText(page: Page) {
  return page.evaluate(() => {
    function extract(node: Node | null): string {
      if (!node) return ''

      const maybeElement = node as Element & { shadowRoot?: ShadowRoot | null }
      const shadow = maybeElement.shadowRoot ? extract(maybeElement.shadowRoot as unknown as Node) : ''
      const childText = Array.from(node.childNodes)
        .map(child => (child.nodeType === 3 ? child.textContent || '' : extract(child)))
        .join(' ')
      return `${shadow}${childText}`
    }

    return extract(document.body)
  })
}

export async function extractPriceLLM(productName: string, retailerDomain: string, pageText: string) {
  if (!anthropicClient) {
    throw new Error('Set ANTHROPIC_API_KEY to enable LLM price extraction.')
  }

  const maxContext = 15000
  const truncatedPageText = pageText.length > maxContext ? pageText.slice(0, maxContext) : pageText

  const response = await anthropicClient.messages.create({
    model: 'claude-3-haiku-20240307',
    temperature: 0,
    max_tokens: 200,
    system:
      'You are a strict JSON engine. You MUST output ONLY valid JSON with this shape:\n' +
      '{ "price": number|null, "currency": string|null, "confidence": number }\n' +
      'No text before or after. No explanations. No code fences. No commentary. If uncertain, set price to null and confidence to 0. Only output JSON.',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: [
              'Return ONLY a JSON object. Do not include any text outside the JSON.',
              'Extract the price ONLY for the exact product variant described in the product name.',
              'Ignore prices for other shades, materials, capacities, refreshed/refurbished/used devices, bundles, or alternative sellers.',
              'Only accept a price if the attributes (color, storage, condition, model) match the provided product name.',
              'If multiple variants appear, select the price physically closest to the relevant variant or clearly labeled for the requested configuration.',
              'If the correct variant price is missing, return price null, currency null, and confidence 0.',
              `Product name: ${productName}`,
              `Retailer domain: ${retailerDomain}`,
              'Page data:',
              truncatedPageText,
            ].join('\n'),
          },
        ],
      },
    ],
  })

  const textBlocks = response.content.map(block => (block.type === 'text' ? block.text : '')).join('\n').trim()
  const jsonPayload = textBlocks.trim()

  let parsed: { price?: number; currency?: string; confidence?: number }
  try {
    parsed = JSON.parse(jsonPayload) as { price?: number; currency?: string; confidence?: number }
  } catch {
    throw new Error(`Claude returned invalid JSON: ${jsonPayload}`)
  }

  if (!parsed) {
    throw new Error('Claude returned an empty response.')
  }

  return {
    price: typeof parsed.price === 'number' ? parsed.price : null,
    currency: typeof parsed.currency === 'string' ? parsed.currency : null,
    confidence: typeof parsed.confidence === 'number' ? parsed.confidence : null,
  }
}

function getErrorDetails(error: any) {
  if (error?.target?._req?.res) {
    const { statusCode, statusMessage } = error.target._req.res
    return `Unexpected Server Status ${statusCode}: ${statusMessage}`
  }
}

interface BraveSearchOptions {
  braveApiKey?: string
  retailerDomain?: string
}

export async function braveRequest(query: string, apiKey?: string) {
  const params = new URLSearchParams({
    q: query,
    count: '10',
    search_lang: 'en',
  })

  const headers: Record<string, string> = {
    Accept: 'application/json',
    'User-Agent': 'PriceTracker/1.0',
  }

  if (apiKey) {
    headers['X-Subscription-Token'] = apiKey
  }

  const url = `https://api.search.brave.com/res/v1/web/search?${params.toString()}`

  return new Promise<Record<string, any>>((resolve, reject) => {
    const req = httpsRequest(
      url,
      {
        method: 'GET',
        headers,
      },
      res => {
        let body = ''
        res.setEncoding('utf8')
        res.on('data', chunk => {
          body += chunk
        })
        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 400) {
            reject(new Error(`Brave API error ${res.statusCode}: ${body}`))
            return
          }

          try {
            resolve(JSON.parse(body))
          } catch (error) {
            reject(error)
          }
        })
      },
    )

    req.on('error', reject)
    req.end()
  })
}

export async function searchProduct(query: string, options: BraveSearchOptions = {}) {
  const apiKey = options.braveApiKey || BRAVE_API_KEY
  if (!apiKey) {
    throw new Error('Set BRAVE_API_KEY to use Brave product search.')
  }

  const response = await braveRequest(query, apiKey)
  const results = response?.web?.results || []
  const desiredDomain = options.retailerDomain?.toLowerCase()

  if (desiredDomain) {
    for (const result of results) {
      if (!result?.url) continue
      try {
        const hostname = new URL(result.url).hostname.replace(/^www\./, '').toLowerCase()
        if (hostname.includes(desiredDomain)) {
          return result.url as string
        }
      } catch {
        continue
      }
    }
  }

  return results[0]?.url || null
}

if (typeof require !== 'undefined' && require.main === module) {
  scrape().catch(error => {
    console.error(getErrorDetails(error) || error.stack || error.message || error)
    process.exit(1)
  })
}
