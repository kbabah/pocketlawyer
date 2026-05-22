import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { requireAdmin, devOnlyResponse, isProduction } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  if (isProduction()) {
    return devOnlyResponse();
  }

  const authResult = await requireAdmin(req);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { user } = authResult;
    const userRecord = await adminAuth.getUser(user.uid);
    const userDoc = await adminDb.collection("users").doc(user.uid).get();
    const userData = userDoc.exists ? userDoc.data() : null;

    return NextResponse.json({
      authenticated: true,
      uid: user.uid,
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
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({
      authenticated: false,
      error: err.message,
    }, { status: 500 });
  }
}
