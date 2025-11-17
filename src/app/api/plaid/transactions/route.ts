import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { plaidClient } from '@/lib/plaid'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
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

    const { data: items, error: itemsError } = await supabase
      .from('plaid_items')
      .select('*')
      .eq('user_id', user.id)

    if (itemsError) {
      console.error('Error fetching plaid_items:', itemsError)
      return NextResponse.json(
        { error: 'Failed to fetch Plaid connections' },
        { status: 500 },
      )
    }

    if (!items || items.length === 0) {
      return NextResponse.json({ transactions: [] })
    }

    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - 30)

    const formatDate = (d: Date) => d.toISOString().split('T')[0]

    const allTransactions: any[] = []

    for (const item of items) {
      const accessToken = (item as any).access_token as string
      const institutionName = (item as any).institution_name as string | null

      const response = await plaidClient.transactionsGet({
        access_token: accessToken,
        start_date: formatDate(startDate),
        end_date: formatDate(endDate),
        options: {
          count: 50,
          offset: 0,
        },
      })

      const accountsById = new Map(
        response.data.accounts.map((account) => [account.account_id, account]),
      )

      for (const tx of response.data.transactions) {
        const account = accountsById.get(tx.account_id)
        allTransactions.push({
          id: tx.transaction_id,
          name: tx.name,
          merchant_name: tx.merchant_name,
          amount: tx.amount,
          date: tx.date,
          pending: tx.pending,
          account_id: tx.account_id,
          account_name: account?.name ?? null,
          account_mask: account?.mask ?? null,
          institution_name: institutionName,
          currency: tx.iso_currency_code,
        })
      }
    }

    // Sort newest first
    allTransactions.sort((a, b) => (a.date < b.date ? 1 : -1))

    return NextResponse.json({ transactions: allTransactions })
  } catch (error: any) {
    console.error('Error fetching Plaid transactions:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch Plaid transactions',
        details: error?.response?.data || error?.message || String(error),
      },
      { status: 500 },
    )
  }
}

