import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { adminDb } from '@/lib/firebase-admin'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { messageId, chatId, feedbackType, feedbackText } = body

    if (!messageId || !feedbackType || !['like', 'dislike'].includes(feedbackType)) {
      return NextResponse.json({ error: 'Invalid feedback data' }, { status: 400 })
    }

    // Create feedback document
    const feedbackData = {
      messageId,
      chatId: chatId || null,
      userId: session.user.id,
      feedbackType,
      feedbackText: feedbackText || null,
      timestamp: Date.now(),
      createdAt: new Date().toISOString(),
      userAgent: request.headers.get('user-agent') || null,
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null
    }

    // Check if feedback already exists for this message and user
    const existingFeedback = await adminDb
      .collection('messageFeedback')
      .where('messageId', '==', messageId)
      .where('userId', '==', session.user.id)
      .limit(1)
      .get()

    let feedbackRef

    if (!existingFeedback.empty) {
      // Update existing feedback
      const docRef = existingFeedback.docs[0].ref
      await docRef.update({
        feedbackType,
        feedbackText: feedbackText || null,
        updatedAt: new Date().toISOString(),
        timestamp: Date.now()
      })
      feedbackRef = { id: docRef.id }
    } else {
      // Create new feedback
      feedbackRef = await adminDb.collection('messageFeedback').add(feedbackData)
    }

    // Optional: Update aggregate feedback stats for the message
    try {
      const messageStatsRef = adminDb.collection('messageStats').doc(messageId)
      const messageStats = await messageStatsRef.get()
      
      if (messageStats.exists) {
        const data = messageStats.data()
        const likeCount = data?.likeCount || 0
        const dislikeCount = data?.dislikeCount || 0
        
        // Update counts based on feedback type
        const updates: any = { lastUpdated: new Date().toISOString() }
        if (feedbackType === 'like') {
          updates.likeCount = likeCount + 1
        } else {
          updates.dislikeCount = dislikeCount + 1
        }
        
        await messageStatsRef.update(updates)
      } else {
        // Create new stats document
        await messageStatsRef.set({
          messageId,
          likeCount: feedbackType === 'like' ? 1 : 0,
          dislikeCount: feedbackType === 'dislike' ? 1 : 0,
          createdAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        })
      }
    } catch (statsError) {
      console.warn('Failed to update message stats:', statsError)
      // Don't fail the main operation if stats update fails
    }

    return NextResponse.json({
      success: true,
      feedbackId: feedbackRef.id,
      message: 'Feedback submitted successfully'
    })

  } catch (error: any) {
    console.error('Chat feedback API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to submit feedback',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined 
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const messageId = searchParams.get('messageId')
    const chatId = searchParams.get('chatId')

    if (!messageId && !chatId) {
      return NextResponse.json({ error: 'messageId or chatId is required' }, { status: 400 })
    }

    let query = adminDb.collection('messageFeedback')

    if (messageId) {
      query = query.where('messageId', '==', messageId)
    }
    
    if (chatId) {
      query = query.where('chatId', '==', chatId)
    }

    // Only return user's own feedback unless user is admin
    if (!session.user.isAdmin) {
      query = query.where('userId', '==', session.user.id)
    }

    const feedbackSnapshot = await query.orderBy('timestamp', 'desc').limit(50).get()
    
    const feedback = feedbackSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    return NextResponse.json({ feedback })

  } catch (error: any) {
    console.error('Get feedback API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to retrieve feedback',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined 
      },
      { status: 500 }
    )
  }
}
