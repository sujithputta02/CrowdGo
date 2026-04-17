/**
 * Advanced Rate Limiting
 * Implements sliding window rate limiting with IP-based tracking
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
  requests: number[];
}

const rateLimitMap = new Map<string, RateLimitEntry>();

const LIMIT = 100; // Max requests per window
const WINDOW_MS = 60 * 1000; // 1 minute window
const CLEANUP_INTERVAL = 5 * 60 * 1000; // Cleanup every 5 minutes

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now > entry.resetTime + WINDOW_MS) {
      rateLimitMap.delete(key);
    }
  }
}, CLEANUP_INTERVAL);

/**
 * Get client IP from request
 */
export function getClientIp(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return headers.get('x-real-ip') || '127.0.0.1';
}

/**
 * Check if request is rate limited
 */
export function isRateLimited(ip: string): boolean {
  const now = Date.now();
  let entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetTime) {
    // Create new window
    entry = {
      count: 1,
      resetTime: now + WINDOW_MS,
      requests: [now],
    };
    rateLimitMap.set(ip, entry);
    return false;
  }

  // Sliding window: remove old requests outside current window
  entry.requests = entry.requests.filter((time) => now - time < WINDOW_MS);

  if (entry.requests.length >= LIMIT) {
    return true;
  }

  entry.requests.push(now);
  entry.count = entry.requests.length;
  return false;
}

/**
 * Get remaining requests for IP
 */
export function getRemainingRequests(ip: string): number {
  const entry = rateLimitMap.get(ip);
  if (!entry) {
    return LIMIT;
  }

  const now = Date.now();
  if (now > entry.resetTime) {
    return LIMIT;
  }

  return Math.max(0, LIMIT - entry.requests.length);
}

/**
 * Get reset time for IP
 */
export function getResetTime(ip: string): number {
  const entry = rateLimitMap.get(ip);
  return entry?.resetTime || Date.now() + WINDOW_MS;
}
