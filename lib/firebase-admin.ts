import * as admin from 'firebase-admin';
import path from 'path';
import { logger } from './logger';

/**
 * Initializes the Firebase Admin SDK for server-side operations (FCM, Firestore, etc.)
 */
export function getFirebaseAdmin() {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  const keyPath = path.join(process.cwd(), 'firebase-key.json');

  try {
    return admin.initializeApp({
      credential: admin.credential.cert(keyPath),
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
  } catch (error) {
    logger.critical('Failed to initialize Firebase Admin SDK', error);
    throw error;
  }
}

export const adminAuth = () => getFirebaseAdmin().auth();
export const adminMessaging = () => getFirebaseAdmin().messaging();
export const db = () => getFirebaseAdmin().firestore();
