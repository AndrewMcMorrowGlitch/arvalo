import { NextResponse } from 'next/server'

function getRedirectUri() {
  const explicit = process.env.GOOGLE_OAUTH_REDIRECT_URI
  if (explicit) return explicit

  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  if (!appUrl) return null

  const trimmed = appUrl.endsWith('/') ? appUrl.slice(0, -1) : appUrl
  return `${trimmed}/api/gmail/callback`
}

export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const redirectUri = getRedirectUri()

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      {
        error:
          'Google OAuth is not configured. Set GOOGLE_CLIENT_ID and either GOOGLE_OAUTH_REDIRECT_URI or NEXT_PUBLIC_APP_URL.',
      },
      { status: 500 },
    )
  }

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

