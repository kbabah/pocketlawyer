import { NextAuthOptions } from "next-auth";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

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

// Helper function to check if a user has admin role
export async function isAdmin(email: string): Promise<boolean> {
  try {
    const user = await adminAuth.getUserByEmail(email);
    const customClaims = user.customClaims || {};
    return customClaims.admin === true;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}