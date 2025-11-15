import { scrapeProductPrice } from '@/lib/claude/scrape-price';
import { logError } from '@/lib/utils/error-handling';
import { connectScrapingBrowser, createPage, navigateToUrl } from './scraping-browser';
import { getSelectorsForUrl, trySelectors } from './selectors';

export interface PriceCheckResult {
  url: string;
  current_price: number;
  currency: string;
  available: boolean;
  title: string;
  image_url?: string;
  timestamp: string;
}

/**
 * Check current price for a product URL
 * Uses Bright Data Scraping Browser (agent) with fallback to Claude AI
 */
export async function checkProductPrice(
  productUrl: string
): Promise<PriceCheckResult> {
  console.log('Using Bright Data Scraping Browser for:', productUrl);
  return await scrapeWithBrowser(productUrl);
}

/**
 * Scrape product price using Bright Data Scraping Browser
 */
async function scrapeWithBrowser(productUrl: string): Promise<PriceCheckResult> {
  const browser = await connectScrapingBrowser();
  const page = await createPage(browser);

  try {
    // Navigate to product page
    await navigateToUrl(page, productUrl);
    const resolvedUrl = page.url();

    // Get retailer-specific selectors
    const selectors = getSelectorsForUrl(productUrl);

    // Extract product data using selectors
    const [priceText, title, imageUrl, availabilityText] = await Promise.all([
      trySelectors(page, selectors.price),
      trySelectors(page, selectors.title),
      trySelectors(page, selectors.image, 'src') ||
        page.evaluate(() => {
          const ogImage = document.querySelector('meta[property="og:image"]');
          return ogImage?.getAttribute('content') || null;
        }),
      trySelectors(page, selectors.availability),
    ]);

    console.log('Scraping Browser extracted:', { priceText, title, imageUrl, availabilityText });

    // Parse price
    let price = parsePrice(priceText);

    // If no price found with selectors, try to find it in page text
    if (!price) {
      console.log('Price not found with selectors, searching page text...');

      const pagePriceCandidates = (await page.evaluate(() => {
        const bodyText = document.body.innerText;

        const pricePatterns = [
          /\$\s*(\d{1,5}(?:,\d{3})*(?:\.\d{2})?)/g,
          /(\d{1,5}(?:,\d{3})*(?:\.\d{2})?)\s*(?:USD|dollars?)/gi,
        ];

        const candidates: Array<{ text: string; value: number; context: string }> = [];

        for (const pattern of pricePatterns) {
          const matches = Array.from(bodyText.matchAll(pattern));
          for (const match of matches) {
            const raw = (match[1] || match[0] || '').replace(/,/g, '');
            const value = parseFloat(raw);
            if (!value || value <= 0 || value > 100000) continue;

            const idx = (match as any).index ?? 0;
            const start = Math.max(0, idx - 40);
            const end = Math.min(bodyText.length, idx + (match[0]?.length || 0) + 40);
            const context = bodyText.slice(start, end);

            candidates.push({
              text: match[0],
              value,
              context,
            });
          }
        }

        return candidates;
      })) as Array<{ text: string; value: number; context: string }>;

      console.log('Found price candidates in page text:', pagePriceCandidates);

      if (pagePriceCandidates.length > 0) {
        const filtered = pagePriceCandidates.filter((candidate) =>
          !containsInstallmentLanguage(`${candidate.text || ''} ${candidate.context || ''}`)
        );

        const sorted = (filtered.length > 0 ? filtered : pagePriceCandidates).sort(
          (a, b) => b.value - a.value
        );

        if (sorted.length > 0) {
          console.log('Selected price candidate from text:', sorted[0]);
          price = sorted[0].value;
        }
      }
    }

    if (!price) {
      console.error('Failed to parse price from text:', priceText);
      const pageContent = await page.evaluate(() => document.body.innerText.substring(0, 500));
      console.log('Page content preview:', pageContent);
      throw new Error(`Could not extract price from page. Price text found: "${priceText}"`);
    }

    // Check availability
    const available = checkAvailability(availabilityText);

    return {
      url: resolvedUrl || productUrl,
      current_price: price,
      currency: 'USD', // TODO: Add currency detection
      available,
      title: title || 'Unknown Product',
      image_url: imageUrl || undefined,
      timestamp: new Date().toISOString(),
    };
  } finally {
    await page.close();
  }
}

/**
 * Parse price from text (handles $49.99, 49.99, etc.)
 */
const INSTALLMENT_KEYWORDS = [
  'per month',
  '/month',
  '/mo',
  'monthly',
  'mo.',
  'per mo',
  'per week',
  '/week',
  '/wk',
  'bi-week',
  'biweek',
  'biweekly',
  'apr',
  'installment',
  'financ',
  'per day',
  '/day',
  'mo ',
];

function containsInstallmentLanguage(text: string) {
  const normalized = text.toLowerCase();
  return INSTALLMENT_KEYWORDS.some((keyword) => normalized.includes(keyword));
}

function parsePrice(priceText: string | null): number | null {
  if (!priceText) return null;
  if (containsInstallmentLanguage(priceText)) {
    return null;
  }

  // Remove currency symbols, commas, and whitespace
  const cleaned = priceText.replace(/[$,\s]/g, '');

  // Extract first number (handles cases like "$49.99 - $59.99")
  const match = cleaned.match(/(\d+\.?\d*)/);
  if (!match) return null;

  const price = parseFloat(match[1]);
  return isNaN(price) ? null : price;
}

/**
 * Check if product is available based on availability text
 */
function checkAvailability(availabilityText: string | null): boolean {
  if (!availabilityText) return true; // Assume available if no info

  const unavailableKeywords = [
    'out of stock',
    'unavailable',
    'sold out',
    'not available',
    'discontinued',
  ];

  const lowerText = availabilityText.toLowerCase();
  return !unavailableKeywords.some((keyword) => lowerText.includes(keyword));
}

/**
 * Estimate Bright Data Scraping Browser cost
 */
export function estimateBrightDataCost(requests: number): number {
  // Scraping Browser pricing: ~$0.01-0.015 per page view
  const pricePerRequest = 0.0125; // Average $0.0125 per request
  return requests * pricePerRequest;
}
