import { SupabaseClient } from '@supabase/supabase-js'
import { generateRefundEmail } from '@/lib/claude/generate-refund-email'

type PurchaseSnapshot = {
  id: string
  user_id: string
  merchant_name: string
  purchase_date: string
  total_amount: number
  items?: Array<{ name?: string }>
}

type AutoRefundParams = {
  supabase: SupabaseClient
  purchase: PurchaseSnapshot
  currentPrice: number
  trigger: 'instant' | 'cron'
}

async function sendEmailViaResend(to: string | null, subject: string, body: string) {
  const apiKey = process.env.RESEND_API_KEY
  const fromAddress = process.env.RESEND_FROM_EMAIL || 'FairVal <refunds@arvalo.com>'

  if (!apiKey || !to) {
    return { sent: false, reason: 'missing_credentials' as const }
  }

  const htmlBody = body
    .split(/\n/)
    .map(line =>
      line.trim() === '' ? '<br />' : line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    )
    .join('<br />')

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromAddress,
      to,
      subject,
      html: htmlBody,
    }),
  })

  if (!response.ok) {
    const details = await response.text()
    console.error('Failed to send refund email via Resend:', details)
    return { sent: false, reason: 'resend_error' as const }
  }

  return { sent: true as const }
}

export async function autoHandlePriceDropRefund({
  supabase,
  purchase,
  currentPrice,
  trigger,
}: AutoRefundParams) {
  const refundAmount = purchase.total_amount - currentPrice
  if (refundAmount <= 0) {
    return { skipped: 'no_refund' as const }
  }

  // Avoid duplicate pending requests
  const { data: existingRequests } = await supabase
    .from('refund_requests')
    .select('id,email_sent')
    .eq('purchase_id', purchase.id)
    .eq('refund_type', 'price_drop')
    .order('created_at', { ascending: false })
    .limit(1)

  if (existingRequests && existingRequests.length > 0) {
    const existing = existingRequests[0]
    if (!existing.email_sent) {
      return { skipped: 'pending_request' as const }
    }
  }

  // Fetch user info for email personalization/delivery
  let userEmail: string | null = null
  let userName = 'Customer'

  const { data: settings } = await supabase
    .from('user_settings')
    .select('forward_email')
    .eq('user_id', purchase.user_id)
    .single()

  if (settings?.forward_email) {
    userEmail = settings.forward_email
  }

  try {
    const { data: userData } = await supabase.auth.admin.getUserById(purchase.user_id)
    if (userData?.user) {
      userEmail = userData.user.email || userEmail
      const metadataName =
        (userData.user.user_metadata as Record<string, string> | undefined)?.full_name ||
        userData.user.email?.split('@')[0]
      if (metadataName) {
        userName = metadataName
      }
    }
  } catch (error) {
    console.warn('Failed to load auth user for auto refund:', error)
  }

  const generatedEmail = await generateRefundEmail(
    'price_drop',
    {
      merchant: purchase.merchant_name,
      purchaseDate: purchase.purchase_date,
      originalPrice: purchase.total_amount,
      currentPrice,
      items: purchase.items || [],
    },
    {
      name: userName,
      email: userEmail || 'support@arvalo.com',
    }
  )

  const { data: refundRequest, error: refundError } = await supabase
    .from('refund_requests')
    .insert({
      purchase_id: purchase.id,
      user_id: purchase.user_id,
      refund_type: 'price_drop',
      refund_amount: refundAmount,
      reason: `Automatic price drop refund (${trigger})`,
      email_subject: generatedEmail.subject,
      email_body: generatedEmail.body,
      status: 'draft',
    })
    .select()
    .single()

  if (refundError || !refundRequest) {
    console.error('Failed to save auto-generated refund request:', refundError)
    throw refundError || new Error('Failed to save refund request')
  }

  const emailResult = await sendEmailViaResend(userEmail, generatedEmail.subject, generatedEmail.body)

  if (emailResult.sent) {
    await supabase
      .from('refund_requests')
      .update({
        email_sent: true,
        email_sent_at: new Date().toISOString(),
        status: 'sent',
      })
      .eq('id', refundRequest.id)
  }

  await supabase.from('notifications').insert({
    user_id: purchase.user_id,
    purchase_id: purchase.id,
    type: 'refund_update',
    title: emailResult.sent ? 'Refund email sent' : 'Refund email ready',
    message: emailResult.sent
      ? `We emailed ${purchase.merchant_name} about a $${refundAmount.toFixed(2)} price drop refund.`
      : `We drafted a refund email for ${purchase.merchant_name}. You can review it in your dashboard.`,
    priority: 'high',
  })

  return {
    sent: emailResult.sent,
    refund_request_id: refundRequest.id,
  }
}
