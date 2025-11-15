import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ReceiptDataSchema } from '@/lib/validation/schemas'
import { z } from 'zod'

function decodeBase64(data: string): string {
  const normalized = data.replace(/-/g, '+').replace(/_/g, '/')
  const buffer = Buffer.from(normalized, 'base64')
  return buffer.toString('utf8')
}

function extractTextFromPayload(payload: any): string {
  if (!payload) return ''

  if (payload.body?.data && (payload.mimeType === 'text/plain' || payload.mimeType === 'text/html')) {
    const text = decodeBase64(payload.body.data)
    return payload.mimeType === 'text/html' ? text.replace(/<[^>]+>/g, ' ') : text
  }

  if (payload.parts && Array.isArray(payload.parts)) {
    // Prefer text/plain, then text/html
    for (const part of payload.parts) {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        return decodeBase64(part.body.data)
      }
    }
    for (const part of payload.parts) {
      if (part.mimeType === 'text/html' && part.body?.data) {
        const html = decodeBase64(part.body.data)
        return html.replace(/<[^>]+>/g, ' ')
      }
    }
    // Recurse into nested parts
    for (const part of payload.parts) {
      const nested = extractTextFromPayload(part)
      if (nested) return nested
    }
  }

  return ''
}

export async function POST(_request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: 'Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.' },
      { status: 500 },
    )
  }

  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const refreshToken = (user.user_metadata as any)?.gmail_refresh_token as string | undefined

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Gmail is not connected. Please connect Gmail first.' },
        { status: 400 },
      )
    }

    // Exchange refresh token for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    })

    if (!tokenResponse.ok) {
      const body = await tokenResponse.text()
      console.error('Failed to refresh Gmail access token:', body)
      return NextResponse.json(
        { error: 'Failed to refresh Gmail access token. Please reconnect Gmail.' },
        { status: 500 },
      )
    }

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token as string | undefined

    if (!accessToken) {
      return NextResponse.json(
        { error: 'No access token returned from Google.' },
        { status: 500 },
      )
    }

    // Search for recent receipt-like emails
    const query = 'subject:(receipt OR order OR \"order confirmation\") newer_than:30d'
    const listResponse = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=10&q=${encodeURIComponent(
        query,
      )}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    )

    if (!listResponse.ok) {
      const body = await listResponse.text()
      console.error('Failed to list Gmail messages:', body)
      return NextResponse.json(
        { error: 'Failed to list Gmail messages.' },
        { status: 500 },
      )
    }

    const listData = await listResponse.json()
    const messages = (listData.messages || []) as Array<{ id: string }>

    if (!messages.length) {
      return NextResponse.json({ success: true, imported: 0 })
    }

    const { extractReceiptData } = await import('@/lib/claude/extract-receipt')

    let importedCount = 0

    for (const message of messages) {
      try {
        const messageResponse = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}?format=full`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        )

        if (!messageResponse.ok) {
          console.warn('Failed to fetch Gmail message:', await messageResponse.text())
          continue
        }

        const messageData = await messageResponse.json()
        const bodyText = extractTextFromPayload(messageData.payload)

        if (!bodyText) {
          console.warn('No text content found for Gmail message', message.id)
          continue
        }

        // Extract and validate receipt data using existing Claude pipeline
        const rawReceiptData = await extractReceiptData(bodyText)

        let receiptData: z.infer<typeof ReceiptDataSchema>
        try {
          receiptData = ReceiptDataSchema.parse(rawReceiptData)
        } catch (error) {
          if (error instanceof z.ZodError) {
            console.warn('Invalid receipt data from Gmail message', message.id, error.flatten())
            continue
          }
          throw error
        }

        // Find or create retailer (mirrors /api/purchases logic)
        const { data: retailers } = await supabase
          .from('retailers')
          .select('*')
          .ilike('name', `%${receiptData.merchant}%`)
          .limit(1)

        let retailer = retailers && retailers.length > 0 ? retailers[0] : null

        if (!retailer) {
          try {
            const { data: newRetailer } = await supabase
              .from('retailers')
              .insert({
                name: receiptData.merchant,
                default_return_days: 30,
                has_price_match: false,
              })
              .select()
              .single()

            retailer = newRetailer
          } catch (error) {
            console.error('Failed to create retailer for Gmail receipt:', error)
          }
        }

        const returnDays = retailer?.default_return_days || 30
        const purchaseDate = new Date(receiptData.date)
        const returnDeadline = new Date(purchaseDate)
        returnDeadline.setDate(returnDeadline.getDate() + returnDays)

        const { error: insertError } = await supabase.from('purchases').insert({
          user_id: user.id,
          ocr_raw_text: bodyText,
          merchant_name: receiptData.merchant,
          retailer_id: retailer?.id,
          purchase_date: receiptData.date,
          total_amount: receiptData.total,
          currency: receiptData.currency,
          items: receiptData.items,
          return_deadline: returnDeadline.toISOString().split('T')[0],
          return_window_days: returnDays,
          claude_analysis: null,
        })

        if (insertError) {
          console.error('Failed to save purchase from Gmail receipt:', insertError)
          continue
        }

        importedCount += 1
      } catch (error) {
        console.error('Error importing Gmail receipt message:', error)
        continue
      }
    }

    return NextResponse.json({ success: true, imported: importedCount })
  } catch (error) {
    console.error('Error importing receipts from Gmail:', error)
    return NextResponse.json(
      {
        error: 'Failed to import receipts from Gmail',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

