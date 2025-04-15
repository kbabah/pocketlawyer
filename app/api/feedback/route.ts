import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(request: Request) {
  try {
    const { rating, comment, userId, page } = await request.json();

    // Validate required fields
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating is required and must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Create feedback document
    const feedbackData = {
      rating,
      comment,
      userId: userId || 'anonymous',
      page: page || 'general',
      timestamp: Date.now(),
    };

    // Save to Firestore using admin SDK
    const feedbackRef = await adminDb.collection('feedback').add(feedbackData);

    return NextResponse.json({
      status: 'success',
      id: feedbackRef.id
    });
  } catch (error: any) {
    console.error('Feedback API Error:', error);
    return NextResponse.json(
      { 
        error: 'An error occurred while saving feedback',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined 
      },
      { status: 500 }
    );
  }
}