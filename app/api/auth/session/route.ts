import { auth } from '@/lib/firebase-admin'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { idToken } = await request.json()
    
    // Verify the ID token
    const decodedToken = await auth.verifyIdToken(idToken)
    
    // Create session cookie with longer expiration for better UX
    const expiresIn = 60 * 60 * 24 * 14 * 1000 // 14 days
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn })
    
    // Set the session cookie
    const cookieStore = await cookies()
    await cookieStore.set('firebase-session', sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax',
    })

    return NextResponse.json({ status: 'success' })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Invalid ID token' },
      { status: 401 }
    )
  }
}

export async function DELETE() {
  try {
    const cookieStore = await cookies()
    await cookieStore.delete('firebase-session')
    
    return NextResponse.json({ status: 'success' })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to sign out' },
      { status: 500 }
    )
  }
}