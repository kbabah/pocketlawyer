import { NextRequest, NextResponse } from 'next/server'
import { getFirebaseAdmin } from '@/lib/firebase-admin'
import { cookies } from 'next/headers'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; reviewId: string } }
) {
  try {
    const { auth, adminDb } = await getFirebaseAdmin()
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get('firebase-session')?.value
    
    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const decodedClaims = await auth.verifySessionCookie(sessionCookie)
    
    // Verify that the user is the lawyer
    const lawyerDoc = await adminDb.collection('lawyers')
      .doc(params.id)
      .get()
    
    if (!lawyerDoc.exists || lawyerDoc.data()?.userId !== decodedClaims.uid) {
      return NextResponse.json(
        { error: 'Only the lawyer can reply to reviews' },
        { status: 403 }
      )
    }

    const { reply } = await request.json()

    if (!reply || typeof reply !== 'string' || reply.length < 10) {
      return NextResponse.json(
        { error: 'Reply must be at least 10 characters' },
        { status: 400 }
      )
    }

    // Update the review with the reply
    await adminDb.collection('lawyers')
      .doc(params.id)
      .collection('reviews')
      .doc(params.reviewId)
      .update({
        lawyerReply: reply,
        replyDate: new Date().toISOString()
      })

    return NextResponse.json({
      success: true,
      reply,
      replyDate: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error creating review reply:', error)
    return NextResponse.json(
      { error: 'Failed to create review reply' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; reviewId: string } }
) {
  try {
    const { auth, adminDb } = await getFirebaseAdmin()
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get('firebase-session')?.value
    
    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const decodedClaims = await auth.verifySessionCookie(sessionCookie)
    
    // Verify that the user is the lawyer
    const lawyerDoc = await adminDb.collection('lawyers')
      .doc(params.id)
      .get()
    
    if (!lawyerDoc.exists || lawyerDoc.data()?.userId !== decodedClaims.uid) {
      return NextResponse.json(
        { error: 'Only the lawyer can delete their reply' },
        { status: 403 }
      )
    }

    // Remove the reply from the review
    await adminDb.collection('lawyers')
      .doc(params.id)
      .collection('reviews')
      .doc(params.reviewId)
      .update({
        lawyerReply: null,
        replyDate: null
      })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error deleting review reply:', error)
    return NextResponse.json(
      { error: 'Failed to delete review reply' },
      { status: 500 }
    )
  }
}