import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Check if any Supabase authentication tokens exist in cookies
  const allCookies = request.cookies.getAll()
  const hasAuthToken = allCookies.some(
    (cookie) => cookie.name.startsWith('sb-') && cookie.name.includes('-auth-token')
  )

  // Fast path: If no auth token is present, avoid initializing Supabase client
  // or making any external network requests.
  if (!hasAuthToken) {
    if (pathname.startsWith('/dashboard')) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    if (pathname === '/') {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    return NextResponse.next({
      request,
    })
  }

  // Auth token exists: Check 48-hour inactivity timeout
  const INACTIVITY_TIMEOUT_MS = 48 * 60 * 60 * 1000
  const lastActiveStr = request.cookies.get('x-last-active')?.value
  const now = Date.now()

  if (lastActiveStr) {
    const lastActive = parseInt(lastActiveStr, 10)
    if (!isNaN(lastActive) && now - lastActive > INACTIVITY_TIMEOUT_MS) {
      // Inactivity timeout reached. Clear auth cookies and redirect to /login immediately
      // without blocking on an external signOut network call.
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      const response = NextResponse.redirect(url)
      allCookies.forEach((cookie) => {
        if (cookie.name.startsWith('sb-') || cookie.name === 'x-last-active') {
          response.cookies.delete(cookie.name)
        }
      })
      return response
    }
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
      global: {
        fetch: (url, options = {}) => {
          return fetch(url, {
            ...options,
            // 3.5s timeout prevents any external auth request from hanging middleware/proxy
            signal: options.signal || AbortSignal.timeout(3500),
          })
        },
      },
    }
  )

  let user = null
  try {
    const { data, error } = await supabase.auth.getUser()
    if (!error && data?.user) {
      user = data.user
    }
  } catch (err) {
    console.error('Supabase auth verification failed or timed out in proxy:', err)
  }

  // If user is authenticated:
  if (user) {
    // Refresh last active timestamp
    supabaseResponse.cookies.set('x-last-active', now.toString(), {
      path: '/',
      maxAge: 48 * 60 * 60, // 48 hours
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    })

    // Redirect to dashboard if logged in and trying to access /login or /
    if (pathname === '/login' || pathname === '/') {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }

    return supabaseResponse
  }

  // If user could not be verified (token invalid, expired, or auth timeout):
  if (pathname.startsWith('/dashboard')) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    const response = NextResponse.redirect(url)
    // Delete stale auth cookies so subsequent requests don't keep retrying an invalid session
    allCookies.forEach((cookie) => {
      if (cookie.name.startsWith('sb-') || cookie.name === 'x-last-active') {
        response.cookies.delete(cookie.name)
      }
    })
    return response
  }

  if (pathname === '/') {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
