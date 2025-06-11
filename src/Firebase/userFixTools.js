/**
 * Advanced user management tools for Firebase
 */

import { db } from './sharedConfig.js';
import { 
  collection, 
  getDocs, 
  getDoc,
  setDoc,
  doc,
  query,
  where,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';

import { loginToFirebase, prompt, closePrompt, checkAuthStatus } from './authTools.js';

/**
 * Close any resources used by the fix tools
 */
export function closeFixTools() {
  // Currently nothing to close, but this function exists
  // in case we need to add cleanup later
}

/**
 * Detect user ID mismatches between Firestore document IDs and Firebase Auth UIDs
 * @returns {Promise<Array>} Array of mismatched users
 */
export async function detectUserIdMismatches() {
  try {
    console.log('Detecting user ID mismatches...');
    
    // Get all users from Firestore
    const usersCollection = collection(db, 'Users');
    const userSnapshot = await getDocs(usersCollection);
    
    const users = [];
    userSnapshot.forEach(doc => {
      users.push({ id: doc.id, ...doc.data() });
    });
    
    // Find users where id doesn't match uid
    const mismatchedUsers = users.filter(user => 
      user.uid && user.uid !== user.id
    );
    
    if (mismatchedUsers.length > 0) {
      console.log(`Found ${mismatchedUsers.length} users with ID mismatches:`);
      mismatchedUsers.forEach(user => {
        console.log(`- ${user.displayName || user.email}: Document ID ${user.id} vs Auth UID ${user.uid}`);
      });
    } else {
      console.log('No user ID mismatches detected');
    }
    
    return mismatchedUsers;
  } catch (error) {
    console.error('Error detecting user ID mismatches:', error);
    throw error;
  }
}

/**
 * Fix user ID mismatches by moving data to documents with correct Firebase Auth UIDs
 * @param {Array} mismatchedUsers - Array of users with ID mismatches
 * @returns {Promise<Array>} - Array of fixed user IDs
 */
export async function fixUserIdMismatches(mismatchedUsers) {
  const fixedUsers = [];
  
  for (const user of mismatchedUsers) {
    try {
      console.log(`Fixing user ID mismatch for ${user.email || user.displayName || user.id}...`);
      
      // Get confirmation from user
      const answer = await prompt(`Fix user ID mismatch for ${user.email || user.displayName}? (Change from ${user.id} to ${user.uid}) [y/n]: `);
      
      if (answer.toLowerCase() === 'y') {
        // Move user data to document with Firebase Auth UID
        const userData = {...user};
        delete userData.id;  // Remove the id field as it's not part of the data
        
        // Check if a document with the UID already exists
        const uidDocRef = doc(db, 'Users', user.uid);
        const uidDocSnap = await getDoc(uidDocRef);
        
        if (uidDocSnap.exists()) {
          console.log(`Document with ID ${user.uid} already exists, merging data...`);
          const existingData = uidDocSnap.data();
          const mergedData = {...existingData, ...userData};
          await setDoc(uidDocRef, mergedData);
        } else {
          // Create new document with Firebase Auth UID
          await setDoc(uidDocRef, userData);
        }
        
        // Update orders
        const updatedOrders = await updateOrdersForUser(user.id, user.uid);
        console.log(`Updated ${updatedOrders.length} orders to use correct user ID`);
        
        // Delete old document
        await deleteDoc(doc(db, 'Users', user.id));
        
        console.log(`Successfully fixed user ID for ${user.email || user.displayName}`);
        fixedUsers.push(user.uid);
      } else {
        console.log(`Skipping user ${user.email || user.displayName}`);
      }
    } catch (error) {
      console.error(`Error fixing user ID for ${user.email || user.displayName}:`, error);
    }
  }
  
  return fixedUsers;
}

/**
 * Update all order user references to match correct user IDs
 * @returns {Promise<Object>} - Summary of updates made
 */
export async function updateOrderUserReferences() {
  try {
    console.log('Checking for orders with incorrect user references...');
    
    // Get all orders
    const ordersCollection = collection(db, 'Orders');
    const orderSnapshot = await getDocs(ordersCollection);
    
    console.log(`Found ${orderSnapshot.size} total orders`);
    
    // Track orders with missing users
    const ordersWithMissingUsers = [];
    const ordersUpdated = [];
    
    // Check each order
    for (const orderDoc of orderSnapshot.docs) {
      const order = { id: orderDoc.id, ...orderDoc.data() };
      
      if (!order.userId) {
        console.log(`Order ${order.id} has no userId`);
        ordersWithMissingUsers.push(order.id);
        continue;
      }
      
      // Check if the user exists with this ID
      const userDocRef = doc(db, 'Users', order.userId);
      const userDocSnap = await getDoc(userDocRef);
      
      if (!userDocSnap.exists()) {
        console.log(`Order ${order.id} references non-existent user ${order.userId}`);
        
        // Try to find the user by email if available
        if (order.userEmail) {
          const usersQuery = query(
            collection(db, 'Users'),
            where('email', '==', order.userEmail)
          );
          
          const userQuerySnap = await getDocs(usersQuery);
          
          if (!userQuerySnap.empty) {
            // Found the user with matching email
            const correctUser = { id: userQuerySnap.docs[0].id, ...userQuerySnap.docs[0].data() };
            
            // Update the order with the correct user ID
            await updateDoc(doc(db, 'Orders', order.id), {
              userId: correctUser.id
            });
            
            console.log(`Updated order ${order.id} to use correct user ID ${correctUser.id}`);
            ordersUpdated.push(order.id);
          } else {
            ordersWithMissingUsers.push(order.id);
          }
        } else {
          ordersWithMissingUsers.push(order.id);
        }
      }
    }
    
    return {
      totalOrders: orderSnapshot.size,
      ordersUpdated,
      ordersWithMissingUsers
    };
  } catch (error) {
    console.error('Error updating order user references:', error);
    throw error;
  }
}

/**
 * Find duplicate users in Firestore
 * @returns {Promise<Object>} - Object with email keys and arrays of duplicate users
 */
export async function findDuplicateUsers() {
  try {
    console.log('Fetching all users from Firestore...');
    const usersCollection = collection(db, 'Users');
    const userSnapshot = await getDocs(usersCollection);
    
    const users = [];
    userSnapshot.forEach(doc => {
      users.push({ id: doc.id, ...doc.data() });
    });
    
    console.log(`Found ${users.length} users in Firestore`);
    
    // Group users by email
    const usersByEmail = {};
    users.forEach(user => {
      if (user.email) {
        const email = user.email.toLowerCase();
        if (!usersByEmail[email]) {
          usersByEmail[email] = [];
        }
        usersByEmail[email].push(user);
      }
    });
    
    // Find emails with multiple users
    const duplicates = {};
    Object.entries(usersByEmail).forEach(([email, usersList]) => {
      if (usersList.length > 1) {
        duplicates[email] = usersList;
      }
    });
    
    return duplicates;
  } catch (error) {
    console.error('Error finding duplicate users:', error);
    throw error;
  }
}

/**
 * Update orders to use correct user ID
 * @param {string} oldUserId - Previous user ID
 * @param {string} newUserId - Correct user ID
 * @returns {Promise<string[]>} - List of updated order IDs
 */
export async function updateOrdersForUser(oldUserId, newUserId) {
  try {
    console.log(`Looking for orders with userId: ${oldUserId}`);
    
    // Find orders with the old user ID
    const ordersQuery = query(
      collection(db, 'Orders'),
      where('userId', '==', oldUserId)
    );
    
    const orderSnapshot = await getDocs(ordersQuery);
    console.log(`Found ${orderSnapshot.size} orders to update`);
    
    // Update each order
    const updatedOrders = [];
    for (const orderDoc of orderSnapshot.docs) {
      await updateDoc(doc(db, 'Orders', orderDoc.id), {
        userId: newUserId
      });
      updatedOrders.push(orderDoc.id);
    }
    
    return updatedOrders;
  } catch (error) {
    console.error('Error updating orders:', error);
    return [];
  }
}

/**
 * Merge duplicate users, keeping the main user and deleting duplicates
 * @returns {Promise<boolean>} - Success status
 */
export async function mergeDuplicateUsers(duplicatesByEmail) {
  try {
    console.log('==============================================');
    console.log('Firebase Duplicate User Fixer');
    console.log('==============================================');
    
    // Check if logged in
    let currentUser = await checkAuthStatus();
    if (!currentUser) {
      console.log('You need to log in first.');
      const loggedIn = await loginToFirebase();
      if (!loggedIn) return false;
      currentUser = await checkAuthStatus();
    }
    
    // Find duplicates
    const duplicates = await findDuplicateUsers();
    const duplicateEmails = Object.keys(duplicates);
    
    if (duplicateEmails.length === 0) {
      console.log('No duplicate users found!');
      return true;
    }
    
    console.log(`\nFound ${duplicateEmails.length} emails with duplicate users:`);
    duplicateEmails.forEach((email, index) => {
      const users = duplicates[email];
      console.log(`\n${index + 1}. ${email} (${users.length} records):`);
      
      users.forEach((user, i) => {
        console.log(`   ${i + 1}. ID: ${user.id}`);
        console.log(`      UID: ${user.uid || 'N/A'}`);
        
        // Determine if this is likely the Auth user
        const isLikelyAuthUser = user.id.length > 20 && !user.id.startsWith('user_');
        if (isLikelyAuthUser) {
          console.log(`      ⭐️ Likely the Firebase Auth user`);
        }
      });
    });
    
    // Process each duplicate
    console.log('\n=== Processing Duplicates ===');
    
    for (const email of duplicateEmails) {
      console.log(`\nProcessing duplicates for ${email}...`);
      const users = duplicates[email];
      
      // Try to find the Auth user (with UID matching document ID)
      let authUser = users.find(user => user.uid === user.id);
      
      // If no exact match, look for likely auth user (with long, non-user_ ID)
      if (!authUser) {
        authUser = users.find(user => user.id.length > 20 && !user.id.startsWith('user_'));
      }
      
      // If still no auth user, use the first one with a UID field
      if (!authUser) {
        authUser = users.find(user => user.uid);
      }
      
      // If still no auth user, ask user to select
      if (!authUser) {
        console.log('Could not automatically determine which user to keep.');
        for (let i = 0; i < users.length; i++) {
          console.log(`${i + 1}. ID: ${users[i].id}`);
        }
        
        const selection = await prompt('Enter number of user to keep (or s to skip): ');
        if (selection.toLowerCase() === 's') {
          console.log('Skipping this email');
          continue;
        }
        
        const index = parseInt(selection) - 1;
        if (isNaN(index) || index < 0 || index >= users.length) {
          console.log('Invalid selection, skipping');
          continue;
        }
        
        authUser = users[index];
      }
      
      console.log(`Selected user with ID ${authUser.id} as the main user.`);
      
      // Confirm action
      const proceed = await prompt('Proceed with merging users? (y/n): ');
      if (proceed.toLowerCase() !== 'y') {
        console.log('Skipping this email');
        continue;
      }
      
      // Process other users
      for (const user of users) {
        if (user.id === authUser.id) continue;
        
        console.log(`Merging user ${user.id} into ${authUser.id}...`);
        
        // Update orders referencing old user ID
        const updatedOrders = await updateOrdersForUser(user.id, authUser.id);
        if (updatedOrders.length > 0) {
          console.log(`Updated ${updatedOrders.length} orders`);
        }
        
        // Delete the duplicate user
        await deleteDoc(doc(db, 'Users', user.id));
        console.log(`Deleted duplicate user with ID ${user.id}`);
      }
      
      console.log(`Successfully processed duplicates for ${email}`);
    }
    
    console.log('\n==============================================');
    console.log('Duplicate user fix completed!');
    console.log('==============================================');
    
    return true;
  } catch (error) {
    console.error('Error merging duplicate users:', error);
    return false;
  }
}

/**
 * Fix user IDs using manual mapping from local IDs to Firebase Auth UIDs
 * @returns {Promise<boolean>} - Success status
 */
export async function fixUserIds() {
  try {
    console.log('==============================================');
    console.log('Firebase User ID Manual Fixer');
    console.log('==============================================');
    
    // Check if logged in
    let currentUser = await checkAuthStatus();
    if (!currentUser) {
      console.log('You need to log in first.');
      const loggedIn = await loginToFirebase();
      if (!loggedIn) return false;
    }
    
    // Get all users
    const usersCollection = collection(db, 'Users');
    const userSnapshot = await getDocs(usersCollection);
    
    const users = [];
    userSnapshot.forEach(doc => {
      users.push({ id: doc.id, ...doc.data() });
    });
    
    console.log(`\nFound ${users.length} users in Firestore`);
    
    // Show current users
    console.log('\nCurrent users in the database:');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name || user.email || 'Unknown'}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Email: ${user.email || 'N/A'}`);
      console.log(`   UID=ID Match: ${user.uid === user.id ? '✓' : '❌'}`);
    });
    
    console.log('\n=== Manual User ID Mapping ===');
    console.log('For each user, enter the Firebase Auth UID that should be used.');
    console.log('Leave blank to skip a user.');
    
    // Process each user
    for (const user of users) {
      // Skip users that already have correct UIDs
      if (user.id.length > 20 && !user.id.startsWith('user_')) {
        console.log(`\nSkipping ${user.email || user.name || user.id} - already has Auth-style UID.`);
        continue;
      }
      
      console.log(`\nProcessing user: ${user.email || user.name || 'Unknown'}`);
      console.log(`Current ID: ${user.id}`);
      
      // Get the new UID
      const newUid = await prompt('Enter Firebase Auth UID for this user (or press Enter to skip): ');
      
      if (!newUid) {
        console.log('Skipping this user.');
        continue;
      }
      
      // Confirm action
      const proceed = await prompt(`Are you sure you want to change ${user.id} to ${newUid}? (y/n): `);
      if (proceed.toLowerCase() !== 'y') {
        console.log('Skipping this user.');
        continue;
      }
      
      console.log(`\nChanging user ID from ${user.id} to ${newUid}...`);
      
      // Process this user
      try {
        // Step 1: Create a new user document with the Firebase Auth UID
        const userData = { ...user };
        delete userData.id; // Remove the document ID field
        
        // Make sure the UID field is set correctly
        userData.uid = newUid;
        userData.lastUpdated = serverTimestamp();
        
        // Step 2: Create the new document
        await setDoc(doc(db, 'Users', newUid), userData);
        console.log(`Created new user document with ID: ${newUid}`);
        
        // Step 3: Update orders
        const updatedOrders = await updateOrdersForUser(user.id, newUid);
        if (updatedOrders.length > 0) {
          console.log(`Updated ${updatedOrders.length} orders to reference the new user ID`);
        }
        
        // Step 4: Delete the old document
        await deleteDoc(doc(db, 'Users', user.id));
        console.log(`Deleted old user document with ID: ${user.id}`);
        
        console.log(`✓ Successfully migrated user from ${user.id} to ${newUid}`);
      } catch (error) {
        console.error(`Error processing user ${user.id}:`, error);
      }
    }
    
    console.log('\n==============================================');
    console.log('User ID fix completed!');
    console.log('==============================================');
    
    return true;
  } catch (error) {
    console.error('Error fixing user IDs:', error);
    return false;
  }
}

// Execute as command line scripts
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];
  
  if (command === 'fix-duplicates') {
    mergeDuplicateUsers(duplicatesByEmail).finally(() => closePrompt());
  } else if (command === 'manual-fix') {
    fixUserIds().finally(() => closePrompt());
  } else {
    console.log('Usage: node userFixTools.js [fix-duplicates|manual-fix]');
    closePrompt();
  }
}
