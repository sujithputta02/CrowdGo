/**
 * CSRF Protection
 * Implements token-based CSRF protection for state-changing operations
 */

import { NextRequest } from 'next/server';
import { logger } from '../logger';

// CSRF token storage (in production, use Redis or similar)
const csrfTokens = new Map<string, { token: string; expires: number }>();

const TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour
const CLEANUP_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

// Cleanup expired tokens periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of csrfTokens.entries()) {
    if (now > value.expires) {
      csrfTokens.delete(key);
    }
  }
}, CLEANUP_INTERVAL_MS);

/**
 * Generate a CSRF token for a session
 */
export function generateCSRFToken(sessionId: string): string {
  const token = generateRandomToken();
  csrfTokens.set(sessionId, {
    token,
    expires: Date.now() + TOKEN_EXPIRY_MS,
  });
  return token;
}

/**
 * Verify CSRF token from request
 */
export function verifyCSRFToken(sessionId: string, token: string): boolean {
  const stored = csrfTokens.get(sessionId);
  
  if (!stored) {
    logger.warn('CSRF token not found', { sessionId });
    return false;
  }

  if (Date.now() > stored.expires) {
    csrfTokens.delete(sessionId);
    logger.warn('CSRF token expired', { sessionId });
    return false;
  }

  // Constant-time comparison to prevent timing attacks
  return constantTimeCompare(stored.token, token);
}

/**
 * Extract CSRF token from request headers or body
 */
export function extractCSRFToken(request: NextRequest): string | null {
  // Check X-CSRF-Token header first
  const headerToken = request.headers.get('X-CSRF-Token');
  if (headerToken) {
    return headerToken;
  }

  // Check csrf_token in body (for form submissions)
  // Note: This requires the body to be parsed first
  return null;
}

/**
 * Validate CSRF token for state-changing requests
 */
export function validateCSRF(request: NextRequest, sessionId: string): boolean {
  // Only validate for state-changing methods
  const method = request.method;
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    return true; // No CSRF validation needed for safe methods
  }

  const token = extractCSRFToken(request);
  if (!token) {
    logger.warn('CSRF token missing', { method, path: request.nextUrl.pathname });
    return false;
  }

  return verifyCSRFToken(sessionId, token);
}

/**
 * Generate a cryptographically secure random token
 */
function generateRandomToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Buffer.from(array).toString('base64url');
}

/**
 * Constant-time string comparison to prevent timing attacks
 */
function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

/**
 * Revoke CSRF token for a session
 */
export function revokeCSRFToken(sessionId: string): void {
  csrfTokens.delete(sessionId);
}
