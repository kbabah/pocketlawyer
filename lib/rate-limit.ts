// Simple in-memory rate limiter
class RateLimiter {
  private requests: Map<string, { count: number; resetTime: number }>;
  private windowMs: number;
  private maxRequests: number;

  constructor(windowMs = 60000, maxRequests = 10) {
    this.requests = new Map();
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    
    // Clean up old entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, value] of this.requests.entries()) {
      if (now > value.resetTime) {
        this.requests.delete(key);
      }
    }
  }

  async limit(id: string, customLimit?: { windowMs?: number; maxRequests?: number }) {
    const now = Date.now();
    const windowMs = customLimit?.windowMs ?? this.windowMs;
    const maxRequests = customLimit?.maxRequests ?? this.maxRequests;

    // Get or create request tracker for this ID
    let tracker = this.requests.get(id);
    if (!tracker || now > tracker.resetTime) {
      tracker = {
        count: 0,
        resetTime: now + windowMs
      };
      this.requests.set(id, tracker);
    }

    // Check if limit is exceeded
    if (tracker.count >= maxRequests) {
      return {
        success: false,
        limit: maxRequests,
        remaining: 0,
        reset: tracker.resetTime,
      };
    }

    // Increment counter
    tracker.count++;
    return {
      success: true,
      limit: maxRequests,
      remaining: maxRequests - tracker.count,
      reset: tracker.resetTime,
    };
  }
}

// Create singleton instance
const ratelimiter = new RateLimiter();

export interface RateLimitContextBase {
  id: string;
  request: Request;
  headers?: HeadersInit;
}

export async function rateLimitRequest(
  { id, request, headers = {} }: RateLimitContextBase,
  limitConfig?: { windowMs?: number; maxRequests?: number }
) {
  try {
    const { success, limit, remaining, reset } = await ratelimiter.limit(
      id,
      limitConfig
    );

    const rateLimitHeaders = {
      'X-RateLimit-Limit': limit.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': reset.toString(),
      ...headers,
    };

    return {
      success,
      headers: rateLimitHeaders,
      response: !success ? 
        new Response('Too Many Requests', { 
          status: 429, 
          headers: rateLimitHeaders 
        }) : null
    };
  } catch (error) {
    console.error('Rate limit error:', error);
    // Fail open - allow the request if rate limiting fails
    return { success: true, headers: {}, response: null };
  }
}

// Helper to get rate limit context from a request
export function getRateLimitContext(request: Request, userId?: string): RateLimitContextBase {
  return {
    id: userId || request.headers.get('x-forwarded-for') || 'anonymous',
    request,
    headers: {
      'X-RateLimit-Action': 'chat',
    },
  };
}