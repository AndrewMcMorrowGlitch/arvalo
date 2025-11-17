import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Force this route to be evaluated at request time
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  // Get the base URL for redirects - prefer production URL over request origin
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin

  const code = request.nextUrl.searchParams.get('code')
  const error = request.nextUrl.searchParams.get('error')

  if (error) {
    console.error('Google OAuth error:', error)
    return NextResponse.redirect(new URL('/dashboard?gmail=error', baseUrl))
  }

  if (!code) {
    return NextResponse.json({ error: 'Missing authorization code' }, { status: 400 })
  }

  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      {
        error:
          'Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your environment.',
      },
      { status: 500 },
    )
  }

  // Must exactly match the redirect URI used in /api/gmail/connect
  const redirectUri =
    process.env.GOOGLE_OAUTH_REDIRECT_URI ||
    (process.env.NEXT_PUBLIC_APP_URL
      ? `${process.env.NEXT_PUBLIC_APP_URL}/api/gmail/callback`
      : `${request.nextUrl.origin}/api/gmail/callback`)

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    })

    if (!tokenResponse.ok) {
      const body = await tokenResponse.text()
      console.error('Failed to exchange Google code for tokens:', body)
      return NextResponse.redirect(new URL('/dashboard?gmail=error', baseUrl))
    }

    const tokens = await tokenResponse.json()
    const refreshToken = tokens.refresh_token as string | undefined

    if (!refreshToken) {
      console.warn('No refresh token returned from Google OAuth')
      return NextResponse.redirect(new URL('/dashboard?gmail=connected', baseUrl))
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.redirect(new URL('/login', baseUrl))
    }

    // Store refresh token in user metadata
    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        gmail_refresh_token: refreshToken,
      },
    })

    if (updateError) {
      console.error('Failed to store Gmail refresh token:', updateError)
    }

    return NextResponse.redirect(new URL('/dashboard?gmail=connected', baseUrl))
  } catch (err) {
    console.error('Error handling Google OAuth callback:', err)
    return NextResponse.redirect(new URL('/dashboard?gmail=error', baseUrl))
  }
}

