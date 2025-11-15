import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  checkProductPrice,
  type PriceCheckResult,
} from '@/lib/bright-data/price-tracker'

const RETAILER_TARGETS = [
  {
    name: 'Amazon',
    domain: 'amazon.com',
    buildUrl: (query: string) => `https://www.amazon.com/s?k=${query}`,
  },
  {
    name: 'Walmart',
    domain: 'walmart.com',
    buildUrl: (query: string) => `https://www.walmart.com/search?q=${query}`,
  },
  {
    name: 'Target',
    domain: 'target.com',
    buildUrl: (query: string) => `https://www.target.com/s?searchTerm=${query}`,
  },
  {
    name: 'Best Buy',
    domain: 'bestbuy.com',
    buildUrl: (query: string) =>
      `https://www.bestbuy.com/site/searchpage.jsp?st=${query}`,
  },
  {
    name: 'Home Depot',
    domain: 'homedepot.com',
    buildUrl: (query: string) =>
      `https://www.homedepot.com/b/N-5yc1v?NCNI-5&search=${query}`,
  },
  {
    name: 'eBay',
    domain: 'ebay.com',
    buildUrl: (query: string) => `https://www.ebay.com/sch/i.html?_nkw=${query}`,
  },
]

const MIN_SAVINGS_DOLLARS = 5
const MIN_SAVINGS_PERCENT = 0.03
const MAX_PURCHASES_TO_SCAN = Number(process.env.CROSS_RETAILER_MAX_PURCHASES || 1)
const MAX_RETAILERS_PER_PURCHASE = Number(process.env.CROSS_RETAILER_MAX_RETAILERS || 2)
const MAX_TOTAL_ATTEMPTS = Number(process.env.CROSS_RETAILER_MAX_ATTEMPTS || 4)
const PRICE_CHECK_TIMEOUT_MS = Number(process.env.CROSS_RETAILER_TIMEOUT_MS || '40000')

function sanitizeQuery(input: string) {
  return input
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function buildQuery(productName: string, merchantName: string) {
  const sanitized = sanitizeQuery(`${productName} ${merchantName}`)
  return encodeURIComponent(sanitized || merchantName)
}

function buildCandidates(productName: string, merchantName: string, retailerName: string) {
  const query = buildQuery(productName, merchantName)
  return RETAILER_TARGETS.filter((target) => {
    const normalizedRetailer = retailerName.toLowerCase()
    return !normalizedRetailer.includes(target.domain.replace('.com', ''))
  })
    .slice(0, MAX_RETAILERS_PER_PURCHASE)
    .map((target) => ({
      retailer: target.name,
      domain: target.domain,
      url: target.buildUrl(query),
    }))
}

function parseOpportunityFromNotification(notification: any) {
  const message: string = notification.message || ''
  const regex = /deal at (.+?): now \$(\d+(?:\.\d+)?) \(you paid \$(\d+(?:\.\d+)?)\)/i
  const match = message.match(regex)
  const urlMatch = message.match(/https?:\/\/\S+/)

  return {
    id: notification.id,
    notification_id: notification.id,
    purchase_id: notification.purchase_id,
    retailer: match?.[1] || 'Better retailer',
    better_price: match ? parseFloat(match[2]) : null,
    original_price: match ? parseFloat(match[3]) : null,
    savings:
      match && match[2] && match[3]
        ? parseFloat(match[3]) - parseFloat(match[2])
        : null,
    url: urlMatch ? urlMatch[0] : null,
    created_at: notification.created_at,
    message,
  }
}

async function fetchTargetPurchases(supabase: any, userId: string, purchaseId?: string) {
  let query = supabase
    .from('purchases')
    .select('id, merchant_name, total_amount, items')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (purchaseId) {
    query = query.eq('id', purchaseId)
  } else {
    query = query.limit(MAX_PURCHASES_TO_SCAN)
  }

  const { data, error } = await query
  if (error) {
    throw error
  }
  return data || []
}

async function recordNotification(
  supabase: any,
  userId: string,
  purchaseId: string,
  retailer: string,
  betterPrice: number,
  originalPrice: number,
  url: string
) {
  const message = `bluddington please return and get better deal at ${retailer}: now $${betterPrice.toFixed(
    2
  )} (you paid $${originalPrice.toFixed(2)}). Link: ${url}`

  const { data: existing } = await supabase
    .from('notifications')
    .select('id, message')
    .eq('user_id', userId)
    .eq('purchase_id', purchaseId)
    .eq('type', 'cross_retailer')
    .order('created_at', { ascending: false })
    .limit(1)

  if (existing && existing.length > 0 && existing[0].message === message) {
    return existing[0]
  }

  const { data, error } = await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      purchase_id: purchaseId,
      // Use price_drop type to satisfy existing constraint while still differentiating via the title
      type: 'price_drop',
      title: `Better price at ${retailer}`,
      message,
      priority: 'high',
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

function qualifies(originalPrice: number, candidatePrice: number) {
  const savings = originalPrice - candidatePrice
  const percent = savings / originalPrice
  return savings >= MIN_SAVINGS_DOLLARS || percent >= MIN_SAVINGS_PERCENT
}

async function checkPriceWithTimeout(url: string): Promise<PriceCheckResult> {
  return Promise.race<PriceCheckResult>([
    checkProductPrice(url),
    new Promise<PriceCheckResult>((_, reject) => {
      setTimeout(
        () =>
          reject(
            new Error(
              `Price check timed out after ${PRICE_CHECK_TIMEOUT_MS / 1000}s`,
            ),
          ),
        PRICE_CHECK_TIMEOUT_MS,
      )
    }),
  ])
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { purchase_id: purchaseId } = await request.json().catch(() => ({}))
  const purchases = await fetchTargetPurchases(supabase, user.id, purchaseId)

  if (!purchases || purchases.length === 0) {
    return NextResponse.json({ opportunities: [], message: 'No purchases to scan yet.' })
  }

  const opportunities: any[] = []
  let attempts = 0
  let consecutiveFailures = 0

  purchaseLoop: for (const purchase of purchases) {
    const firstItemName =
      Array.isArray(purchase.items) && purchase.items.length > 0
        ? purchase.items[0]?.name || purchase.merchant_name
        : purchase.merchant_name

    const candidates = buildCandidates(firstItemName, purchase.merchant_name, purchase.merchant_name)

    let bestDeal: any = null

    for (const candidate of candidates) {
      if (attempts >= MAX_TOTAL_ATTEMPTS) {
        break purchaseLoop
      }
      attempts++

      try {
        const priceResult = await checkPriceWithTimeout(candidate.url)
        const candidatePrice = priceResult.current_price

        if (qualifies(purchase.total_amount, candidatePrice)) {
          if (!bestDeal || candidatePrice < bestDeal.better_price) {
            bestDeal = {
              retailer: candidate.retailer,
              better_price: candidatePrice,
              url: priceResult.url || candidate.url,
              original_price: purchase.total_amount,
            }
            // We found a good deal for this purchase; no need to keep hammering
            break
          }
        }
        consecutiveFailures = 0
      } catch (error) {
        console.error('Cross-retailer price check failed:', {
          purchase_id: purchase.id,
          candidate: candidate.url,
          error,
        })
        consecutiveFailures++
        if (consecutiveFailures >= 2) {
          console.warn('Skipping remaining retailers due to repeated failures.')
          break purchaseLoop
        }
      }
    }

    consecutiveFailures = 0

    if (bestDeal) {
      const notification = await recordNotification(
        supabase,
        user.id,
        purchase.id,
          bestDeal.retailer,
          bestDeal.better_price,
          bestDeal.original_price,
          bestDeal.url
        )

        opportunities.push({
          id: `${purchase.id}-${bestDeal.retailer}`,
          notification_id: notification.id,
          purchase_id: purchase.id,
          retailer: bestDeal.retailer,
          better_price: bestDeal.better_price,
          original_price: bestDeal.original_price,
          savings: bestDeal.original_price - bestDeal.better_price,
          url: bestDeal.url,
          created_at: notification.created_at,
          message: notification.message,
        })
      }
    }

    return NextResponse.json({
      success: true,
      opportunities,
      scanned: purchases.length,
    })
  } catch (error) {
    console.error('Cross-retailer scan failed:', error)
    return NextResponse.json(
      { error: 'Failed to scan for cross-retailer opportunities', details: String(error) },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .ilike('title', 'Better price at%')
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) throw error

    const opportunities = (notifications || [])
      .map(parseOpportunityFromNotification)
      .filter(
        (opp) =>
          opp.better_price !== null &&
          opp.original_price !== null &&
          opp.savings !== null &&
          !!opp.url
      )

    return NextResponse.json({ opportunities })
  } catch (error) {
    console.error('Failed to load cross-retailer opportunities:', error)
    return NextResponse.json(
      { error: 'Failed to load cross-retailer opportunities', details: String(error) },
      { status: 500 }
    )
  }
}
