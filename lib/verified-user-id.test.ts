import { describe, expect, it } from "vitest";
import { resolveRateLimitUserId } from "./verified-user-id";

describe("resolveRateLimitUserId", () => {
  it("returns undefined when not authenticated", () => {
    expect(resolveRateLimitUserId("spoofed", undefined)).toBeUndefined();
  });

  it("returns authenticated uid when client omits userId", () => {
    expect(resolveRateLimitUserId(undefined, "user-123")).toBe("user-123");
  });

  it("ignores spoofed client userId", () => {
    expect(resolveRateLimitUserId("other-user", "user-123")).toBe("user-123");
  });

  it("accepts matching client userId", () => {
    expect(resolveRateLimitUserId("user-123", "user-123")).toBe("user-123");
  });
});
