import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// In-memory store for rate limiting (Note: resets on serverless cold starts, but adequate for MVP/VPS)
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute in milliseconds
const MAX_REQUESTS_PER_WINDOW = 100; // 100 requests per minute per IP

export function middleware(request: NextRequest) {
  // Only apply rate limiting to actual API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Extract IP address from headers (falls back to a default if not found)
    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
    const currentTime = Date.now();

    const rateLimitInfo = rateLimitMap.get(ip) || { count: 0, lastReset: currentTime };

    // Reset loop if window has passed
    if (currentTime - rateLimitInfo.lastReset > RATE_LIMIT_WINDOW) {
      rateLimitInfo.count = 0;
      rateLimitInfo.lastReset = currentTime;
    }

    rateLimitInfo.count += 1;
    rateLimitMap.set(ip, rateLimitInfo);

    if (rateLimitInfo.count > MAX_REQUESTS_PER_WINDOW) {
      return NextResponse.json(
        { error: "Too many requests, please try again later." },
        { status: 429, headers: { 'Retry-After': '60' } }
      );
    }
  }

  return NextResponse.next();
}

// Ensure the middleware only runs on API routes
export const config = {
  matcher: '/api/:path*',
};