/**
 * Firestore Type Definitions
 * Provides type safety for Firestore operations
 */

import { 
  DocumentData, 
  QueryDocumentSnapshot, 
  DocumentSnapshot,
  Timestamp 
} from 'firebase/firestore';

/**
 * Helper type to convert Firestore Timestamp to Date
 */
export type FirestoreTimestamp = Timestamp | Date;

/**
 * Helper to convert Firestore document to typed data
 */
export function firestoreDocToData<T>(doc: QueryDocumentSnapshot<DocumentData> | DocumentSnapshot<DocumentData>): T {
  return {
    ...doc.data(),
    id: doc.id,
  } as T;
}

/**
 * Helper to convert Firestore Timestamp to Date
 */
export function timestampToDate(timestamp: FirestoreTimestamp): Date {
  if (timestamp instanceof Date) {
    return timestamp;
  }
  return timestamp.toDate();
}

/**
 * Type for Firestore query results
 */
export interface FirestoreQueryResult<T> {
  docs: T[];
  empty: boolean;
  size: number;
}
