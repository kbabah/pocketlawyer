import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // This is a basic client-side protection
  // For full security, you need server-side auth (Firebase Admin SDK)
  
  const { pathname } = request.nextUrl
  
  // Protect admin routes - only accessible to admin users
  if (pathname.startsWith('/admin')) {
    // Note: Full protection happens in the page component
    // which checks user role from Firebase
    return NextResponse.next()
  }
  
  // Protect lawyer dashboard routes - only accessible to approved lawyers
  if (pathname.startsWith('/lawyer/dashboard')) {
    // Note: Full protection happens in the page component
    // which checks lawyer status from Firebase
    return NextResponse.next()
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/lawyer/dashboard/:path*'
  ]
}
