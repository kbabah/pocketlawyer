import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get the session cookie
  const session = request.cookies.get('firebase-session')

  // List of public paths that don't require authentication
  const publicPaths = ['/sign-in', '/sign-up', '/welcome', '/auth/error', '/terms', '/privacy', '/contact', '/blog', '/examples', '/onboarding']
  const isPublicPath = publicPaths.some(path => request.nextUrl.pathname.startsWith(path))

  // Enhanced static resource check to include all common static files
  const isStaticResource = 
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/api') ||
    request.nextUrl.pathname.startsWith('/static') ||
    request.nextUrl.pathname.includes('.ico') ||
    request.nextUrl.pathname.includes('.png') ||
    request.nextUrl.pathname.includes('.svg') ||
    request.nextUrl.pathname.includes('.jpg') ||
    request.nextUrl.pathname.includes('.jpeg') ||
    request.nextUrl.pathname.includes('.gif') ||
    request.nextUrl.pathname.includes('.webp') ||
    request.nextUrl.pathname.includes('.pdf') ||
    request.nextUrl.pathname.includes('.js') ||
    request.nextUrl.pathname.includes('.css')

  // Determine response based on auth logic
  let response: NextResponse;

  // Always allow access to static resources
  if (isStaticResource) {
    response = NextResponse.next()
  }
  // Handle root path redirection based on auth status
  else if (request.nextUrl.pathname === '/') {
    if (request.nextUrl.searchParams.get('trial') === 'true') {
      response = NextResponse.next()
    } else if (!session) {
      response = NextResponse.redirect(new URL('/welcome', request.url))
    } else {
      response = NextResponse.next()
    }
  }
  // If trying to access protected route without session, redirect to sign-in
  else if (!isPublicPath && !session) {
    const signInUrl = new URL('/sign-in', request.url)
    signInUrl.searchParams.set('callbackUrl', request.nextUrl.pathname)
    response = NextResponse.redirect(signInUrl)
  }
  // Let authenticated users access onboarding even if they already completed it
  else if (request.nextUrl.pathname === '/onboarding' && session) {
    response = NextResponse.next()
  }
  // If already authenticated and trying to access auth pages, redirect to home
  else if (session && isPublicPath && 
      (request.nextUrl.pathname === '/sign-in' || 
       request.nextUrl.pathname === '/sign-up' || 
       request.nextUrl.pathname === '/welcome')) {
    response = NextResponse.redirect(new URL('/', request.url))
  }
  else {
    response = NextResponse.next()
  }

  // Add security headers to all responses
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://www.gstatic.com https://www.google.com https://apis.google.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' blob: data: https:;
    font-src 'self' https://fonts.gstatic.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-src 'self' https://www.google.com https://*.firebaseapp.com https://accounts.google.com;
    frame-ancestors 'none';
    connect-src 'self' https://api.openai.com https://*.firebaseapp.com https://*.firebaseio.com https://*.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://www.googleapis.com https://accounts.google.com;
  `.replace(/\s{2,}/g, ' ').trim()

  response.headers.set('Content-Security-Policy', cspHeader)
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  return response
}

export const config = {
  matcher: [
    // Exclude static files and API routes from middleware processing
    '/((?!_next/static|_next/image|api|.*\\..*).*)',
  ],
}