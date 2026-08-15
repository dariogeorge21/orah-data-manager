import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
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
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Inactivity timeout logic (48 hours)
  const INACTIVITY_TIMEOUT_MS = 48 * 60 * 60 * 1000;
  const lastActiveStr = request.cookies.get('x-last-active')?.value;
  const now = Date.now();

  let shouldLogout = false;
  if (user && lastActiveStr) {
    const lastActive = parseInt(lastActiveStr, 10);
    if (!isNaN(lastActive) && now - lastActive > INACTIVITY_TIMEOUT_MS) {
      // Inactivity timeout reached
      shouldLogout = true;
    }
  }

  if (shouldLogout) {
    await supabase.auth.signOut();
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    const response = NextResponse.redirect(url)
    response.cookies.delete('x-last-active')
    return response;
  }

  // Update last active cookie if authenticated
  if (user) {
    supabaseResponse.cookies.set('x-last-active', now.toString(), {
      path: '/',
      maxAge: 48 * 60 * 60, // 48 hours
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
  }

  // Protect /dashboard routes
  if (
    !user &&
    request.nextUrl.pathname.startsWith('/dashboard')
  ) {
    // no user, potentially respond by redirecting the user to the login page
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Redirect to dashboard if logged in and trying to access /login or /
  if (
    user &&
    (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/')
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
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
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
