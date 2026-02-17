import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

function getApp(): App {
  if (!getApps().length) {
    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error(
        'Firebase Admin SDK is not configured. Missing environment variables: ' +
        [
          !projectId && 'FIREBASE_ADMIN_PROJECT_ID',
          !clientEmail && 'FIREBASE_ADMIN_CLIENT_EMAIL',
          !privateKey && 'FIREBASE_ADMIN_PRIVATE_KEY',
        ].filter(Boolean).join(', ')
      );
    }

    return initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    });
  }
  return getApps()[0];
}

// Lazy getters so the SDK is only initialized when actually called at runtime,
// not during Vercel's build-time page collection.
export const adminAuth: Auth = new Proxy({} as Auth, {
  get(_, prop) {
    return (getAuth(getApp()) as any)[prop];
  },
});

export const adminDb: Firestore = new Proxy({} as Firestore, {
  get(_, prop) {
    return (getFirestore(getApp()) as any)[prop];
  },
});