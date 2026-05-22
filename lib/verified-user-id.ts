/**
 * Use verified UID for rate limits; reject spoofed client userId.
 */
export function resolveRateLimitUserId(
  clientUserId: string | undefined,
  authenticatedUid: string | undefined
): string | undefined {
  if (!authenticatedUid) {
    return undefined;
  }
  if (clientUserId && clientUserId !== authenticatedUid) {
    return authenticatedUid;
  }
  return authenticatedUid;
}
