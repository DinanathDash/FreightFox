// Production Firestore Connection Handler
// This file provides a production-specific fix for Firestore 400 Bad Request errors
// It's designed to intercept and fix Firestore connection issues in production only

// We don't want to modify any development code, so this is a completely separate module
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { app } from '../shared/sharedConfig';

/**
 * Creates a production-optimized Firestore instance
 * This is a drop-in replacement for the regular db instance
 */
export function createProductionFirestoreDb() {
  // Only apply fixes in production environment
  if (import.meta.env.PROD) {
    try {
      // This is required to access these specific methods
      const { initializeFirestore, CACHE_SIZE_UNLIMITED } = require('firebase/firestore');
      
      // Create a production-optimized Firestore instance
      console.log("[FreightFox] Initializing production-optimized Firestore connection");
      
      const db = initializeFirestore(app, {
        // Force long polling which is more reliable in problematic network environments
        experimentalForceLongPolling: true,
        // Disable auto-detection to prevent switching to less reliable transport methods
        experimentalAutoDetectLongPolling: false,
        // Increase cache size for better offline capabilities
        cacheSizeBytes: 50 * 1024 * 1024, // 50MB
        // Improve error handling for undefined fields
        ignoreUndefinedProperties: true
      });
      
      return db;
    } catch (error) {
      console.warn("[FreightFox] Failed to initialize production Firestore with optimized settings, falling back to default", error);
      // Fall back to default configuration if optimization fails
      return getFirestore(app);
    }
  } else {
    // In development, use the regular db instance
    return getFirestore(app);
  }
}

/**
 * Production-ready Firestore instance
 * This is optimized to handle connection issues in production environments
 */
export const productionDb = createProductionFirestoreDb();

/**
 * Apply this function to wrap any Firestore calls that may be failing
 * It adds additional error handling and connection retry logic
 */
export function withFirestoreErrorHandling(firestorePromise) {
  // Only apply in production
  if (!import.meta.env.PROD) {
    return firestorePromise;
  }
  
  return firestorePromise
    .catch(error => {
      // Handle specific Firestore connection errors
      if (error?.code?.includes('unavailable') || 
          error?.message?.includes('failed') ||
          error?.message?.includes('network') ||
          error?.message?.includes('transport')) {
        
        console.warn("[FreightFox] Handling Firestore connection error:", error);
        
        // Wait and retry once after a short delay
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            firestorePromise
              .then(resolve)
              .catch(reject);
          }, 2000);
        });
      }
      
      // Re-throw other errors
      throw error;
    });
}
