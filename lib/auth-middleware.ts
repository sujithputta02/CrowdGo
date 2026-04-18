/**
 * Authentication Middleware
 * Verifies Firebase tokens and user permissions with RBAC and audit logging
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { ApiResponseHandler } from './api-response';
import { logger } from './logger';
import { logAuthAttempt, logAuthorizationCheck } from './security/audit-logger';
import { getClientIp } from './rate-limiter';

// Initialize Firebase Admin
const firebaseAdminConfig = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

if (!getApps().length && firebaseAdminConfig.projectId) {
  initializeApp({
    credential: cert(firebaseAdminConfig as any),
  });
}

export type UserRole = 'user' | 'admin' | 'ops' | 'staff';

export interface AuthenticatedUser {
  uid: string;
  email?: string;
  role: UserRole;
  customClaims?: Record<string, unknown>;
}

/**
 * Verify Firebase ID token from Authorization header
 */
export async function verifyToken(request: NextRequest): Promise<AuthenticatedUser | null> {
  const ip = getClientIp(request.headers);
  
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      await logAuthAttempt('anonymous', ip, false, 'Missing or invalid Authorization header');
      return null;
    }

    const token = authHeader.substring(7);
    const decodedToken = await getAuth().verifyIdToken(token);
    
    // Extract role from custom claims (default to 'user')
    const role = (decodedToken.role as UserRole) || 'user';
    
    const user: AuthenticatedUser = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      role,
      customClaims: decodedToken,
    };

    await logAuthAttempt(user.uid, ip, true);
    return user;
  } catch (error) {
    logger.error('Token verification failed', error);
    await logAuthAttempt('unknown', ip, false, 'Token verification failed');
    return null;
  }
}

/**
 * Middleware to require authentication
 */
export async function requireAuth(request: NextRequest): Promise<NextResponse | null> {
  const user = await verifyToken(request);
  if (!user) {
    return ApiResponseHandler.unauthorized('Invalid or missing authentication token');
  }
  return null;
}

/**
 * Middleware to require specific role
 */
export async function requireRole(
  request: NextRequest,
  allowedRoles: UserRole[]
): Promise<{ user: AuthenticatedUser; response: null } | { user: null; response: NextResponse }> {
  const user = await verifyToken(request);
  
  if (!user) {
    return {
      user: null,
      response: ApiResponseHandler.unauthorized('Invalid or missing authentication token'),
    };
  }

  if (!allowedRoles.includes(user.role)) {
    await logAuthorizationCheck(
      user.uid,
      request.nextUrl.pathname,
      request.method,
      false,
      `Required role: ${allowedRoles.join(' or ')}, user role: ${user.role}`
    );
    
    return {
      user: null,
      response: ApiResponseHandler.forbidden('Insufficient permissions'),
    };
  }

  await logAuthorizationCheck(
    user.uid,
    request.nextUrl.pathname,
    request.method,
    true
  );

  return { user, response: null };
}

/**
 * Check if user owns a resource
 */
export function checkResourceOwnership(
  user: AuthenticatedUser,
  resourceOwnerId: string
): boolean {
  // Admins can access any resource
  if (user.role === 'admin') {
    return true;
  }

  // Users can only access their own resources
  return user.uid === resourceOwnerId;
}

/**
 * Middleware to verify Pub/Sub webhook signature
 */
export function verifyPubSubToken(request: NextRequest): boolean {
  const token = request.headers.get('X-PubSub-Secret');
  const expectedToken = process.env.PUBSUB_VERIFICATION_TOKEN;

  if (!token || !expectedToken) {
    return false;
  }

  // Use constant-time comparison to prevent timing attacks
  return constantTimeCompare(token, expectedToken);
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
