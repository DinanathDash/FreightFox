import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// For the seeding script only - using environment variables from .env file
const firebaseConfig = {
  apiKey: "AIzaSyAEAv9OHmNZRWZ2lQ0KtLQkxycsssoWdBc",
  authDomain: "freight-fox.firebaseapp.com",
  projectId: "freight-fox",
  storageBucket: "freight-fox.firebasestorage.app",
  messagingSenderId: "219912613482",
  appId: "1:219912613482:web:7a3780aa0009c286776413",
  measurementId: "G-ZBEKHH3XX3"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
