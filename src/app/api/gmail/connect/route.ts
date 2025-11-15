import { NextRequest, NextResponse } from 'next/server'

// Force this route to be evaluated at request time
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID

  if (!clientId) {
    return NextResponse.json(
      {
        error: 'Google OAuth is not configured. Set GOOGLE_CLIENT_ID in your environment.',
      },
      { status: 500 },
    )
  }

  // Prefer explicit production URL, then public app URL, then fallback to request origin
  let redirectUri =
    process.env.GOOGLE_OAUTH_REDIRECT_URI ||
    (process.env.NEXT_PUBLIC_APP_URL
      ? `${process.env.NEXT_PUBLIC_APP_URL}/api/gmail/callback`
      : `${request.nextUrl.origin}/api/gmail/callback`)

  console.log('DEBUG - redirectUri:', redirectUri)
  console.log('DEBUG - GOOGLE_OAUTH_REDIRECT_URI:', process.env.GOOGLE_OAUTH_REDIRECT_URI)
  console.log('DEBUG - NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL)
  console.log('DEBUG - request.nextUrl.origin:', request.nextUrl.origin)

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/gmail.readonly',
    access_type: 'offline',
    prompt: 'consent',
    include_granted_scopes: 'true',
  })

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`

  return NextResponse.redirect(authUrl)
}

