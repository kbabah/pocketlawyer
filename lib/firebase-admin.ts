// This file is for server-side use only
import 'server-only';
import { AppOptions } from 'firebase-admin';
import { Auth } from 'firebase-admin/auth';
import { Firestore } from 'firebase-admin/firestore';

let auth: Auth;
let adminDb: Firestore;
let initializationPromise: Promise<void> | null = null;
let isInitializing = false;

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Server-side only
const getApps = async () => (await import('firebase-admin/app')).getApps();

const initializeFirebaseAdmin = async (retryCount = 0): Promise<void> => {
  if (isInitializing) {
    await sleep(100); // Wait for ongoing initialization
    return;
  }

  try {
    isInitializing = true;
    const admin = await import('firebase-admin/app');
    
    if (!(await getApps()).length) {
      if (!process.env.FIREBASE_ADMIN_PROJECT_ID || 
          !process.env.FIREBASE_ADMIN_CLIENT_EMAIL || 
          !process.env.FIREBASE_ADMIN_PRIVATE_KEY) {
        throw new Error('Firebase Admin credentials are not properly configured');
      }

      const app = admin.initializeApp({
        credential: admin.cert({
          projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
          clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
      });

      const { getAuth } = await import('firebase-admin/auth');
      const { getFirestore } = await import('firebase-admin/firestore');
      
      auth = getAuth(app);
      adminDb = getFirestore(app);

      // Test the connection
      await adminDb.collection('_test_connection').get();
    } else {
      const { getAuth } = await import('firebase-admin/auth');
      const { getFirestore } = await import('firebase-admin/firestore');
      
      auth = getAuth();
      adminDb = getFirestore();
    }
  } catch (error: unknown) {
    console.error(`Firebase Admin initialization error (attempt ${retryCount + 1}/${MAX_RETRIES}):`, error);
    
    if (retryCount < MAX_RETRIES - 1) {
      isInitializing = false;
      await sleep(RETRY_DELAY * Math.pow(2, retryCount)); // Exponential backoff
      return initializeFirebaseAdmin(retryCount + 1);
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to initialize Firebase Admin after ${MAX_RETRIES} attempts: ${errorMessage}`);
  } finally {
    isInitializing = false;
  }
};

// Initialize Firebase Admin
if (!initializationPromise) {
  initializationPromise = initializeFirebaseAdmin();
}

export const getFirebaseAdmin = async () => {
  try {
    await Promise.race([
      initializationPromise,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Firebase Admin initialization timeout')), 5000)
      )
    ]);
    return { auth, adminDb };
  } catch (error: unknown) {
    // Reset initialization promise if it times out
    if (error instanceof Error && error.message === 'Firebase Admin initialization timeout') {
      initializationPromise = null;
      throw new Error('Service temporarily unavailable. Please try again.');
    }
    throw error;
  }
};

export { auth, adminDb };