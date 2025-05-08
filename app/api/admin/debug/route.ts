import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

// This endpoint helps debug user authentication and admin status
export async function GET(req: NextRequest) {
  try {
    // Get the session cookie
    const sessionCookie = cookies().get("firebase-session")?.value;
    
    if (!sessionCookie) {
      return NextResponse.json({
        authenticated: false,
        message: "No session cookie found",
      }, { status: 200 });
    }
    
    // Verify the session
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie);
    const uid = decodedClaims.uid;
    
    // Get user data from Firebase Auth
    const userRecord = await adminAuth.getUser(uid);
    
    // Get user data from Firestore
    const userDoc = await adminDb.collection("users").doc(uid).get();
    const userData = userDoc.exists ? userDoc.data() : null;
    
    // Return debug info
    return NextResponse.json({
      authenticated: true,
      uid: uid,
      email: userRecord.email,
      emailVerified: userRecord.emailVerified,
      firebaseAuthData: {
        displayName: userRecord.displayName,
        provider: userRecord.providerData?.[0]?.providerId || "unknown",
        customClaims: userRecord.customClaims || {},
      },
      firestoreData: {
        exists: userDoc.exists,
        role: userData?.role || "none",
        isAdmin: userData?.isAdmin || false,
      },
    }, { status: 200 });
  } catch (error: any) {
    console.error("Session debug error:", error);
    return NextResponse.json({
      authenticated: false,
      error: error.message,
    }, { status: 200 }); // Still return 200 for debugging
  }
}