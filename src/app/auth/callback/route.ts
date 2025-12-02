import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/contacts'

  console.log('[Auth Callback] Received request:', {
    url: request.url,
    code: code ? `${code.substring(0, 20)}...` : 'MISSING',
    error,
    errorDescription,
    next,
    allParams: Array.from(searchParams.entries())
  })

  // Check if OAuth provider returned an error
  if (error) {
    console.error('[Auth Callback] OAuth provider error:', error, errorDescription)
    return NextResponse.redirect(`${origin}/auth/auth-code-error?error=${error}`)
  }

  if (code) {
    const supabase = await createClient()
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      console.error('[Auth Callback] Exchange error:', {
        message: exchangeError.message,
        status: exchangeError.status,
        name: exchangeError.name
      })
    } else {
      console.log('[Auth Callback] Session exchanged successfully. User:', data.session?.user?.id)
    }

    if (!exchangeError) {
      const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === 'development'
      let redirectUrl = ''
      if (isLocalEnv) {
        // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
        redirectUrl = `${origin}${next}`
      } else if (forwardedHost) {
        redirectUrl = `https://${forwardedHost}${next}`
      } else {
        redirectUrl = `${origin}${next}`
      }
      console.log('[Auth Callback] Redirecting to:', redirectUrl)
      return NextResponse.redirect(redirectUrl)
    }
  }

  // return the user to an error page with instructions
  console.error('[Auth Callback] No code or exchange failed, redirecting to error page')
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
