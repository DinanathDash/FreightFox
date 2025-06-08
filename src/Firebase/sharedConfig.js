/**
 * Shared Firebase configuration for both browser and Node environments
 * This file replaces separate configurations in Config.js, nodeConfig.js, and seedConfig.js
 */
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Check if running in browser or Node environment
const isBrowser = typeof window !== 'undefined';

// Load environment variables from .env file in Node.js environment
if (!isBrowser) {
  try {
    import('dotenv').then(dotenv => {
      dotenv.config();
    });
  } catch (error) {
    console.log('dotenv not available, continuing without it');
  }
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
export const db = getFirestore(app);

export default { auth, db };
