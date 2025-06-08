/**
 * Simple script to check if users exist in Firebase
 */

// Import and configure dotenv first
import 'dotenv/config';

// Import Firebase config
import { db } from './src/Firebase/sharedConfig.js';
import { collection, getDocs } from 'firebase/firestore';

async function checkUsers() {
  try {
    console.log('Checking for existing users in Firebase...');
    const usersCollection = collection(db, 'Users');
    const userSnapshot = await getDocs(usersCollection);
    
    const users = [];
    userSnapshot.forEach(doc => {
      users.push({ id: doc.id, ...doc.data() });
    });
    
    console.log(`Found ${users.length} users in the database`);
    
    // List user emails or names if any exist
    if (users.length > 0) {
      console.log('Users in database:');
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name || user.email || user.displayName || user.id}`);
      });
    }
  } catch (error) {
    console.error('Error checking users:', error);
  }
}

checkUsers();
