import { NextResponse } from "next/server"
import { auth } from "@/lib/firebase-admin"
import { cookies } from "next/headers"

// Helper to verify admin authentication
async function verifyAdmin(sessionCookie: string) {
  try {
    const decodedToken = await auth.verifySessionCookie(sessionCookie)
    const user = await auth.getUser(decodedToken.uid)
    if (!user.customClaims?.admin) {
      throw new Error('Unauthorized')
    }
    return user
  } catch (error) {
    throw new Error('Unauthorized')
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const session = cookieStore.get('firebase-session')
    if (!session?.value) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify admin status
    await verifyAdmin(session.value)

    const { userId, disabled } = await request.json()
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    await auth.updateUser(userId, { disabled })
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error updating user status:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    )
  }
}