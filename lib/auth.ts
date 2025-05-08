import { NextAuthOptions } from "next-auth";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { NextRequest } from "next/server";
import { cookies } from "next/headers";

// Extend the built-in session types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
      emailVerified?: boolean;
      emailPreferences?: {
        systemUpdates: boolean;
        chatSummaries: boolean;
        trialNotifications: boolean;
        marketingEmails: boolean;
      };
    };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [],
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        
        // Check admin role from Firestore
        try {
          const userDoc = await adminDb.collection("users").doc(token.sub).get();
          if (userDoc.exists) {
            session.user.role = userDoc.data()?.role || 'user';
          }
        } catch (error) {
          console.error("Error checking admin role:", error);
          session.user.role = 'user';
        }
      }
      return session;
    }
  }
};

/**
 * Centralized admin permission checker that works with different input types
 * 
 * @param input - Can be a NextRequest object, user ID (string), or email address
 * @param options - Optional configuration (verbose for logging)
 * @returns Promise<boolean> - Returns true if the user has admin privileges
 */
export async function checkAdminPermission(
  input: NextRequest | string,
  options: { verbose?: boolean } = {}
): Promise<boolean> {
  const { verbose = false } = options;
  
  try {
    // CASE 1: Input is a NextRequest - extract session cookie
    if (typeof input !== 'string') {
      const sessionCookie = cookies().get("firebase-session")?.value;
      
      if (!sessionCookie) {
        verbose && console.log("No session cookie found");
        return false;
      }
      
      // Verify the session and get user ID
      const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie);
      return await checkUserAdminStatus(decodedClaims.uid, verbose);
    }
    
    // CASE 2: Input is an email
    else if (input.includes('@')) {
      const user = await adminAuth.getUserByEmail(input);
      return await checkUserAdminStatus(user.uid, verbose);
    }
    
    // CASE 3: Input is a user ID
    else {
      return await checkUserAdminStatus(input, verbose);
    }
  } catch (error) {
    console.error("Error checking admin permission:", error);
    return false;
  }
}

/**
 * Internal helper to check admin status with a user ID
 * @param uid - Firebase user ID
 * @param verbose - Whether to log detailed information
 * @returns Promise<boolean>
 */
async function checkUserAdminStatus(uid: string, verbose: boolean): Promise<boolean> {
  try {
    // Check 1: Verify via Firebase Auth custom claims
    const userRecord = await adminAuth.getUser(uid);
    const customClaims = userRecord.customClaims || {};
    
    if (customClaims.admin === true) {
      verbose && console.log("Admin verified via custom claims");
      return true;
    }
    
    // Check 2: Verify via Firestore role
    const userDoc = await adminDb.collection("users").doc(uid).get();
    if (userDoc.exists) {
      const userData = userDoc.data();
      if (userData?.role === "admin" || userData?.isAdmin === true) {
        verbose && console.log("Admin verified via Firestore role");
        return true;
      }
    }
    
    verbose && console.log("User is not an admin");
    return false;
  } catch (error) {
    console.error("Error in checkUserAdminStatus:", error);
    return false;
  }
}

// Legacy function for backward compatibility
export async function isAdmin(input: string | NextRequest): Promise<boolean> {
  return checkAdminPermission(input);
}