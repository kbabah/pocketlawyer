import { NextRequest, NextResponse } from 'next/server'
import { getFirebaseAdmin } from '@/lib/firebase-admin'
import { cookies } from 'next/headers'

export async function POST(
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

    // Get the review
    const reviewDoc = await adminDb.collection('reviews').doc(params.id).get()
    
    if (!reviewDoc.exists) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      )
    }

    const review = reviewDoc.data()
    
    // Ensure the replying user is the lawyer who received the review
    if (review.lawyerId !== decodedClaims.uid) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const { reply } = await request.json()
    
    if (!reply || typeof reply !== 'string') {
      return NextResponse.json(
        { error: 'Invalid reply format' },
        { status: 400 }
      )
    }

    // Update the review with the reply
    await adminDb.collection('reviews').doc(params.id).update({
      reply,
      replyAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })

    return NextResponse.json({
      message: 'Reply added successfully'
    })

  } catch (error) {
    console.error('Error adding reply:', error)
    return NextResponse.json(
      { error: 'Failed to add reply' },
      { status: 500 }
    )
  }
}