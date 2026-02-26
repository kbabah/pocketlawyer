import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

// This API route should only be used during development to set up the initial admin user
// In production, this should be secured or removed

/**
 * Validates the admin setup secret from request headers
 */
function validateAdminSetupSecret(req: NextRequest): boolean {
  const secret = req.headers.get('x-admin-setup-secret') ||
                 req.nextUrl.searchParams.get('secret');

  const expectedSecret = process.env.ADMIN_SETUP_SECRET;

  // If no secret is configured in env, reject in production
  if (!expectedSecret && process.env.NODE_ENV === 'production') {
    logger.error('ADMIN_SETUP_SECRET not configured');
    return false;
  }

  // If no secret is configured, only allow in development
  if (!expectedSecret) {
    return process.env.NODE_ENV === 'development';
  }

  return secret === expectedSecret;
}

export async function POST(req: NextRequest) {
  try {
    // For security purposes, only allow this in development unless proper secret is provided
    if (process.env.NODE_ENV === "production") {
      // In production, require ADMIN_SETUP_SECRET
      if (!validateAdminSetupSecret(req)) {
        return NextResponse.json(
          { error: "Unauthorized - Invalid or missing setup secret" },
          { status: 403 }
        );
      }
    } else {
      // In development, still validate secret if it's configured
      if (process.env.ADMIN_SETUP_SECRET && !validateAdminSetupSecret(req)) {
        return NextResponse.json(
          { error: "Unauthorized - Invalid setup secret" },
          { status: 403 }
        );
      }
    }

    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
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

    logger.info(`Admin privileges granted to user: ${email} (${user.uid})`);

    return NextResponse.json({
      success: true,
      message: `User ${email} has been granted admin privileges`,
      userId: user.uid
    });
  } catch (error) {
    logger.error("Admin setup error:", error);
    return NextResponse.json(
      { error: "Failed to set up admin user" },
      { status: 500 }
    );
  }
}