import { db } from './Config.js';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  getDoc, 
  doc, 
  orderBy, 
  limit,
  Timestamp 
} from 'firebase/firestore';

// Get user by ID
export async function getUserById(userId) {
  try {
    const userRef = doc(db, 'Users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return { id: userSnap.id, ...userSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
}

// Get all orders for a specific user
export async function getOrdersByUserId(userId) {
  try {
    const q = query(
      collection(db, 'Orders'), 
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const orders = [];
    
    querySnapshot.forEach((doc) => {
      orders.push({ id: doc.id, ...doc.data() });
    });
    
    return orders;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
}

// Get all orders with optional filtering
export async function getAllOrders(filter = null) {
  try {
    let q;
    const now = Timestamp.now();
    
    // Apply time-based filters similar to your dashboard
    if (filter === '24 hours') {
      const oneDayAgo = new Date(now.toMillis() - 24 * 60 * 60 * 1000);
      q = query(
        collection(db, 'Orders'),
        where('createdAt', '>=', Timestamp.fromDate(oneDayAgo)),
        orderBy('createdAt', 'desc')
      );
    } else if (filter === '7 days') {
      const sevenDaysAgo = new Date(now.toMillis() - 7 * 24 * 60 * 60 * 1000);
      q = query(
        collection(db, 'Orders'),
        where('createdAt', '>=', Timestamp.fromDate(sevenDaysAgo)),
        orderBy('createdAt', 'desc')
      );
    } else if (filter === '30 days') {
      const thirtyDaysAgo = new Date(now.toMillis() - 30 * 24 * 60 * 60 * 1000);
      q = query(
        collection(db, 'Orders'),
        where('createdAt', '>=', Timestamp.fromDate(thirtyDaysAgo)),
        orderBy('createdAt', 'desc')
      );
    } else {
      // Default to 12 months or all
      const twelveMonthsAgo = new Date(now.toMillis() - 365 * 24 * 60 * 60 * 1000);
      q = query(
        collection(db, 'Orders'),
        where('createdAt', '>=', Timestamp.fromDate(twelveMonthsAgo)),
        orderBy('createdAt', 'desc')
      );
    }
    
    const querySnapshot = await getDocs(q);
    const orders = [];
    
    querySnapshot.forEach((doc) => {
      orders.push({ id: doc.id, ...doc.data() });
    });
    
    return orders;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
}

// Get dashboard statistics
export async function getDashboardStats(timeFilter = '12 months') {
  try {
    const orders = await getAllOrders(timeFilter);
    
    // Calculate statistics
    const stats = {
      totalShipments: orders.length,
      totalOrders: orders.length,
      revenue: orders.reduce((sum, order) => sum + (order.cost?.totalAmount || 0), 0),
      delivered: orders.filter(order => order.status === 'Delivered').length
    };
    
    return stats;
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    throw error;
  }
}

// Get order by tracking ID
export async function getOrderByTrackingId(trackingId) {
  try {
    const q = query(
      collection(db, 'Orders'),
      where('trackingId', '==', trackingId)
    );
    
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching order by tracking ID:', error);
    throw error;
  }
}

// Get user orders with shipment details
export async function getUserOrdersWithShipmentDetails(userId) {
  try {
    const q = query(
      collection(db, 'Orders'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const orders = [];
    
    querySnapshot.forEach((doc) => {
      orders.push({ 
        id: doc.id, 
        ...doc.data(),
        // Format fields for display if needed
        formattedCreatedAt: doc.data().createdAt ? new Date(doc.data().createdAt.toDate()).toLocaleString() : 'N/A',
        estimatedDeliveryDate: doc.data().shipping?.estimatedArrivalDate 
          ? new Date(doc.data().shipping.estimatedArrivalDate.toDate()).toLocaleString() 
          : 'N/A'
      });
    });
    
    return orders;
  } catch (error) {
    console.error('Error fetching user orders with shipment details:', error);
    throw error;
  }
}
