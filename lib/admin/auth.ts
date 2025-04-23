import { NextRequest } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { adminDb } from '@/lib/firebase-admin';

/**
 * Verifies that a user is an admin based on their auth token
 * @param request The Next.js request object containing the authorization header
 * @returns The admin user's UID if verification is successful
 * @throws Error if the user is not authenticated or not an admin
 */
export async function verifyAdminToken(request: NextRequest): Promise<string> {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Missing or invalid authorization token');
    }

    const token = authHeader.split(' ')[1];
    const decodedToken = await getAuth().verifyIdToken(token);
    
    // Check if user is an admin in Firestore
    const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
    const userData = userDoc.data();

    if (!userData?.isAdmin) {
      throw new Error('User is not an admin');
    }

    return decodedToken.uid;
  } catch (error) {
    console.error('Admin verification failed:', error);
    throw error;
  }
}

/**
 * Creates an audit log entry for an admin action
 * @param adminId The ID of the admin user performing the action
 * @param action The action being performed
 * @param resourceType The type of resource being affected
 * @param resourceId The ID of the resource being affected
 * @param details Additional details about the action
 * @returns The ID of the created audit log entry
 */
export async function logAdminAction(
  adminId: string,
  action: string,
  resourceType: string,
  resourceId: string,
  details?: Record<string, any>
): Promise<string> {
  const logRef = adminDb.collection('adminAuditLogs').doc();
  
  await logRef.set({
    adminId,
    action,
    resourceType,
    resourceId,
    details: details || {},
    timestamp: new Date().toISOString(),
    ipAddress: process.env.NODE_ENV === 'development' 
      ? '127.0.0.1' 
      : process.env.VERCEL_IP_ADDRESS || null
  });
  
  return logRef.id;
}