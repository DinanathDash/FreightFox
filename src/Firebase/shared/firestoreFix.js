// Direct Firestore Fix Utility
// This provides tools for fixing Firestore connection issues in production
// Import for immediate use: import { fixFirestoreQuery } from '../shared/firestoreFix'

import { getFirestore, initializeFirestore } from 'firebase/firestore';
import { app } from './sharedConfig';

// Production-optimized Firestore instance
let prodDb = null;

// Only create the production DB in production environment
if (import.meta.env.PROD) {
  try {
    prodDb = initializeFirestore(app, {
      experimentalForceLongPolling: true,
      experimentalAutoDetectLongPolling: false,
      cacheSizeBytes: 50 * 1024 * 1024,
      ignoreUndefinedProperties: true
    });
    console.log('[FreightFox] Production-optimized Firestore instance created');
  } catch (e) {
    console.warn('[FreightFox] Could not create optimized Firestore instance', e);
    // Fallback to regular instance
    prodDb = getFirestore(app);
  }
} else {
  // In development, use the regular instance
  prodDb = getFirestore(app);
}

// Export the production-optimized DB
export const prodFirestore = prodDb;

/**
 * Fix a Firestore query by using the production-optimized instance
 * This can be used as a direct fix for queries that are failing
 * 
 * Example usage:
 * import { fixFirestoreQuery } from './firestoreFix';
 * 
 * // Instead of this:
 * const querySnapshot = await getDocs(collection(db, 'Users'));
 * 
 * // Do this:
 * const querySnapshot = await fixFirestoreQuery(
 *   (db) => getDocs(collection(db, 'Users'))
 * );
 */
export async function fixFirestoreQuery(queryFn) {
  try {
    // Use the production DB to execute the query
    return await queryFn(prodDb);
  } catch (error) {
    console.warn('[FreightFox] Error with optimized Firestore query, retrying...', error);
    
    // If that fails, wait and try again
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    try {
      return await queryFn(prodDb);
    } catch (retryError) {
      console.error('[FreightFox] Firestore query failed after retry', retryError);
      throw retryError;
    }
  }
}

/**
 * Simple utility to convert a regular Firestore reference to use the production DB
 * 
 * Example usage:
 * import { convertToProdRef } from './firestoreFix';
 * 
 * const regularRef = doc(db, 'Users', 'user123');
 * const fixedRef = convertToProdRef(regularRef);
 */
export function convertToProdRef(regularRef) {
  // Only needed in production
  if (!import.meta.env.PROD) {
    return regularRef;
  }
  
  try {
    const { doc } = require('firebase/firestore');
    
    // Extract path from regular reference
    const path = regularRef.path;
    if (!path) return regularRef;
    
    // Split path to get collection and document ID
    const parts = path.split('/');
    if (parts.length !== 2) return regularRef;
    
    // Create a new reference using the production DB
    return doc(prodDb, parts[0], parts[1]);
  } catch (e) {
    console.warn('[FreightFox] Could not convert Firestore reference', e);
    return regularRef;
  }
}
