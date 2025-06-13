/**
 * This script syncs Firebase Authentication users to Firestore Users collection
 * before generating historical orders.
 */

import { db, auth } from './sharedConfig.js';
import { 
  collection, 
  getDocs, 
  getDoc,
  setDoc,
  doc,
  serverTimestamp,
  query,
  where 
} from 'firebase/firestore';
import { listUsers } from 'firebase-admin/auth';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Setup paths for loading .env and service account file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '../../');
const envPath = resolve(rootDir, '.env');

// Load environment variables
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

// Path to service account file (if it exists)
let serviceAccountPath;
if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
} else {
  serviceAccountPath = resolve(rootDir, 'service-account.json');
}

// Initialize Firebase Admin SDK
let admin;
try {
  let serviceAccount;
  
  if (fs.existsSync(serviceAccountPath)) {
    serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
  } else {
    // Try to use environment variables for service account
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      try {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      } catch (e) {
        console.error('Error parsing FIREBASE_SERVICE_ACCOUNT:', e);
      }
    } else {
      // No service account available
      throw new Error('Service account required to list auth users');
    }
  }
  
  // Initialize admin SDK
  const adminApp = initializeApp({
    credential: cert(serviceAccount)
  }, 'admin');
  
  admin = {
    auth: () => import('firebase-admin/auth').then(auth => auth.getAuth(adminApp)),
    firestore: getFirestore(adminApp)
  };
} catch (error) {
  console.error('Failed to initialize Firebase Admin SDK:', error);
  throw error;
}

/**
 * Fetch all users from Firebase Authentication
 */
async function getAuthUsers() {
  try {
    const authInstance = await admin.auth();
    const maxResults = 1000; // Adjust as needed
    let users = [];
    
    // List all users (Firebase Authentication limits to 1000 users per request)
    let listUsersResult = await authInstance.listUsers(maxResults);
    users = users.concat(listUsersResult.users);
    return users;
  } catch (error) {
    console.error('Error fetching users from Firebase Authentication:', error);
    throw error;
  }
}

/**
 * Check if a user already exists in Firestore
 */
async function checkUserExistsInFirestore(uid) {
  try {
    const userDocRef = doc(db, 'Users', uid);
    const userDoc = await getDoc(userDocRef);
    return userDoc.exists();
  } catch (error) {
    console.error('Error checking if user exists in Firestore:', error);
    return false;
  }
}

/**
 * Create or update user records in Firestore based on Authentication data
 */
async function syncUsersToFirestore() {
  try {
    // Get users from Authentication
    const authUsers = await getAuthUsers();
    
    if (authUsers.length === 0) {
      console.log('No authenticated users found!');
      return { success: false, error: 'No auth users found' };
    }
    
    // Process each auth user
    const syncedUsers = [];
    
    for (const authUser of authUsers) {
      try {
        const { uid, email, displayName, photoURL, phoneNumber, metadata } = authUser;
        
        // Basic user data from Auth
        const userData = {
          uid,
          email: email || '',
          name: displayName || email.split('@')[0], // Use email prefix if no display name
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
        };
        
        // Add optional fields if they exist
        if (photoURL) userData.profilePhoto = photoURL;
        if (phoneNumber) userData.phone = phoneNumber;
        
        // Set random address if none exists
        if (!userData.address) {
          const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad'];
          const states = ['Maharashtra', 'NCT', 'Karnataka', 'Tamil Nadu', 'Telangana'];
          const randomIndex = Math.floor(Math.random() * cities.length);
          
          userData.address = `${Math.floor(100 + Math.random() * 900)} Main St, ${cities[randomIndex]}, ${states[randomIndex]}`;
        }
        
        // Set document in Firestore using UID as document ID
        await setDoc(doc(db, 'Users', uid), userData, { merge: true });
        
        syncedUsers.push({ id: uid, ...userData });
      } catch (error) {
        console.error(`Error syncing user `, error);
      }
    }
    
    return { success: true, userCount: syncedUsers.length, users: syncedUsers };
    
  } catch (error) {
    console.error('Error syncing users to Firestore:', error);
    return { success: false, error: error.message };
  }
}

// Export the sync function
export { syncUsersToFirestore };
