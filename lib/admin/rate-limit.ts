import { NextRequest, NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Create a rate limiter that allows 50 requests per 5 minutes
// This is specifically for admin routes which need more generous limits
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(50, '5 m'),
  analytics: true,
  prefix: '@/admin-api',
});

/**
 * Rate limits admin API requests to prevent abuse
 * @param request The incoming request
 * @returns NextResponse or undefined if the request is allowed
 */
export async function adminRateLimit(request: NextRequest): Promise<NextResponse | undefined> {
  try {
    const ip = request.headers.get('x-forwarded-for') ||
              request.ip ||
              '127.0.0.1';
    
    const { success, limit, remaining, reset } = await ratelimit.limit(`admin_${ip}`);

    // Return rate limit headers with all responses
    const headers = {
      'X-RateLimit-Limit': limit.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': reset.toString()
    };

    // If rate limit is exceeded, return 429 Too Many Requests
    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers }
      );
    }

    // Request is allowed, adding rate limit headers to the request for downstream handlers
    request.headers.set('X-RateLimit-Limit', limit.toString());
    request.headers.set('X-RateLimit-Remaining', remaining.toString());
    request.headers.set('X-RateLimit-Reset', reset.toString());

    return undefined;
  } catch (error) {
    console.error('Rate limiting error:', error);
    // If rate limiting fails, allow the request to proceed
    return undefined;
  }
}