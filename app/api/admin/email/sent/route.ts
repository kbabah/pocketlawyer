import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET() {
  try {
    const sentSnapshot = await adminDb
      .collection('sent_emails')
      .orderBy('sentAt', 'desc')
      .limit(100)
      .get();

    const sent = sentSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ sent });
  } catch (error: any) {
    console.error('Error fetching sent emails:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sent emails', details: error.message },
      { status: 500 }
    );
  }
}
