import { NextRequest, NextResponse } from "next/server";
import { adminDb as db } from "@/lib/firebase-admin";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase-admin";

// Helper function to check admin permissions - reusing from templates API
async function isAdmin(req: NextRequest) {
  try {
    // Attempt to get the Firebase session
    const sessionCookie = cookies().get("firebase-session")?.value;
    
    if (!sessionCookie) {
      console.log("No session cookie found");
      return false;
    }
    
    // Verify the session
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie);
    const uid = decodedClaims.uid;
    
    // Check custom claims
    if (decodedClaims.admin === true) {
      return true;
    }
    
    // Check Firestore role
    const userDoc = await db.collection("users").doc(uid).get();
    if (userDoc.exists) {
      const userData = userDoc.data();
      if (userData?.role === "admin" || userData?.isAdmin === true) {
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}

// GET /api/admin/email/recipients/count - Count email recipients
export async function GET(req: NextRequest) {
  try {
    // Check admin permissions
    if (!await isAdmin(req)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Get the segment from the URL if present
    const searchParams = req.nextUrl.searchParams;
    const segment = searchParams.get('segment');
    
    let count = 0;
    
    // Different query logic based on segment
    if (segment) {
      switch (segment) {
        case 'active':
          // Active users (active in last 30 days)
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          
          const activeSnapshot = await db.collection("users")
            .where("lastActive", ">=", thirtyDaysAgo)
            .count()
            .get();
          count = activeSnapshot.data().count;
          break;
          
        case 'inactive':
          // Inactive users (not active in 30+ days)
          const inactiveDate = new Date();
          inactiveDate.setDate(inactiveDate.getDate() - 30);
          
          const inactiveSnapshot = await db.collection("users")
            .where("lastActive", "<", inactiveDate)
            .count()
            .get();
          count = inactiveSnapshot.data().count;
          break;
          
        case 'trial':
          // Trial users
          const trialSnapshot = await db.collection("users")
            .where("subscriptionTier", "==", "trial")
            .count()
            .get();
          count = trialSnapshot.data().count;
          break;
          
        case 'premium':
          // Premium users
          const premiumSnapshot = await db.collection("users")
            .where("subscriptionTier", "==", "premium")
            .count()
            .get();
          count = premiumSnapshot.data().count;
          break;
          
        case 'new':
          // New users (registered in last 7 days)
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          
          const newUsersSnapshot = await db.collection("users")
            .where("createdAt", ">=", sevenDaysAgo)
            .count()
            .get();
          count = newUsersSnapshot.data().count;
          break;
          
        default:
          // Default: count all users
          const allSnapshot = await db.collection("users")
            .count()
            .get();
          count = allSnapshot.data().count;
      }
    } else {
      // No segment specified, count all users
      const snapshot = await db.collection("users")
        .count()
        .get();
      count = snapshot.data().count;
    }

    return NextResponse.json({ count });
  } catch (error) {
    console.error("Error counting recipients:", error);
    return NextResponse.json(
      { error: "Failed to count recipients" },
      { status: 500 }
    );
  }
}