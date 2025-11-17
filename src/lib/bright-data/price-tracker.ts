import { scrapeProductPrice } from '@/lib/claude/scrape-price'
import { logError } from '@/lib/utils/error-handling'
import { scrape, type BrightDataScrapeResult, type ScrapeOptions } from './scraping-browser'

export interface PriceCheckResult {
  url: string
  current_price: number
  currency: string
  available: boolean
  title: string
  image_url?: string
  timestamp: string
}

export type PriceCheckInput = string | (ScrapeOptions & { retailerDomain?: string })

/**
 * Check product price via Bright Data Scraping Browser with Brave auto-search fallback.
 * Accepts either a direct URL (string) or an options object containing product info.
 */
export async function checkProductPrice(input: PriceCheckInput): Promise<PriceCheckResult> {
  const options: ScrapeOptions =
    typeof input === 'string'
      ? { url: input }
      : {
          ...input,
        }

  try {
    const brightDataResult = await scrape(options)
    return mapBrightDataResult(brightDataResult)
  } catch (error) {
    logError(error, 'checkProductPrice - Bright Data flow')

    if (options.url) {
      console.log('Falling back to Claude HTML scraper for:', options.url)
      return await scrapeProductPrice(options.url)
    }

    throw error
  }
}

function mapBrightDataResult(result: BrightDataScrapeResult): PriceCheckResult {
  if (!result.price.price) {
    throw new Error('Bright Data scrape did not return a numeric price.')
  }

  return {
    url: result.url,
    current_price: result.price.price,
    currency: result.price.currency || 'USD',
    available: true,
    title: result.title || result.productName,
    image_url: undefined,
    timestamp: new Date().toISOString(),
  }
}

/**
 * Estimate Bright Data Scraping Browser cost
 */
export function estimateBrightDataCost(requests: number): number {
  const pricePerRequest = 0.0125
  return requests * pricePerRequest
}
