import { NextRequest, NextResponse } from 'next/server'
import { logger } from "@/lib/logger";
import { adminAuth, adminDb } from '@/lib/firebase-admin'
import type { Query, DocumentData } from 'firebase-admin/firestore'

/**
 * Verify Firebase Bearer token from Authorization header.
 * Returns the decoded uid on success, or null on failure.
 */
async function verifyToken(request: NextRequest): Promise<{ uid: string; isAdmin: boolean } | null> {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) return null
  try {
    const token = authHeader.split('Bearer ')[1]
    const decoded = await adminAuth.verifyIdToken(token)
    const isAdmin = decoded.admin === true
    return { uid: decoded.uid, isAdmin }
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyToken(request)

    if (!user) {
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
      userId: user.uid,
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
      .where('userId', '==', user.uid)
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
      logger.warn('Failed to update message stats:', statsError as Record<string, unknown>)
      // Don't fail the main operation if stats update fails
    }

    return NextResponse.json({
      success: true,
      feedbackId: feedbackRef.id,
      message: 'Feedback submitted successfully'
    })

  } catch (error: any) {
    logger.error('Chat feedback API error:', error)
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
    const user = await verifyToken(request)

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const messageId = searchParams.get('messageId')
    const chatId = searchParams.get('chatId')

    if (!messageId && !chatId) {
      return NextResponse.json({ error: 'messageId or chatId is required' }, { status: 400 })
    }

    let query: Query<DocumentData, DocumentData> = adminDb.collection('messageFeedback')

    if (messageId) {
      query = query.where('messageId', '==', messageId)
    }
    
    if (chatId) {
      query = query.where('chatId', '==', chatId)
    }

    // Only return user's own feedback unless admin
    if (!user.isAdmin) {
      query = query.where('userId', '==', user.uid)
    }

    const feedbackSnapshot = await query.limit(50).get()

    const feedback = feedbackSnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .sort((a: any, b: any) => (b.timestamp || 0) - (a.timestamp || 0))

    return NextResponse.json({ feedback })

  } catch (error: any) {
    logger.error('Get feedback API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to retrieve feedback',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined 
      },
      { status: 500 }
    )
  }
}
