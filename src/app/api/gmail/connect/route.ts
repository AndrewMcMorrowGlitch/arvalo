import { NextRequest, NextResponse } from 'next/server'

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

  const origin = request.nextUrl.origin
  const redirectUri = `${origin}/api/gmail/callback`

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

