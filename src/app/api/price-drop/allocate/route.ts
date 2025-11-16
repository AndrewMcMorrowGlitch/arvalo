import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { allocateScaledSavings } from '@/lib/locus'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => null)
    const realSavings = Number(body?.realSavings)

    if (!realSavings || realSavings <= 0) {
      return NextResponse.json({ error: 'realSavings must be greater than zero' }, { status: 400 })
    }

    const result = await allocateScaledSavings(user.id, realSavings)

    return NextResponse.json({
      success: true,
      message: 'Savings allocated to Refund Wallet.',
      realSavings: result.realSavings,
      scaledSavings: result.scaledSavings,
      transactionId: result.transactionId,
    })
  } catch (error) {
    console.error('Failed to allocate price drop savings:', error)
    return NextResponse.json(
      { error: 'Failed to allocate savings', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
