/**
 * Firebase Authentication ID Strategy Enforcement
 * 
 * This module ensures that all users in Firestore have document IDs that match their Firebase Auth UIDs.
 * It provides functions to:
 * 1. Check for mismatches between Firebase Auth UIDs and Firestore document IDs
 * 2. Correct such mismatches by moving data to documents with correct IDs
 * 3. Provide hooks that can be used in the application to ensure proper UID usage
 */

import { db } from '../shared/sharedConfig.js';
import { 
  collection, 
  getDocs, 
  getDoc,
  setDoc,
  doc,
  deleteDoc,
  serverTimestamp 
} from 'firebase/firestore';

/**
 * Create or update a user in Firestore using their Firebase Auth UID as the document ID
 * 
 * @param {Object} user - Firebase Auth user object
 * @param {Object} additionalData - Additional data to store in the user document
 * @returns {Promise<Object>} - The created/updated user document
 */
export async function storeUserWithAuthId(user, additionalData = {}) {
  if (!user || !user.uid) {
    throw new Error('Invalid user object or missing UID');
  }
  
  try {
    // Prepare user data
    const userData = {
      uid: user.uid, // Always include uid field for consistency and querying
      email: user.email || '',
      displayName: user.displayName || '',
      photoURL: user.photoURL || null,
      lastUpdated: serverTimestamp(),
      ...additionalData
    };
    
    // Create/update document with the Firebase Auth UID as the document ID
    const userRef = doc(db, 'Users', user.uid);
    
    // Check if user exists first
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      // Update existing user (preserving existing fields)
      await setDoc(userRef, userData, { merge: true });
    } else {
      // Create new user
      userData.createdAt = serverTimestamp();
      await setDoc(userRef, userData);
    }
    
    return {
      id: user.uid,
      ...userData
    };
  } catch (error) {
    console.error('Error storing user with Auth ID:', error);
    throw error;
  }
}

/**
 * Find all users in the Firestore database where the document ID doesn't match the uid field
 * 
 * @returns {Promise<Array>} Array of users with mismatched IDs
 */
export async function findUserIdMismatches() {
  try {
    // Get all users from Firestore
    const usersCollection = collection(db, 'Users');
    const userSnapshot = await getDocs(usersCollection);
    
    const users = [];
    userSnapshot.forEach(doc => {
      users.push({ id: doc.id, ...doc.data() });
    });
    
    // Find users where document ID doesn't match uid field
    const mismatchedUsers = users.filter(user => 
      user.uid && user.uid !== user.id
    );
    
    return mismatchedUsers;
  } catch (error) {
    console.error('Error finding user ID mismatches:', error);
    throw error;
  }
}

/**
 * Create a Firebase document reference using the auth UID pattern
 * Use this whenever creating a reference to a user document
 * 
 * @param {string} userId - The user's Firebase Auth UID
 * @returns {Object} - Firestore document reference
 */
export function getUserDocRef(userId) {
  return doc(db, 'Users', userId);
}

export default {
  storeUserWithAuthId,
  findUserIdMismatches,
  getUserDocRef
};
