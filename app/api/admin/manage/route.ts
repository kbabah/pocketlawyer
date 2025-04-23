import { NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';

// Helper to verify super admin status
async function verifySuperAdmin(token: string) {
  try {
    const { auth } = await getFirebaseAdmin();
    const decodedToken = await auth.verifySessionCookie(token);
    const user = await auth.getUser(decodedToken.uid);
    return user.customClaims?.superAdmin === true;
  } catch (error) {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    // Verify the requester is a super admin
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('firebase-session')?.value;
    
    if (!sessionCookie || !(await verifySuperAdmin(sessionCookie))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { userId, isAdmin } = await request.json();
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const { auth } = await getFirebaseAdmin();
    
    // Set or remove admin claim
    await auth.setCustomUserClaims(userId, { admin: isAdmin === true });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Admin management error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update admin status' },
      { status: 500 }
    );
  }
}