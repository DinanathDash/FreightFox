/**
 * Script to check user data in Firebase and detect potential issues
 */

// Import Firebase config
import { db } from './sharedConfig.js';
import { 
  collection, 
  getDocs, 
  query,
  where,
  getDoc,
  doc 
} from 'firebase/firestore';

export async function checkUsers() {
  try {
    console.log('==============================================');
    console.log('Firebase User Database Check');
    console.log('==============================================');
    
    // Get all users from Firestore
    console.log('Fetching users from Firebase Firestore...');
    const usersCollection = collection(db, 'Users');
    const userSnapshot = await getDocs(usersCollection);
    
    const users = [];
    userSnapshot.forEach(doc => {
      users.push({ id: doc.id, ...doc.data() });
    });
    
    console.log(`Found ${users.length} users in the database`);
    
    // Check for potential issues
    const usersWithoutEmail = users.filter(user => !user.email);
    const usersWithoutUid = users.filter(user => !user.uid);
    const usersWithMismatchedId = users.filter(user => user.uid && user.uid !== user.id);
    const emailsMap = new Map();
    const duplicateEmails = [];
    
    // Check for duplicate emails
    users.forEach(user => {
      if (user.email) {
        const email = user.email.toLowerCase();
        if (emailsMap.has(email)) {
          duplicateEmails.push({
            email: user.email,
            users: [emailsMap.get(email), user]
          });
        } else {
          emailsMap.set(email, user);
        }
      }
    });
    
    // Display user information
    if (users.length > 0) {
      console.log('\nUser Summary:');
      users.forEach((user, index) => {
        const hasIdMatch = user.uid === user.id ? '✓' : '❌';
        console.log(`${index + 1}. ${user.name || user.email || user.displayName || user.id}`);
        console.log(`   ID: ${user.id}`);
        console.log(`   Email: ${user.email || 'N/A'}`);
        console.log(`   UID=ID Match: ${hasIdMatch}`);
      });
      
      // Report potential issues
      console.log('\n==============================================');
      console.log('Potential Issues:');
      console.log('==============================================');
      
      if (usersWithoutEmail.length > 0) {
        console.log(`❌ ${usersWithoutEmail.length} users without email addresses`);
      }
      
      if (usersWithoutUid.length > 0) {
        console.log(`❌ ${usersWithoutUid.length} users without UID field`);
      }
      
      if (usersWithMismatchedId.length > 0) {
        console.log(`❌ ${usersWithMismatchedId.length} users with UID not matching document ID`);
        usersWithMismatchedId.forEach(user => {
          console.log(`   - ${user.email || user.id}: UID=${user.uid}, ID=${user.id}`);
        });
      }
      
      if (duplicateEmails.length > 0) {
        console.log(`❌ ${duplicateEmails.length} duplicate email addresses`);
        duplicateEmails.forEach(dup => {
          console.log(`   - ${dup.email} has ${dup.users.length} user records`);
        });
      }
      
      // Check for orders with non-existent users
      await checkOrdersWithMissingUsers(users);
    }
    
    return {
      users,
      issues: {
        usersWithoutEmail,
        usersWithoutUid,
        usersWithMismatchedId,
        duplicateEmails
      }
    };
  } catch (error) {
    console.error('Error checking users:', error);
    throw error;
  }
}

// Function to check for orders with missing users
async function checkOrdersWithMissingUsers(users) {
  try {
    console.log('\nChecking for orders with missing users...');
    const ordersCollection = collection(db, 'Orders');
    const orderSnapshot = await getDocs(ordersCollection);
    
    const orders = [];
    orderSnapshot.forEach(doc => {
      orders.push({ id: doc.id, ...doc.data() });
    });
    
    console.log(`Found ${orders.length} orders in the database`);
    
    // Create a map of valid user IDs
    const userIds = new Set(users.map(user => user.id));
    
    // Find orders with invalid user IDs
    const ordersWithMissingUsers = orders.filter(order => 
      order.userId && !userIds.has(order.userId)
    );
    
    if (ordersWithMissingUsers.length > 0) {
      console.log(`❌ ${ordersWithMissingUsers.length} orders reference non-existent users`);
      
      // Show the first 5 examples
      const examples = ordersWithMissingUsers.slice(0, 5);
      examples.forEach(order => {
        console.log(`   - Order ${order.id} references missing user ${order.userId}`);
        if (order.userEmail) {
          console.log(`     User email: ${order.userEmail}`);
        }
      });
      
      if (ordersWithMissingUsers.length > 5) {
        console.log(`     ... and ${ordersWithMissingUsers.length - 5} more`);
      }
    } else {
      console.log('✓ All orders reference valid users');
    }
    
    return ordersWithMissingUsers;
  } catch (error) {
    console.error('Error checking orders:', error);
    return [];
  }
}

// Command line script handler
if (import.meta.url === `file://${process.argv[1]}`) {
  checkUsers();
}
