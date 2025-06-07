/**
 * This script creates user profiles in Firestore for each authenticated user we want to generate orders for.
 * Since we can't directly list Auth users without the Admin SDK, this script creates users based on provided email addresses.
 */

import { db } from './sharedConfig.js';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  serverTimestamp
} from 'firebase/firestore';

/**
 * Create user records in Firestore for the authenticated users we want to generate orders for
 * @param {Array} emails - List of email addresses from authenticated users we want to add
 */
async function createFirestoreUsers(emails) {
  try {
    console.log('Creating user records in Firestore...');
    
    // User profiles to create
    const userProfiles = emails.map(email => {
      // Extract username from email
      const name = email.split('@')[0].split('.').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
      
      // Generate a random UID (usually this would come from Firebase Auth)
      const uid = `user_${Math.random().toString(36).substring(2, 15)}`;
      
      // Generate random phone number
      const phone = `${['90', '91', '81', '70', '71', '62'][Math.floor(Math.random() * 6)]}${Math.floor(10000000 + Math.random() * 90000000)}`;
      
      // Generate random city and address
      const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad'];
      const states = ['Maharashtra', 'NCT', 'Karnataka', 'Tamil Nadu', 'Telangana'];
      const randomIndex = Math.floor(Math.random() * cities.length);
      const address = `${Math.floor(100 + Math.random() * 900)} Main St, ${cities[randomIndex]}, ${states[randomIndex]}`;
      
      // Generate random profile photo from randomuser.me
      const gender = Math.random() > 0.5 ? 'men' : 'women';
      const photoIndex = Math.floor(1 + Math.random() * 99);
      const profilePhoto = `https://randomuser.me/api/portraits/${gender}/${photoIndex}.jpg`;
      
      return {
        uid,
        email,
        name,
        phone,
        address,
        profilePhoto,
        createdAt: serverTimestamp()
      };
    });
    
    // Add each user to Firestore
    const createdUsers = [];
    
    for (const user of userProfiles) {
      // We use the generated UID as document ID
      await setDoc(doc(db, 'Users', user.uid), user);
      console.log(`Created user profile for ${user.email} with ID ${user.uid}`);
      createdUsers.push(user);
    }
    
    console.log(`Successfully created ${createdUsers.length} user profiles in Firestore`);
    return createdUsers;
  } catch (error) {
    console.error('Error creating user records:', error);
    throw error;
  }
}

/**
 * Fetch all existing users from Firestore
 */
async function getExistingFirestoreUsers() {
  try {
    console.log('Fetching existing users from Firestore...');
    const usersCollection = collection(db, 'Users');
    const userSnapshot = await getDocs(usersCollection);
    
    const users = [];
    userSnapshot.forEach(doc => {
      users.push({ id: doc.id, ...doc.data() });
    });
    
    console.log(`Found ${users.length} existing users in Firestore`);
    return users;
  } catch (error) {
    console.error('Error fetching existing users:', error);
    throw error;
  }
}

// Export the functions
export { createFirestoreUsers, getExistingFirestoreUsers };
