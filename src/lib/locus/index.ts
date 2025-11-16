const LOCUS_API_URL = process.env.LOCUS_API_URL || 'https://api.locus-placeholder.com'
const LOCUS_API_KEY = process.env.LOCUS_API_KEY
const LOCUS_MAIN_WALLET_ID = process.env.LOCUS_MAIN_WALLET_ID || 'main-wallet'
const LOCUS_REFUND_WALLET_ID = process.env.LOCUS_REFUND_WALLET_ID || 'refund-wallet'

export type AllocationResult = {
  realSavings: number
  scaledSavings: number
  transactionId?: string
}

export async function allocateScaledSavings(userId: string, realSavings: number): Promise<AllocationResult> {
  const scaledSavings = Number((realSavings / 100).toFixed(2))

  try {
    const response = await fetch(`${LOCUS_API_URL.replace(/\/$/, '')}/send_to_address`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': LOCUS_API_KEY || '',
      },
      body: JSON.stringify({
        address: LOCUS_REFUND_WALLET_ID,
        amount: scaledSavings,
        memo: `Price drop refund for ${userId}`,
        sourceWalletId: LOCUS_MAIN_WALLET_ID,
      }),
    })

    if (!response.ok) {
      const details = await response.text()
      throw new Error(details || 'Locus API request failed')
    }

    const data = await response.json().catch(() => ({}))

    return {
      realSavings,
      scaledSavings,
      transactionId: data.transactionId,
    }
  } catch (error) {
    console.error('Locus allocation failed, falling back to mock transfer:', error)
    return {
      realSavings,
      scaledSavings,
    }
  }
}
