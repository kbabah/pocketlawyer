import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch {
      return NextResponse.json({ error: 'Unauthorized - Invalid token' }, { status: 401 });
    }

    const uid = decodedToken.uid;

    // Find the lawyer document by the auth UID stored in userId field
    const lawyersSnapshot = await adminDb
      .collection('lawyers')
      .where('userId', '==', uid)
      .limit(1)
      .get();

    if (lawyersSnapshot.empty) {
      return NextResponse.json({ error: 'Lawyer profile not found' }, { status: 404 });
    }

    const lawyerId = lawyersSnapshot.docs[0].id;

    // Fetch all bookings for this lawyer using Admin SDK (bypasses Firestore rules)
    const bookingsSnapshot = await adminDb
      .collection('bookings')
      .where('lawyerId', '==', lawyerId)
      .orderBy('date', 'desc')
      .get();

    const bookings = bookingsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        date: data.date?.toDate?.()?.toISOString() ?? data.date,
        createdAt: data.createdAt?.toDate?.()?.toISOString() ?? data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() ?? data.updatedAt,
      };
    });

    return NextResponse.json({ bookings });
  } catch (error: any) {
    console.error('Error fetching lawyer bookings:', error);
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}
