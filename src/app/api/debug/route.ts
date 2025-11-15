import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Debug endpoint to check database tables and user settings
 */
export async function GET() {
  try {
    const supabase = await createClient()

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError) {
      return NextResponse.json({
        error: 'Auth error',
        details: authError.message,
      }, { status: 401 })
    }

    if (!user) {
      return NextResponse.json({
        error: 'Not authenticated',
        message: 'Please log in first'
      }, { status: 401 })
    }

    // Check if retailers table exists and has data
    const { data: retailers, error: retailersError } = await supabase
      .from('retailers')
      .select('*')
      .limit(5)

    // Check if user_settings table exists
    const { data: settings, error: settingsError } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single()

    // Try to create settings if they don't exist
    let createdSettings = null
    if (settingsError?.code === 'PGRST116') {
      const forwardEmail = `${user.id.slice(0, 8)}@reclaim.ai`
      const { data: newSettings, error: createError } = await supabase
        .from('user_settings')
        .insert({
          user_id: user.id,
          forward_email: forwardEmail,
        })
        .select()
        .single()

      if (createError) {
        return NextResponse.json({
          error: 'Failed to create user settings',
          details: createError,
          user_id: user.id,
          attempted_email: forwardEmail,
        }, { status: 500 })
      }

      createdSettings = newSettings
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
      },
      tables: {
        retailers: {
          exists: !retailersError,
          count: retailers?.length || 0,
          error: retailersError?.message,
        },
        user_settings: {
          exists: !settingsError || settingsError.code === 'PGRST116',
          found: !!settings,
          created: !!createdSettings,
          data: settings || createdSettings,
          error: settingsError?.message,
        },
      },
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Unexpected error',
      details: error instanceof Error ? error.message : String(error),
    }, { status: 500 })
  }
}

/**
 * POST /api/debug
 * Simple debug helper to seed some recurring purchases for the
 * currently authenticated user so the recurrent purchases calendar
 * has real data to work with.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError) {
      return NextResponse.json(
        {
          error: 'Auth error',
          details: authError.message,
        },
        { status: 401 },
      )
    }

    if (!user) {
      return NextResponse.json(
        {
          error: 'Not authenticated',
          message: 'Please log in first before seeding data.',
        },
        { status: 401 },
      )
    }

    const now = new Date()
    const makeDate = (daysAgo: number) => {
      const d = new Date(now)
      d.setDate(d.getDate() - daysAgo)
      return d.toISOString().split('T')[0]
    }

    // Create a few merchants with obvious recurring patterns
    const seedPurchases = [
      // Weekly groceries (4 purchases over ~4 weeks)
      {
        merchant_name: 'Whole Foods Market',
        purchase_date: makeDate(7),
        total_amount: 85.23,
      },
      {
        merchant_name: 'Whole Foods Market',
        purchase_date: makeDate(21),
        total_amount: 92.5,
      },
      {
        merchant_name: 'Whole Foods Market',
        purchase_date: makeDate(35),
        total_amount: 88.1,
      },
      {
        merchant_name: 'Whole Foods Market',
        purchase_date: makeDate(49),
        total_amount: 95.4,
      },
      // Coffee shop (bi-weekly)
      {
        merchant_name: 'Blue Bottle Coffee',
        purchase_date: makeDate(5),
        total_amount: 14.75,
      },
      {
        merchant_name: 'Blue Bottle Coffee',
        purchase_date: makeDate(19),
        total_amount: 12.1,
      },
      {
        merchant_name: 'Blue Bottle Coffee',
        purchase_date: makeDate(33),
        total_amount: 13.4,
      },
      // Online retailer (monthly-ish)
      {
        merchant_name: 'Amazon',
        purchase_date: makeDate(10),
        total_amount: 42.99,
      },
      {
        merchant_name: 'Amazon',
        purchase_date: makeDate(40),
        total_amount: 61.25,
      },
      {
        merchant_name: 'Amazon',
        purchase_date: makeDate(65),
        total_amount: 38.6,
      },
    ]

    const records = seedPurchases.map((p) => {
      const purchaseDate = new Date(p.purchase_date)
      const returnDeadline = new Date(p.purchase_date)
      returnDeadline.setDate(returnDeadline.getDate() + 30)

      return {
        user_id: user.id,
        merchant_name: p.merchant_name,
        purchase_date: p.purchase_date,
        total_amount: p.total_amount,
        currency: 'USD',
        items: [
          {
            name: `${p.merchant_name} order`,
            price: p.total_amount,
            quantity: 1,
          },
        ],
        return_deadline: returnDeadline.toISOString().split('T')[0],
        return_window_days: 30,
        claude_analysis: null,
        ocr_raw_text: null,
        retailer_id: null,
      }
    })

    const { data, error } = await supabase
      .from('purchases')
      .insert(records)
      .select('id, merchant_name, purchase_date, total_amount')

    if (error) {
      return NextResponse.json(
        {
          error: 'Failed to seed purchases',
          details: error.message,
        },
        { status: 500 },
      )
    }

    return NextResponse.json(
      {
        success: true,
        inserted: data?.length ?? 0,
        purchases: data,
      },
      { status: 200 },
    )
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Unexpected error while seeding purchases',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
