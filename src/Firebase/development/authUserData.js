import { auth, db } from '../shared/sharedConfig.js';
import { 
  collection, 
  getDocs,
  query,
  where,
  doc,
  getDoc
} from 'firebase/firestore';

/**
 * Fetch all authenticated users from Firestore
 * This function retrieves all the users from the Firestore 'Users' collection
 * which should have been created during the authentication process
 */
export async function getAuthenticatedUsers() {
  try {
    console.log('Fetching authenticated users from Firestore...');
    const usersCollection = collection(db, 'Users');
    const userSnapshot = await getDocs(usersCollection);
    
    const users = [];
    userSnapshot.forEach(doc => {
      users.push({ id: doc.id, ...doc.data() });
    });

    return users;
  } catch (error) {
    console.error('Error fetching authenticated users:', error);
    throw error;
  }
}

/**
 * Fetch a specific user by ID
 * @param {string} userId - The user ID to fetch
 * @returns {Object} The user data or null if not found
 */
export async function getUserById(userId) {
  try {
    const userDoc = await getDoc(doc(db, 'Users', userId));
    
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() };
    } else {
      return null;
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Get current authenticated user
 * This can be used in the frontend to get the currently logged-in user
 */
export function getCurrentUser() {
  return new Promise((resolve, reject) => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      unsubscribe();
      resolve(user);
    }, reject);
  });
}

/**
 * Fetch the current user's detailed profile from Firestore
 * This combines auth user with their Firestore profile
 */
export async function getCurrentUserProfile() {
  try {
    const authUser = await getCurrentUser();
    
    if (!authUser) {
      console.log('No user is currently authenticated');
      return null;
    }
    
    // Get additional user data from Firestore
    const userDoc = await getDoc(doc(db, 'Users', authUser.uid));
    
    if (userDoc.exists()) {
      // Combine auth user data with Firestore profile
      return {
        id: authUser.uid,
        email: authUser.email,
        emailVerified: authUser.emailVerified,
        displayName: authUser.displayName,
        photoURL: authUser.photoURL,
        ...userDoc.data()
      };
    } else {
      // User exists in Auth but not in Firestore
      return {
        id: authUser.uid,
        email: authUser.email,
        emailVerified: authUser.emailVerified,
        displayName: authUser.displayName,
        photoURL: authUser.photoURL
      };
    }
  } catch (error) {
    console.error('Error fetching current user profile:', error);
    throw error;
  }
}