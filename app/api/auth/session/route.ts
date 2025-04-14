import { auth } from '@/lib/firebase-admin'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const { idToken } = await request.json()
    
    // Verify the ID token
    const decodedToken = await auth.verifyIdToken(idToken)
    
    // Create session cookie
    const expiresIn = 60 * 60 * 24 * 5 * 1000 // 5 days
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn })
    
    // Set the cookie
    cookies().set('firebase-session', sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    })

    return new Response(JSON.stringify({ status: 'success' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Invalid ID token' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

export async function DELETE() {
  cookies().delete('firebase-session')
  return new Response(JSON.stringify({ status: 'success' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}