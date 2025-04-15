import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Redirect root path to welcome page
  if (request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/welcome', request.url))
  }

  // Get the session cookie
  const session = request.cookies.get('firebase-session')

  // List of public paths that don't require authentication
  const publicPaths = ['/sign-in', '/sign-up', '/welcome', '/auth/error']
  const isPublicPath = publicPaths.some(path => request.nextUrl.pathname.startsWith(path))

  // Don't require authentication for public paths and static files
  if (
    isPublicPath ||
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/api') ||
    request.nextUrl.pathname.startsWith('/static') ||
    request.nextUrl.pathname.includes('favicon.ico')
  ) {
    return NextResponse.next()
  }

  // If there's no session, redirect to sign-in page
  if (!session) {
    const signInUrl = new URL('/sign-in', request.url)
    signInUrl.searchParams.set('callbackUrl', request.nextUrl.pathname)
    return NextResponse.redirect(signInUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}