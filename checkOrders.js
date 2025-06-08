/**
 * Simple script to check if orders exist in Firebase
 */

// Import and configure dotenv first
import 'dotenv/config';

// Import Firebase config
import { db } from './src/Firebase/sharedConfig.js';
import { collection, getDocs } from 'firebase/firestore';

async function checkOrders() {
  try {
    console.log('Checking for existing orders in Firebase...');
    const ordersCollection = collection(db, 'Orders');
    const orderSnapshot = await getDocs(ordersCollection);
    
    const orders = [];
    orderSnapshot.forEach(doc => {
      orders.push({ id: doc.id, ...doc.data() });
    });
    
    console.log(`Found ${orders.length} orders in the database`);
    
    // Check for new structure (sample of first order if exists)
    if (orders.length > 0) {
      const firstOrder = orders[0];
      console.log('First order structure:');
      console.log('- Has direct "from" property:', 'from' in firstOrder);
      console.log('- Has direct "to" property:', 'to' in firstOrder);
      console.log('- Has nested "shipping" property:', 'shipping' in firstOrder);
      
      if ('from' in firstOrder) {
        console.log('Sample "from" data:', firstOrder.from);
      }
    }
  } catch (error) {
    console.error('Error checking orders:', error);
  }
}

checkOrders();
