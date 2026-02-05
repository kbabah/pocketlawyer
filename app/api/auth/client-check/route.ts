import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check if Firebase client can initialize
    const checks: any = {
      timestamp: new Date().toISOString(),
      clientConfig: {},
      errors: []
    };

    // Check environment variables that affect client-side auth
    checks.clientConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.substring(0, 10) + '...',
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      hasAll: !!(
        process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
        process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
        process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET &&
        process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID &&
        process.env.NEXT_PUBLIC_FIREBASE_APP_ID
      )
    };

    return NextResponse.json(checks, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: 'Client config check failed',
        message: error.message
      },
      { status: 500 }
    );
  }
}
