import { db } from './sharedConfig.js';
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
import { enhanceOrderWithCoordinates } from './locationUtils.js';

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
      const orderData = { id: doc.id, ...doc.data() };
      orders.push(enhanceOrderWithCoordinates(orderData));
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
      const orderData = { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
      return enhanceOrderWithCoordinates(orderData);
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
      const orderData = { 
        id: doc.id, 
        ...doc.data(),
        // Format fields for display if needed
        formattedCreatedAt: doc.data().createdAt ? new Date(doc.data().createdAt.toDate()).toLocaleString() : 'N/A',
        estimatedDeliveryDate: doc.data().shipping?.estimatedArrivalDate 
          ? new Date(doc.data().shipping.estimatedArrivalDate.toDate()).toLocaleString() 
          : 'N/A'
      };
      
      // Enhance with coordinates while preserving original source/destination
      orders.push(enhanceOrderWithCoordinates(orderData));
    });
    
    return orders;
  } catch (error) {
    console.error('Error fetching user orders with shipment details:', error);
    throw error;
  }
}

// Get all orders for a specific user with date range filtering
export async function getUserOrdersByDateRange(userId, startDate, endDate) {
  try {
    // Convert to Timestamp if dates are provided as JavaScript Date objects
    const startTimestamp = startDate instanceof Date ? Timestamp.fromDate(startDate) : startDate;
    const endTimestamp = endDate instanceof Date ? Timestamp.fromDate(endDate) : endDate;
    
    const q = query(
      collection(db, 'Orders'),
      where('userId', '==', userId),
      where('createdAt', '>=', startTimestamp),
      where('createdAt', '<=', endTimestamp),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const orders = [];
    
    querySnapshot.forEach((doc) => {
      orders.push({ 
        id: doc.id, 
        ...doc.data(),
        formattedCreatedAt: doc.data().createdAt ? new Date(doc.data().createdAt.toDate()).toLocaleString() : 'N/A',
      });
    });
    
    return orders;
  } catch (error) {
    console.error('Error fetching user orders by date range:', error);
    throw error;
  }
}

// Get user's monthly order statistics for the past 6 months
export async function getUserMonthlyOrderStats(userId) {
  try {
    // Get current date and 6 months ago
    const now = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(now.getMonth() - 5); // To include current month (0-5 = 6 months total)
    
    // Start from first day of the month 6 months ago
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);
    
    const startTimestamp = Timestamp.fromDate(sixMonthsAgo);
    const endTimestamp = Timestamp.fromDate(now);
    
    // Fetch all orders in this date range
    const q = query(
      collection(db, 'Orders'),
      where('userId', '==', userId),
      where('createdAt', '>=', startTimestamp),
      where('createdAt', '<=', endTimestamp),
      orderBy('createdAt', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    
    // Initialize monthly statistics
    const monthlyStats = {};
    
    // Initialize last 6 months
    for (let i = 0; i < 6; i++) {
      const monthDate = new Date();
      monthDate.setMonth(now.getMonth() - i);
      const monthKey = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`;
      monthlyStats[monthKey] = {
        month: monthDate.toLocaleString('default', { month: 'short' }),
        year: monthDate.getFullYear(),
        orderCount: 0,
        totalSpent: 0,
        orders: []
      };
    }
    
    // Process orders into monthly buckets
    querySnapshot.forEach((doc) => {
      const orderData = doc.data();
      if (orderData.createdAt) {
        const orderDate = orderData.createdAt.toDate();
        const monthKey = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
        
        // Only process if the month is in our tracked range
        if (monthlyStats[monthKey]) {
          monthlyStats[monthKey].orderCount += 1;
          monthlyStats[monthKey].totalSpent += orderData.cost?.totalAmount || 0;
          monthlyStats[monthKey].orders.push({
            id: doc.id,
            ...orderData,
            formattedCreatedAt: orderDate.toLocaleDateString()
          });
        }
      }
    });
    
    // Convert to array sorted by date
    return Object.values(monthlyStats).sort((a, b) => {
      const dateA = new Date(`${a.year}-${a.month}-01`);
      const dateB = new Date(`${b.year}-${b.month}-01`);
      return dateB - dateA; // Most recent first
    });
  } catch (error) {
    console.error('Error fetching user monthly order stats:', error);
    throw error;
  }
}

// Get orders by date range - useful for fetching historical data
export async function getOrdersByDateRange(userId = null, startDate, endDate) {
  try {
    let q;
    const ordersCollection = collection(db, 'Orders');
    
    // Convert dates to Firestore Timestamps
    const startTimestamp = Timestamp.fromDate(startDate);
    const endTimestamp = Timestamp.fromDate(endDate);
    
    // Build query based on whether we want all orders or just a specific user's
    if (userId) {
      q = query(
        ordersCollection,
        where('userId', '==', userId),
        where('createdAt', '>=', startTimestamp),
        where('createdAt', '<=', endTimestamp),
        orderBy('createdAt', 'desc')
      );
    } else {
      q = query(
        ordersCollection,
        where('createdAt', '>=', startTimestamp),
        where('createdAt', '<=', endTimestamp),
        orderBy('createdAt', 'desc')
      );
    }
    
    const querySnapshot = await getDocs(q);
    
    const orders = [];
    querySnapshot.forEach((doc) => {
      const orderData = doc.data();
      orders.push({
        id: doc.id,
        ...orderData,
        createdAtDate: orderData.createdAt?.toDate() || new Date()
      });
    });
    
    return orders;
  } catch (error) {
    console.error('Error fetching orders by date range:', error);
    throw error;
  }
}
