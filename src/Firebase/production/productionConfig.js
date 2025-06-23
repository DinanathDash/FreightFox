// Production Firebase configuration
// This file contains optimized settings for Firebase in production environments

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";

// Firebase configuration - use the same keys as in sharedConfig.js
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API,
  authDomain: import.meta.env.VITE_FIREBASE_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
const auth = getAuth(app);

// Initialize Firestore with production-optimized settings
let db;
try {
  // Use settings that are known to work better in production
  db = initializeFirestore(app, {
    experimentalForceLongPolling: true,
    experimentalAutoDetectLongPolling: true,
    cacheSizeBytes: 50 * 1024 * 1024,
    ignoreUndefinedProperties: true
  });
  
  console.log("[FreightFox] Initialized production-optimized Firestore");
} catch (error) {
  console.error("[FreightFox] Failed to initialize optimized Firestore:", error);
  // Fall back to regular initialization if optimized settings fail
  const { getFirestore } = require('firebase/firestore');
  db = getFirestore(app);
}

// Initialize Functions
const functions = getFunctions(app);

// Export the initialized services
export { app, auth, db, functions };
export default { app, auth, db, functions };
