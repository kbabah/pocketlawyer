import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get the session cookie
  const session = request.cookies.get('firebase-session')

  // List of public paths that don't require authentication
  const publicPaths = ['/sign-in', '/sign-up', '/welcome', '/auth/error', '/terms', '/privacy', '/contact']
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

  // Always allow access to static resources
  if (isStaticResource) {
    return NextResponse.next()
  }

  // Handle root path redirection based on auth status
  if (request.nextUrl.pathname === '/') {
    if (request.nextUrl.searchParams.get('trial') === 'true') {
      return NextResponse.next()
    }
    
    if (!session) {
      return NextResponse.redirect(new URL('/welcome', request.url))
    }
    return NextResponse.next()
  }

  // If trying to access protected route without session, redirect to sign-in
  if (!isPublicPath && !session) {
    const signInUrl = new URL('/sign-in', request.url)
    signInUrl.searchParams.set('callbackUrl', request.nextUrl.pathname)
    return NextResponse.redirect(signInUrl)
  }

  // If already authenticated and trying to access auth pages, redirect to root
  if (session && isPublicPath && request.nextUrl.pathname !== '/welcome') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Exclude static files and API routes from middleware processing
    '/((?!_next/static|_next/image|api|.*\\..*).*)',
  ],
}