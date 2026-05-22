import { auth } from "@/lib/firebase";

/**
 * Fetch wrapper for /api/chat/manage — sends session cookie and Firebase ID token.
 */
export async function chatManageFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const headers = new Headers(init?.headers);

  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const firebaseUser = auth.currentUser;
  if (firebaseUser && !firebaseUser.isAnonymous) {
    try {
      const token = await firebaseUser.getIdToken();
      headers.set("Authorization", `Bearer ${token}`);
    } catch {
      // Cookie-only auth may still work
    }
  }

  return fetch(input, {
    ...init,
    credentials: "include",
    headers,
  });
}
