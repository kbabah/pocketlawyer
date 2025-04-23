import { NextRequest, NextResponse } from 'next/server'
import { getFirebaseAdmin } from '@/lib/firebase-admin'
import { cookies } from 'next/headers'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { auth, adminDb } = await getFirebaseAdmin()
    
    // Verify the session
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get('firebase-session')?.value
    
    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify session and get user
    const decodedClaims = await auth.verifySessionCookie(sessionCookie)
    
    // Ensure the user is requesting their own status
    if (decodedClaims.uid !== params.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Get lawyer document
    const lawyerDoc = await adminDb.collection('lawyers').doc(params.id).get()
    
    if (!lawyerDoc.exists) {
      return NextResponse.json(
        { error: 'Lawyer not found' },
        { status: 404 }
      )
    }

    const lawyerData = lawyerDoc.data()
    
    return NextResponse.json({
      status: lawyerData?.status || 'pending',
      verified: lawyerData?.verified || false,
      active: lawyerData?.active || false
    })

  } catch (error) {
    console.error('Error verifying lawyer status:', error)
    return NextResponse.json(
      { error: 'Failed to verify lawyer status' },
      { status: 500 }
    )
  }
}