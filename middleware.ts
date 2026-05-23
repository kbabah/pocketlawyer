import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SECURITY_HEADERS: Record<string, string> = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
};

function applySecurityHeaders(response: NextResponse): NextResponse {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }
  return response;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProd = process.env.NODE_ENV === "production";

  if (
    isProd &&
    (pathname === "/api/auth/diagnostic" || pathname === "/api/admin/debug")
  ) {
    return applySecurityHeaders(
      NextResponse.json({ error: "Not found" }, { status: 404 })
    );
  }

  if (
    pathname.startsWith("/admin") &&
    !pathname.startsWith("/admin/setup") &&
    !request.cookies.get("firebase-session")?.value
  ) {
    const signIn = new URL("/sign-in", request.url);
    signIn.searchParams.set("redirect", pathname);
    return applySecurityHeaders(NextResponse.redirect(signIn));
  }

  if (
    (pathname.startsWith("/lawyer/dashboard") ||
      pathname.startsWith("/lawyer/profile")) &&
    !request.cookies.get("firebase-session")?.value
  ) {
    const signIn = new URL("/sign-in", request.url);
    signIn.searchParams.set("redirect", pathname);
    return applySecurityHeaders(NextResponse.redirect(signIn));
  }

  return applySecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
