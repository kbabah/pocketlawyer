import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

// This API route should only be used during development to set up the initial admin user
// In production, this should be secured or removed

export async function POST(req: NextRequest) {
  try {
    // For security purposes, only allow this in development
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "This endpoint is only available in development mode" },
        { status: 403 }
      );
    }

    const { email } = await req.json();
    
    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Find the user by email
    let user;
    try {
      user = await adminAuth.getUserByEmail(email);
    } catch (error) {
      return NextResponse.json(
        { error: "User not found with this email" },
        { status: 404 }
      );
    }

    // Set custom claims for admin
    await adminAuth.setCustomUserClaims(user.uid, { admin: true });
    
    // Update the user document in Firestore
    await adminDb.collection("users").doc(user.uid).set(
      { 
        role: "admin",
        email: user.email,
        updatedAt: new Date(),
        isAdmin: true
      }, 
      { merge: true }
    );

    return NextResponse.json({
      success: true,
      message: `User ${email} has been granted admin privileges`,
      userId: user.uid
    });
  } catch (error) {
    console.error("Admin setup error:", error);
    return NextResponse.json(
      { error: "Failed to set up admin user" },
      { status: 500 }
    );
  }
}