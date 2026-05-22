import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { requireAdmin } from '@/lib/api-auth';

export async function GET(request: Request) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) return authResult;

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
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { error: 'Failed to fetch sent emails', details: err.message },
      { status: 500 }
    );
  }
}
