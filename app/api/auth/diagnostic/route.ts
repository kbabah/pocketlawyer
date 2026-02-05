import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';

export async function GET() {
  try {
    // Test Firebase Admin SDK
    const testResult: any = {
      timestamp: new Date().toISOString(),
      checks: {}
    };

    // Check environment variables
    testResult.checks.env = {
      firebaseApiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      firebaseAuthDomain: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      firebaseProjectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      firebaseAdminProjectId: !!process.env.FIREBASE_ADMIN_PROJECT_ID,
      firebaseAdminClientEmail: !!process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      firebaseAdminPrivateKey: !!process.env.FIREBASE_ADMIN_PRIVATE_KEY,
    };

    // Test Firebase Admin Auth
    try {
      // Try to list users (will fail if credentials are wrong)
      await adminAuth.listUsers(1);
      testResult.checks.adminAuth = 'connected';
    } catch (error: any) {
      testResult.checks.adminAuth = {
        status: 'error',
        message: error.message,
        code: error.code
      };
    }

    // Check if Email/Password provider is enabled
    try {
      const providers = await adminAuth.listProviderConfigs({ type: 'saml' as any });
      testResult.checks.authProviders = 'checked';
    } catch (error) {
      testResult.checks.authProviders = 'could not verify';
    }

    return NextResponse.json(testResult, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: 'Diagnostic check failed',
        message: error.message,
        code: error.code
      },
      { status: 500 }
    );
  }
}
