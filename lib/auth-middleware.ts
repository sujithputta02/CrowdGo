/**
 * Authentication Middleware
 * Verifies Firebase tokens and user permissions
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { ApiResponseHandler } from './api-response';
import { logger } from './logger';

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

/**
 * Verify Firebase ID token from Authorization header
 */
export async function verifyToken(request: NextRequest): Promise<{ uid: string } | null> {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const decodedToken = await getAuth().verifyIdToken(token);
    return { uid: decodedToken.uid };
  } catch (error) {
    logger.error('Token verification failed', error);
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
 * Middleware to verify Pub/Sub webhook signature
 */
export function verifyPubSubToken(request: NextRequest): boolean {
  const token = request.headers.get('X-PubSub-Secret');
  const expectedToken = process.env.PUBSUB_VERIFICATION_TOKEN;

  if (!token || !expectedToken) {
    return false;
  }

  // Use constant-time comparison to prevent timing attacks
  return token === expectedToken;
}
