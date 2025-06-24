import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";

// Disable Firebase internal console logs
if (window.console) {
  // Save original console methods
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;

  // Filter Firebase logs
  console.log = function(...args) {
    if (args.length > 0 && 
        (typeof args[0] === 'string' && 
         (args[0].includes('Firebase') || 
          args[0].includes('Firestore') || 
          args[0].includes('user') || 
          args[0].includes('User') || 
          args[0].includes('Auth')))) {
      // Skip Firebase-related logs
      return;
    }
    originalConsoleLog.apply(console, args);
  };
  
  console.error = function(...args) {
    if (args.length > 0 && 
        (typeof args[0] === 'string' && 
         (args[0].includes('Firebase') || 
          args[0].includes('Firestore') || 
          args[0].includes('user') || 
          args[0].includes('User') || 
          args[0].includes('Auth')))) {
      // Skip Firebase-related errors
      return;
    }
    originalConsoleError.apply(console, args);
  };

  console.warn = function(...args) {
    if (args.length > 0 && 
        (typeof args[0] === 'string' && 
         (args[0].includes('Firebase') || 
          args[0].includes('Firestore') || 
          args[0].includes('user') || 
          args[0].includes('User') || 
          args[0].includes('Auth') ||
          args[0].includes('ResponsiveContainer') ||
          args[0].includes('width') ||
          args[0].includes('height')))) {
      // Skip Firebase-related warnings and chart warnings
      return;
    }
    originalConsoleWarn.apply(console, args);
  };
}

// Check if running in browser or Node environment
const isBrowser = typeof window !== 'undefined';

// Load environment variables from .env file in Node.js environment
// Using a function to avoid top-level await
async function loadDotEnv() {
  if (!isBrowser) {
    try {
      // Use dynamic import for ESM compatibility
      const dotenvModule = await import('dotenv');
      dotenvModule.config();
    } catch (error) {
      console.log('dotenv not available, continuing without it');
    }
  }
}

// Execute but don't await at the top level
if (!isBrowser) {
  loadDotEnv().catch(err => console.error('Error loading dotenv:', err));
}

// Get config based on environment
function getFirebaseConfig() {
  if (isBrowser) {
    // Browser environment (Vite)
    return {
      apiKey: import.meta.env.VITE_FIREBASE_API,
      authDomain: import.meta.env.VITE_FIREBASE_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
      measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
    };
  } else {
    // Node.js environment
    try {
      // For Node.js, load from process.env
      return {
        apiKey: process.env.VITE_FIREBASE_API,
        authDomain: process.env.VITE_FIREBASE_DOMAIN,
        projectId: process.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.VITE_FIREBASE_APP_ID,
        measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID,
      };
    } catch (error) {
      console.error('Error loading Firebase config:', error);
      throw new Error('Failed to load Firebase configuration');
    }
  }
}

// Initialize Firebase
const firebaseConfig = getFirebaseConfig();
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Initialize Firestore with improved connection handling for production
const initializeFirestore = () => {
  try {
    // Import needed to prevent bundling issues
    const { getFirestore, initializeFirestore } = require('firebase/firestore');
    
    // Use basic initialization for development
    if (!isBrowser || !import.meta.env.PROD) {
      return getFirestore(app);
    }
    
    // In production, use more robust configuration
    return initializeFirestore(app, {
      // These settings can help with connection issues
      experimentalForceLongPolling: true,
      experimentalAutoDetectLongPolling: false, // Set to false to fix 400 errors in Safari/Chrome
      cacheSizeBytes: 1048576 * 50, // 50 MB cache
      ignoreUndefinedProperties: true,
    });
  } catch (error) {
    // Fallback to basic initialization if advanced options fail
    console.warn('Using fallback Firestore initialization');
    return getFirestore(app);
  }
};

// Export Firestore instance
export const db = getFirestore(app);
export const functions = getFunctions(app);
export { app };

export default { auth, db, functions, app };
