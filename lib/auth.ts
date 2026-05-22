import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { logger } from "@/lib/logger";

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
    if (typeof input !== "string") {
      const cookieStore = await cookies();
      const sessionCookie = cookieStore.get("firebase-session")?.value;

      if (!sessionCookie) {
        verbose && logger.info("No session cookie found");
        return false;
      }

      const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie);
      return await checkUserAdminStatus(decodedClaims.uid, verbose);
    } else if (input.includes("@")) {
      const user = await adminAuth.getUserByEmail(input);
      return await checkUserAdminStatus(user.uid, verbose);
    } else {
      return await checkUserAdminStatus(input, verbose);
    }
  } catch (error) {
    logger.error("Error checking admin permission:", error);
    return false;
  }
}

async function checkUserAdminStatus(
  uid: string,
  verbose: boolean
): Promise<boolean> {
  try {
    const userRecord = await adminAuth.getUser(uid);
    const customClaims = userRecord.customClaims || {};

    if (customClaims.admin === true) {
      verbose && logger.info("Admin verified via custom claims");
      return true;
    }

    const userDoc = await adminDb.collection("users").doc(uid).get();
    if (userDoc.exists) {
      const userData = userDoc.data();
      if (userData?.role === "admin" || userData?.isAdmin === true) {
        verbose && logger.info("Admin verified via Firestore role");
        return true;
      }
    }

    verbose && logger.info("User is not an admin");
    return false;
  } catch (error) {
    logger.error("Error in checkUserAdminStatus:", error);
    return false;
  }
}

export async function isAdmin(input: string | NextRequest): Promise<boolean> {
  return checkAdminPermission(input);
}
