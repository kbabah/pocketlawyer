import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

type RateLimitEntry = {
  count: number;
  resetTime: number;
};

const rateLimitStore = new Map<string, RateLimitEntry>();

const upstashLimiterCache = new Map<string, Ratelimit>();

function hasUpstashConfig(): boolean {
  return !!(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  );
}

function getUpstashLimiter(config: RateLimitConfig): Ratelimit {
  const cacheKey = `${config.maxRequests}-${config.windowMs}`;
  let limiter = upstashLimiterCache.get(cacheKey);
  if (!limiter) {
    const windowSec = Math.max(1, Math.ceil(config.windowMs / 1000));
    const duration =
      windowSec >= 60
        ? (`${Math.ceil(windowSec / 60)} m` as const)
        : (`${windowSec} s` as const);
    limiter = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(config.maxRequests, duration),
      analytics: false,
      prefix: "pocketlawyer",
    });
    upstashLimiterCache.set(cacheKey, limiter);
  }
  return limiter;
}

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 60000);

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

function rateLimitInMemory(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  if (!entry || entry.resetTime < now) {
    const resetTime = now + config.windowMs;
    rateLimitStore.set(identifier, { count: 1, resetTime });
    return {
      success: true,
      limit: config.maxRequests,
      remaining: config.maxRequests - 1,
      reset: resetTime,
    };
  }

  if (entry.count >= config.maxRequests) {
    return {
      success: false,
      limit: config.maxRequests,
      remaining: 0,
      reset: entry.resetTime,
    };
  }

  entry.count++;
  rateLimitStore.set(identifier, entry);

  return {
    success: true,
    limit: config.maxRequests,
    remaining: config.maxRequests - entry.count,
    reset: entry.resetTime,
  };
}

/**
 * Rate limit by identifier. Uses Upstash Redis when configured, otherwise in-memory.
 */
export async function rateLimit(
  identifier: string,
  config: RateLimitConfig = { maxRequests: 10, windowMs: 60000 }
): Promise<RateLimitResult> {
  if (hasUpstashConfig()) {
    const limiter = getUpstashLimiter(config);
    const result = await limiter.limit(identifier);
    return {
      success: result.success,
      limit: config.maxRequests,
      remaining: result.remaining,
      reset: result.reset,
    };
  }

  return rateLimitInMemory(identifier, config);
}

export function getIdentifier(request: Request, userId?: string): string {
  if (userId) return `user:${userId}`;

  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded
    ? forwarded.split(",")[0].trim()
    : request.headers.get("x-real-ip") || "unknown";

  return `ip:${ip}`;
}
