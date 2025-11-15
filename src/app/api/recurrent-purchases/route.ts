import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('recurrent_purchases')
      .select('*')
      .eq('user_id', user.id)
      .order('next_purchase_date', { ascending: true })

    if (error) {
      console.error('Failed to load recurrent purchases:', error)
      return NextResponse.json(
        { error: 'Failed to load recurrent purchases', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ items: data || [] })
  } catch (error) {
    console.error('Unexpected recurrent purchases error:', error)
    return NextResponse.json(
      { error: 'Failed to load recurrent purchases', details: String(error) },
      { status: 500 }
    )
  }
}
