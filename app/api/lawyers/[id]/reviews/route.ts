import { NextRequest, NextResponse } from 'next/server'
import { getFirebaseAdmin } from '@/lib/firebase-admin'
import { cookies } from 'next/headers'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { adminDb } = await getFirebaseAdmin()
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status') || 'all'
    
    let query = adminDb.collection('lawyers')
      .doc(params.id)
      .collection('reviews')
      .orderBy('createdAt', 'desc')

    if (status !== 'all') {
      query = query.where('status', '==', status)
    }

    const snapshot = await query
      .limit(limit)
      .offset((page - 1) * limit)
      .get()

    const reviews = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    const totalDocs = (await query.count().get()).data().count

    return NextResponse.json({
      reviews,
      pagination: {
        total: totalDocs,
        pages: Math.ceil(totalDocs / limit),
        page,
        limit
      }
    })

  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
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
    
    // Verify that the user has had a consultation with this lawyer
    const consultationsRef = adminDb.collection('consultations')
    const consultations = await consultationsRef
      .where('userId', '==', decodedClaims.uid)
      .where('lawyerId', '==', params.id)
      .where('status', '==', 'completed')
      .limit(1)
      .get()

    if (consultations.empty) {
      return NextResponse.json(
        { error: 'You can only review lawyers after completing a consultation' },
        { status: 403 }
      )
    }

    const { rating, comment } = await request.json()

    if (!rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Invalid rating' },
        { status: 400 }
      )
    }

    if (!comment || typeof comment !== 'string' || comment.length < 10) {
      return NextResponse.json(
        { error: 'Review comment must be at least 10 characters' },
        { status: 400 }
      )
    }

    // Get user info
    const userDoc = await adminDb.collection('users').doc(decodedClaims.uid).get()
    const userData = userDoc.data()

    const review = {
      userId: decodedClaims.uid,
      userName: userData?.name || 'Anonymous',
      userPhoto: userData?.photoURL || null,
      rating,
      comment,
      status: 'published',
      createdAt: new Date().toISOString(),
      consultationId: consultations.docs[0].id
    }

    // Create the review
    const reviewRef = await adminDb.collection('lawyers')
      .doc(params.id)
      .collection('reviews')
      .add(review)

    // Update lawyer's average rating
    const reviewsRef = adminDb.collection('lawyers')
      .doc(params.id)
      .collection('reviews')
    
    const allReviews = await reviewsRef
      .where('status', '==', 'published')
      .get()
    
    const totalRating = allReviews.docs.reduce((sum, doc) => sum + doc.data().rating, 0)
    const averageRating = totalRating / allReviews.size

    await adminDb.collection('lawyers')
      .doc(params.id)
      .update({
        averageRating,
        totalReviews: allReviews.size
      })

    return NextResponse.json({
      id: reviewRef.id,
      ...review
    })

  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    )
  }
}