import { NextRequest, NextResponse } from 'next/server';
import { adminDb as db } from '@/lib/firebase-admin';
import { verifyAdmin } from '../../middleware';

export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    await verifyAdmin(request);

    // Get pending lawyer registrations
    const lawyersSnapshot = await db.collection('lawyers')
      .where('verified', '==', false)
      .orderBy('createdAt', 'desc')
      .get();

    const lawyers = lawyersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ lawyers });
  } catch (error: any) {
    console.error('Error fetching pending lawyers:', error);
    
    // More specific error handling
    if (error.message.includes('Missing or invalid authorization')) {
      return NextResponse.json(
        { error: 'Unauthorized access - invalid or missing token' },
        { status: 401 }
      );
    } else if (error.message.includes('not an admin')) {
      return NextResponse.json(
        { error: 'Forbidden - admin access required' },
        { status: 403 }
      );
    } else if (error.code === 'auth/id-token-expired') {
      return NextResponse.json(
        { error: 'Authentication token expired' },
        { status: 401 }
      );
    } else {
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  }
}