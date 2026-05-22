import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase-admin";
import { checkAdminPermission } from "@/lib/auth";
import { getChat } from "@/lib/chat-store";

export type AuthenticatedUser = {
  uid: string;
  email?: string;
  isAdmin: boolean;
};

export function unauthorizedResponse(message = "Unauthorized"): NextResponse {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function forbiddenResponse(message = "Forbidden"): NextResponse {
  return NextResponse.json({ error: message }, { status: 403 });
}

/**
 * Resolve the current user from firebase-session cookie or Bearer ID token.
 */
export async function getAuthenticatedUser(
  request: Request
): Promise<AuthenticatedUser | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("firebase-session")?.value;
    if (sessionCookie) {
      const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
      const isAdmin = await checkAdminPermission(decoded.uid);
      return {
        uid: decoded.uid,
        email: decoded.email,
        isAdmin,
      };
    }
  } catch {
    // Fall through to Bearer token
  }

  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  try {
    const token = authHeader.slice(7);
    const decoded = await adminAuth.verifyIdToken(token);
    const isAdmin =
      decoded.admin === true || (await checkAdminPermission(decoded.uid));
    return {
      uid: decoded.uid,
      email: decoded.email,
      isAdmin,
    };
  } catch {
    return null;
  }
}

export async function requireAuth(
  request: Request
): Promise<{ user: AuthenticatedUser } | NextResponse> {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return unauthorizedResponse();
  }
  return { user };
}

export async function requireAdmin(
  request: Request
): Promise<{ user: AuthenticatedUser } | NextResponse> {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }
  if (!authResult.user.isAdmin) {
    return forbiddenResponse("Admin access required");
  }
  return authResult;
}

export { resolveRateLimitUserId } from "@/lib/verified-user-id";

export async function assertUserCanAccessChat(
  chatId: string,
  uid: string,
  isAdmin: boolean
): Promise<boolean> {
  if (isAdmin) return true;
  const chat = await getChat(chatId);
  if (!chat) return false;
  return chat.userId === uid;
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

export function devOnlyResponse(): NextResponse {
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
