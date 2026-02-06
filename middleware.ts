import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // This is a basic client-side protection
  // For full security, you need server-side auth (Firebase Admin SDK)
  
  const { pathname } = request.nextUrl
  
  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    // You can add cookie/token checks here
    // For now, we rely on client-side checks in the admin pages
    return NextResponse.next()
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*']
}
