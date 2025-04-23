import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('firebase-session')
  const publicPaths = ['/sign-in', '/sign-up', '/welcome', '/auth/error']
  const isPublicPath = publicPaths.some(path => request.nextUrl.pathname.startsWith(path))
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')
  const isLawyerRoute = request.nextUrl.pathname.startsWith('/lawyer/dashboard')

  const isStaticResource = 
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/api') ||
    request.nextUrl.pathname.startsWith('/static') ||
    request.nextUrl.pathname.includes('favicon.ico')

  if (isStaticResource) {
    return NextResponse.next()
  }

  if (request.nextUrl.pathname === '/') {
    if (!session) {
      return NextResponse.redirect(new URL('/welcome', request.url))
    }
    return NextResponse.next()
  }

  if (!isPublicPath && !session) {
    const signInUrl = new URL('/sign-in', request.url)
    signInUrl.searchParams.set('callbackUrl', request.nextUrl.pathname)
    return NextResponse.redirect(signInUrl)
  }

  if (session && isPublicPath && request.nextUrl.pathname !== '/welcome') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Handle lawyer dashboard access
  if (isLawyerRoute && session) {
    try {
      const verifyResponse = await fetch(new URL('/api/auth/verify-lawyer', request.url), {
        method: 'POST',
        headers: {
          'Cookie': `firebase-session=${session.value}`
        }
      })

      if (!verifyResponse.ok) {
        return NextResponse.redirect(new URL('/sign-in', request.url))
      }

      const { status } = await verifyResponse.json()
      
      if (status === 'not_registered') {
        return NextResponse.redirect(new URL('/lawyers/register', request.url))
      }
      
      if (status !== 'accepted') {
        return NextResponse.redirect(new URL('/lawyer/pending', request.url))
      }
    } catch (error) {
      console.error('Lawyer verification error:', error)
      return NextResponse.redirect(new URL('/sign-in', request.url))
    }
  }

  // Admin route handling
  if (isAdminRoute && session) {
    try {
      const verifyResponse = await fetch(new URL('/api/auth/verify', request.url), {
        method: 'POST',
        headers: {
          'Cookie': `firebase-session=${session.value}`
        }
      })

      if (!verifyResponse.ok) {
        return NextResponse.redirect(new URL('/sign-in', request.url))
      }

      const { isAdmin } = await verifyResponse.json()
      
      if (!isAdmin) {
        return NextResponse.redirect(new URL('/', request.url))
      }
    } catch (error) {
      console.error('Admin verification error:', error)
      return NextResponse.redirect(new URL('/sign-in', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}