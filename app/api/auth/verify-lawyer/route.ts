import { NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const sessionCookie = cookies().get('firebase-session')?.value;
    
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { auth, adminDb } = await getFirebaseAdmin();
    const decodedClaims = await auth.verifySessionCookie(sessionCookie);
    
    // Get lawyer profile
    const lawyerDoc = await adminDb.collection('lawyers').doc(decodedClaims.uid).get();
    
    if (!lawyerDoc.exists) {
      return NextResponse.json({ status: 'not_registered' });
    }

    const lawyerData = lawyerDoc.data();
    if (!lawyerData) {
      return NextResponse.json({ status: 'invalid_data' });
    }

    return NextResponse.json({ status: lawyerData.status });
  } catch (error) {
    console.error('Error verifying lawyer:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}