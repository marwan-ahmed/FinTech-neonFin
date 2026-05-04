import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

// Create a new ratelimiter, that allows 100 requests per 1 minute
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(100, "1 m"),
});

export async function middleware(request: NextRequest) {
  // Only apply rate limiting to actual API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Extract IP address from headers (falls back to a default if not found)
    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";

    // Skip rate limiting if Redis env vars are not set (e.g. in local dev without Upstash)
    if (process.env.UPSTASH_REDIS_REST_URL) {
      const { success, pending, limit, reset, remaining } = await ratelimit.limit(`ratelimit_${ip}`);
      
      if (!success) {
        return NextResponse.json(
          { error: "Too many requests, please try again later." },
          { 
            status: 429, 
            headers: { 
              'Retry-After': '60',
              'X-RateLimit-Limit': limit.toString(),
              'X-RateLimit-Remaining': remaining.toString(),
              'X-RateLimit-Reset': reset.toString(),
            } 
          }
        );
      }
    }
  }

  return NextResponse.next();
}

// Ensure the middleware only runs on API routes
export const config = {
  matcher: '/api/:path*',
};