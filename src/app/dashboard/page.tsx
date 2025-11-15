import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'

// Disable caching for this page - always fetch fresh data
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user's purchases with price tracking
  const { data: purchases, error: purchasesError } = await supabase
    .from('purchases')
    .select(`
      *,
      retailers (
        name,
        default_return_days
      ),
      price_tracking (
        id,
        current_price,
        original_price,
        price_drop_detected,
        price_drop_amount,
        last_checked,
        tracking_active
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  if (purchasesError) {
    console.error('Error fetching purchases:', purchasesError)
  }

  // Get refund requests data
  const { data: refundRequests, error: refundError } = await supabase
    .from('refund_requests')
    .select('*')
    .eq('user_id', user.id)

  if (refundError) {
    console.error('Error fetching refund requests:', refundError)
  }

  // Get user settings for forwarding email (still created for cron/email flows)
  let { data: settings } = await supabase
    .from('user_settings')
    .select('forward_email')
    .eq('user_id', user.id)
    .single()

  if (!settings) {
    const forwardEmail = `${user.id.slice(0, 8)}@reclaim.ai`
    const { data: newSettings } = await supabase
      .from('user_settings')
      .insert({
        user_id: user.id,
        forward_email: forwardEmail,
      })
      .select()
      .single()
    settings = newSettings
  }

  // Calculate refund metrics
  const realizedSavings =
    refundRequests?.reduce((sum, r) => {
      if (r.status === 'approved' || r.status === 'completed') {
        return sum + (r.refund_amount || 0)
      }
      return sum
    }, 0) || 0

  // Calculate potential savings from price drops
  const potentialSavings =
    purchases?.reduce((sum, p) => {
      if (
        p.price_tracking?.[0]?.price_drop_detected &&
        p.price_tracking?.[0]?.price_drop_amount
      ) {
        return sum + p.price_tracking[0].price_drop_amount
      }
      return sum
    }, 0) || 0

  // Total savings = realized (approved refunds) + potential (price drops)
  const totalSavings = realizedSavings + potentialSavings

  // Count purchases with price drops detected
  const priceDrops =
    purchases?.filter(
      (p) => p.price_tracking?.[0]?.price_drop_detected === true,
    ).length || 0

  // Count items with active price tracking
  const activePurchases =
    purchases?.filter(
      (p) => p.price_tracking?.[0]?.tracking_active === true,
    ).length || 0

  // Returns expiring soon (<= 7 days)
  const expiringSoon =
    purchases?.filter((p) => {
      if (!p.return_deadline) return false
      const deadline = new Date(p.return_deadline)
      const daysUntil = Math.ceil(
        (deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
      )
      return daysUntil <= 7 && daysUntil >= 0
    }).length || 0

  const userFullName =
    (user.user_metadata as any)?.name ||
    (user.user_metadata as any)?.full_name ||
    user.email ||
    ''
  const userFirstName = userFullName.split(' ')[0] || null

  const activeOpportunities = priceDrops + expiringSoon
  const trackedItems = activePurchases

  return (
    <DashboardShell
      userFirstName={userFirstName}
      stats={{
        realizedSavings,
        potentialSavings,
        totalSavings,
        priceDrops,
        trackedItems,
        expiringReturns: expiringSoon,
        activeOpportunities,
      }}
    />
  )
}

