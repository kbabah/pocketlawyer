import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET() {
  try {
    const scheduledSnapshot = await adminDb
      .collection('scheduled_emails')
      .orderBy('scheduledFor', 'asc')
      .get();

    const scheduled = scheduledSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ scheduled });
  } catch (error: any) {
    console.error('Error fetching scheduled emails:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scheduled emails', details: error.message },
      { status: 500 }
    );
  }
}
