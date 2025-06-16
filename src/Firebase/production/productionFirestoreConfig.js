// Firestore production configuration with improved connection handling
import { initializeApp } from "firebase/app";
import { getFirestore, initializeFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getFunctions } from "firebase/functions";

// This file is only imported in production builds

// Get Firebase config from environment variables
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

// Initialize Authentication
const auth = getAuth(app);

// Initialize Firestore with production-optimized settings
let db;
try {
  // Try to initialize with enhanced settings for improved connection stability
  db = initializeFirestore(app, {
    experimentalForceLongPolling: true,
    experimentalAutoDetectLongPolling: true,
    cacheSizeBytes: 1048576 * 50, // 50 MB cache
    ignoreUndefinedProperties: true,
  });
  
  console.log("Using enhanced Firestore configuration for production");
} catch (error) {
  // Fallback to standard initialization if enhanced settings fail
  console.warn("Enhanced Firestore initialization failed, using standard configuration", error);
  db = getFirestore(app);
}

// Initialize Functions
const functions = getFunctions(app);

// Export initialized services
export { auth, db, functions, app };
export default { auth, db, functions, app };
