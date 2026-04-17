import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple in-memory rate limiting map
// Key: IP address, Value: { count: number, resetTime: number }
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const LIMIT = 50; // Max requests per window
const WINDOW_MS = 60 * 1000; // 1 minute window

/**
 * Production Security Proxy
 * Implements Tier-1 security measures: Rate Limiting, Header Injection, and Boundary Protection.
 * 
 * @param request - The incoming Next.js request object
 * @returns NextResponse with security headers or 429 Rate Limit error
 */
export function proxy(request: NextRequest) {
  // Only rate limit API routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
    const now = Date.now();
    
    let rateData = rateLimitMap.get(ip);
    
    if (!rateData || now > rateData.resetTime) {
      rateData = { count: 0, resetTime: now + WINDOW_MS };
    }
    
    rateData.count++;
    rateLimitMap.set(ip, rateData);
    
    if (rateData.count > LIMIT) {
      return new NextResponse(
        JSON.stringify({ error: 'Too Many Requests', message: 'Rate limit exceeded. Please try again in a minute.' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Security Header Injection
    const response = NextResponse.next();
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Advanced Production Headers
    response.headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' *.google.com *.googleapis.com *.gstatic.com; style-src 'self' 'unsafe-inline' fonts.googleapis.com; img-src 'self' data: *.googleapis.com *.gstatic.com; connect-src 'self' *.googleapis.com firebase.googleapis.com");
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)');
    
    return response;
  }

  return NextResponse.next();
}

// Config for matching paths
export const config = {
  matcher: '/api/:path*',
};
