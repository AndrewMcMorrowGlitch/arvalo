import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function POST(_request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = user.id

    // Best-effort cleanup of user-owned data in a safe order
    await supabase.from('gift_card_transactions').delete().eq('user_id', userId)
    await supabase.from('price_tracking').delete().eq('user_id', userId)
    await supabase.from('recurrent_purchases').delete().eq('user_id', userId)
    await supabase.from('notifications').delete().eq('user_id', userId)
    await supabase.from('purchases').delete().eq('user_id', userId)
    await supabase.from('gift_cards').delete().eq('user_id', userId)
    await supabase.from('user_settings').delete().eq('user_id', userId)

    // Clear Gmail refresh token from user metadata (if present)
    try {
      await supabase.auth.updateUser({
        data: {
          gmail_refresh_token: null,
        },
      })
    } catch (metadataError) {
      console.error('Failed to clear Gmail metadata:', metadataError)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to clear account data:', error)
    return NextResponse.json(
      { error: 'Failed to clear account data', details: String(error) },
      { status: 500 },
    )
  }
}

