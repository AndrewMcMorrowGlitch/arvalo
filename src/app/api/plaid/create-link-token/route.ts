import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { plaidClient } from '@/lib/plaid'
import { CountryCode, Products } from 'plaid'

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

    const response = await plaidClient.linkTokenCreate({
      user: {
        client_user_id: user.id,
      },
      client_name: 'Arvalo',
      products: [Products.Transactions],
      language: 'en',
      country_codes: [CountryCode.Us],
    })

    return NextResponse.json({ link_token: response.data.link_token })
  } catch (error: any) {
    console.error('Error creating Plaid link token:', error)
    return NextResponse.json(
      {
        error: 'Failed to create Plaid link token',
        details: error?.response?.data || error?.message || String(error),
      },
      { status: 500 },
    )
  }
}
