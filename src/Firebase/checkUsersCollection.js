import { db } from './sharedConfig.js';
import { collection, getDocs } from 'firebase/firestore';

async function checkUsersCollection() {
  try {
    console.log('Checking Users collection in Firestore...');
    const usersCollection = collection(db, 'Users');
    const userSnapshot = await getDocs(usersCollection);
    
    console.log(`Found ${userSnapshot.size} users in Firestore Users collection`);
    
    if (userSnapshot.size > 0) {
      console.log('User documents found:');
      userSnapshot.forEach(doc => {
        console.log(`- User ID: ${doc.id}`);
        console.log(`  Email: ${doc.data().email || 'N/A'}`);
        console.log(`  Name: ${doc.data().name || doc.data().displayName || 'N/A'}`);
      });
    } else {
      console.log('No user documents found in the Users collection.');
    }
  } catch (error) {
    console.error('Error checking Users collection:', error);
  }
}

checkUsersCollection();
