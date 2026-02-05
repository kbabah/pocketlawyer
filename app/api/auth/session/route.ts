import { adminAuth } from '@/lib/firebase-admin'
import { cookies } from 'next/headers'
import { logger } from '@/lib/logger'

export async function POST(request: Request) {
  try {
    const { idToken } = await request.json()
    
    if (!idToken) {
      logger.warn('Session creation failed: No idToken provided')
      return new Response(
        JSON.stringify({ error: 'No ID token provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    // Verify the ID token
    const decodedToken = await adminAuth.verifyIdToken(idToken)
    logger.debug('ID token verified', { uid: decodedToken.uid })
    
    // Create session cookie
    const expiresIn = 60 * 60 * 24 * 5 * 1000 // 5 days
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn })
    
    // Set the cookie
    const cookieStore = await cookies()
    cookieStore.set('firebase-session', sessionCookie, {
      maxAge: expiresIn / 1000, // maxAge is in seconds, not milliseconds
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax',
    })

    logger.info('Session created successfully', { uid: decodedToken.uid })

    return new Response(JSON.stringify({ status: 'success', uid: decodedToken.uid }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    logger.error('Session creation failed', error, { 
      code: error.code,
      message: error.message 
    })
    
    return new Response(
      JSON.stringify({ 
        error: 'Invalid ID token',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined 
      }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

export async function DELETE() {
  try {
    const cookieStore = await cookies()
    cookieStore.delete('firebase-session')
    logger.info('Session deleted successfully')
    
    return new Response(JSON.stringify({ status: 'success' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    logger.error('Session deletion failed', error)
    return new Response(
      JSON.stringify({ error: 'Failed to delete session' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}