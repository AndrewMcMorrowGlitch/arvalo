export interface NormalizedRetailer {
  name: string
  domain: string
}

interface RetailerProfile extends NormalizedRetailer {
  keywords: string[]
}

const RETAILER_PROFILES: RetailerProfile[] = [
  { name: 'Amazon', domain: 'amazon.com', keywords: ['amazon', 'amzn'] },
  { name: 'Target', domain: 'target.com', keywords: ['target', 'tgt', 'super target'] },
  { name: 'Walmart', domain: 'walmart.com', keywords: ['walmart', 'wal mart', 'wal-mart', 'wm supercenter', 'wmt'] },
  { name: 'Best Buy', domain: 'bestbuy.com', keywords: ['best buy', 'bestbuy'] },
  { name: 'Home Depot', domain: 'homedepot.com', keywords: ['home depot', 'home-depot', 'homedepot'] },
  { name: 'Lowe’s', domain: 'lowes.com', keywords: ['lowes', 'lowe', 'lowe\'s'] },
  { name: 'Costco', domain: 'costco.com', keywords: ['costco', 'costco whse', 'costco warehouse'] },
  { name: 'Sam’s Club', domain: 'samsclub.com', keywords: ['sam\'s club', 'sams club', 'sam club'] },
  { name: 'Apple', domain: 'apple.com', keywords: ['apple', 'apple store', 'apple.com'] },
  { name: 'Sephora', domain: 'sephora.com', keywords: ['sephora'] },
  { name: 'Nike', domain: 'nike.com', keywords: ['nike'] },
  { name: 'IKEA', domain: 'ikea.com', keywords: ['ikea'] },
  { name: 'Kohl’s', domain: 'kohls.com', keywords: ['kohls', 'kohl\'s'] },
  { name: 'Macy’s', domain: 'macys.com', keywords: ['macys', 'macy\'s'] },
  { name: 'Nordstrom', domain: 'nordstrom.com', keywords: ['nordstrom'] },
  { name: 'CVS Pharmacy', domain: 'cvs.com', keywords: ['cvs', 'cvs pharmacy'] },
  { name: 'Walgreens', domain: 'walgreens.com', keywords: ['walgreens', 'walgreen'] },
  { name: 'HomeGoods', domain: 'homegoods.com', keywords: ['homegoods', 'home goods'] },
  { name: 'TJ Maxx', domain: 'tjmaxx.com', keywords: ['tj maxx', 'tjmaxx'] },
  { name: 'Trader Joe’s', domain: 'traderjoes.com', keywords: ['trader joe', 'trader joe\'s'] },
  { name: 'Whole Foods', domain: 'wholefoods.com', keywords: ['whole foods', 'wholefoods'] },
  { name: 'Urban Outfitters', domain: 'urbanoutfitters.com', keywords: ['urban outfitters', 'urbanoutfitters'] },
  { name: 'Anthropologie', domain: 'anthropologie.com', keywords: ['anthropologie'] },
]

const DOMAIN_LOOKUP = new Map<string, RetailerProfile>()
for (const profile of RETAILER_PROFILES) {
  DOMAIN_LOOKUP.set(profile.domain, profile)
}

function preprocess(input: string) {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

function extractDomain(input: string): string | null {
  const domainMatch = input.match(/([a-z0-9-]+\.(?:com|net|org|co|us))/i)
  if (!domainMatch) return null
  return domainMatch[1].toLowerCase()
}

function humanizeDomain(domain: string) {
  const base = domain.replace(/\.(?:com|net|org|co|us)$/, '')
  return base
    .split(/[-.]/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ')
}

export function normalizeRetailer(raw?: string | null): NormalizedRetailer | null {
  if (!raw) return null

  const trimmed = raw.trim()
  if (!trimmed) return null

  const detectedDomain = extractDomain(trimmed)
  if (detectedDomain) {
    const profile = DOMAIN_LOOKUP.get(detectedDomain)
    if (profile) {
      return { name: profile.name, domain: profile.domain }
    }
    return { name: humanizeDomain(detectedDomain), domain: detectedDomain }
  }

  const normalized = preprocess(trimmed)
  if (!normalized) return null

  for (const profile of RETAILER_PROFILES) {
    if (profile.keywords.some((keyword) => normalized.includes(keyword))) {
      return { name: profile.name, domain: profile.domain }
    }
  }

  return null
}

export function inferRetailerDomain(raw?: string | null): string | undefined {
  return normalizeRetailer(raw)?.domain
}

export function canonicalMerchantName(raw?: string | null): string | undefined {
  return normalizeRetailer(raw || '')?.name || raw || undefined
}
