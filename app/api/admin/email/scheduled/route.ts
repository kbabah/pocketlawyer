import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { requireAdmin } from '@/lib/api-auth';

export async function GET(request: Request) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof NextResponse) return authResult;

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
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { error: 'Failed to fetch scheduled emails', details: err.message },
      { status: 500 }
    );
  }
}
