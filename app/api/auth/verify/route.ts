import { NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('firebase-session')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { auth } = await getFirebaseAdmin();
    const decodedToken = await auth.verifySessionCookie(token);
    const user = await auth.getUser(decodedToken.uid);

    const isAdmin = user.customClaims?.admin === true;
    return NextResponse.json({ isAdmin });
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

// Route to set admin claims (only callable in development)
export async function PUT(request: Request) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  try {
    const { uid } = await request.json();
    if (!uid) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const { auth } = await getFirebaseAdmin();
    await auth.setCustomUserClaims(uid, { admin: true });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error setting admin claims:', error);
    return NextResponse.json({ error: 'Failed to set admin claims' }, { status: 500 });
  }
}