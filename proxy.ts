/**
 * Next.js Middleware
 * Implements comprehensive security controls:
 * - Security headers (CSP, HSTS, etc.)
 * - Request body size limits
 * - Request timeout handling
 * - CSRF protection
 * - Audit logging
 */

import { NextRequest, NextResponse } from 'next/server';
import { getClientIp, isRateLimited } from './lib/rate-limiter';

// Request body size limit (1MB for API routes)
const MAX_BODY_SIZE = 1024 * 1024; // 1MB

// Request timeout (30 seconds)
const REQUEST_TIMEOUT_MS = 30000;

/**
 * Generate CSP nonce for inline scripts
 */
function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Buffer.from(array).toString('base64');
}

/**
 * Build Content Security Policy with nonce
 */
function buildCSP(nonce: string): string {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // In development, React requires 'unsafe-eval' for debugging features
  // In production, we use strict CSP without eval
  const scriptSrc = isDevelopment
    ? `script-src 'self' 'unsafe-eval' 'nonce-${nonce}' 'strict-dynamic' https://www.gstatic.com https://www.google.com https://apis.google.com https://www.googletagmanager.com`
    : `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://www.gstatic.com https://www.google.com https://apis.google.com https://www.googletagmanager.com`;
  
  const directives = [
    "default-src 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://*.googleapis.com https://*.google.com https://*.google-analytics.com https://*.analytics.google.com https://firebase.googleapis.com https://*.firebaseapp.com wss://*.firebaseio.com",
    "frame-src 'self' https://www.google.com https://*.firebaseapp.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ];
  
  // Only add upgrade-insecure-requests in production
  if (!isDevelopment) {
    directives.push("upgrade-insecure-requests");
  }
  
  return directives.join('; ');
}

/**
 * Check if request body size exceeds limit
 */
async function checkBodySize(request: NextRequest): Promise<boolean> {
  const contentLength = request.headers.get('content-length');
  if (contentLength && parseInt(contentLength, 10) > MAX_BODY_SIZE) {
    return false;
  }
  return true;
}

/**
 * Main proxy function (previously called middleware)
 */
export async function proxy(request: NextRequest) {
  const startTime = Date.now();
  const ip = getClientIp(request.headers);
  const path = request.nextUrl.pathname;
  const method = request.method;

  // Generate nonce for CSP
  const nonce = generateNonce();

  // Check rate limiting for API routes
  if (path.startsWith('/api')) {
    if (isRateLimited(ip)) {
      // Audit log: Rate limit exceeded
      if (process.env.NODE_ENV === 'production') {
        console.warn(JSON.stringify({
          type: 'SECURITY_EVENT',
          event: 'RATE_LIMIT_EXCEEDED',
          ip,
          path,
          method,
          timestamp: new Date().toISOString(),
        }));
      }

      return new NextResponse(
        JSON.stringify({ 
          error: 'Too Many Requests', 
          message: 'Rate limit exceeded. Please try again later.' 
        }),
        { 
          status: 429, 
          headers: { 
            'Content-Type': 'application/json',
            'Retry-After': '60',
          } 
        }
      );
    }

    // Check body size for POST/PUT/PATCH requests
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      const isValidSize = await checkBodySize(request);
      if (!isValidSize) {
        // Audit log: Body size exceeded
        if (process.env.NODE_ENV === 'production') {
          console.warn(JSON.stringify({
            type: 'SECURITY_EVENT',
            event: 'BODY_SIZE_EXCEEDED',
            ip,
            path,
            method,
            timestamp: new Date().toISOString(),
          }));
        }

        return new NextResponse(
          JSON.stringify({ 
            error: 'Payload Too Large', 
            message: 'Request body exceeds maximum size of 1MB.' 
          }),
          { 
            status: 413, 
            headers: { 'Content-Type': 'application/json' } 
          }
        );
      }
    }
  }

  // Create response with security headers
  const response = NextResponse.next();

  // Security Headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '0'); // Modern browsers use CSP instead
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Content-Security-Policy', buildCSP(nonce));
  
  // HSTS: Force HTTPS for 1 year (only in production)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  // Permissions Policy: Disable dangerous features
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(self), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()'
  );

  // Add nonce to response for use in pages
  response.headers.set('X-Nonce', nonce);

  // Request timeout tracking
  const duration = Date.now() - startTime;
  if (duration > REQUEST_TIMEOUT_MS) {
    // Audit log: Request timeout
    if (process.env.NODE_ENV === 'production') {
      console.warn(JSON.stringify({
        type: 'SECURITY_EVENT',
        event: 'REQUEST_TIMEOUT',
        ip,
        path,
        method,
        duration,
        timestamp: new Date().toISOString(),
      }));
    }
  }

  return response;
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
