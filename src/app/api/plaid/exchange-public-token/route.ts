import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { plaidClient } from '@/lib/plaid'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!process.env.PLAID_CLIENT_ID || !process.env.PLAID_SECRET) {
      return NextResponse.json(
        { error: 'Plaid is not configured. Set PLAID_CLIENT_ID and PLAID_SECRET.' },
        { status: 500 },
      )
    }

    const body = await request.json()
    const publicToken = body.public_token as string | undefined
    const institutionName = body.institution_name as string | undefined

    if (!publicToken) {
      return NextResponse.json({ error: 'Missing public_token' }, { status: 400 })
    }

    const exchangeResponse = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    })

    const accessToken = exchangeResponse.data.access_token
    const itemId = exchangeResponse.data.item_id

    // Store access token for this user.
    // NOTE: In production, you should encrypt this value or store it in a more secure location.
    const { error: upsertError } = await supabase.from('plaid_items').upsert(
      {
        user_id: user.id,
        item_id: itemId,
        access_token: accessToken,
        institution_name: institutionName || null,
      },
      {
        onConflict: 'item_id',
      },
    )

    if (upsertError) {
      console.error('Failed to upsert plaid_items:', upsertError)
      return NextResponse.json(
        { error: 'Failed to save Plaid connection' },
        { status: 500 },
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error exchanging Plaid public token:', error)
    return NextResponse.json(
      {
        error: 'Failed to exchange Plaid public token',
        details: error?.response?.data || error?.message || String(error),
      },
      { status: 500 },
    )
  }
}

