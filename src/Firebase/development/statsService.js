import { db } from '../shared/sharedConfig.js';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit,
  Timestamp 
} from 'firebase/firestore';

/**
 * Get historical data for the total shipments chart
 * @returns {Promise<Array>} Array of data points for the chart
 */
export async function getTotalShipmentsChartData(days = 7) {
  try {
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const startTimestamp = Timestamp.fromDate(startDate);
    const endTimestamp = Timestamp.fromDate(endDate);
    
    // Fetch orders within the date range
    const ordersCollection = collection(db, 'Orders');
    const q = query(
      ordersCollection,
      where('createdAt', '>=', startTimestamp),
      where('createdAt', '<=', endTimestamp),
      orderBy('createdAt', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    
    // Initialize data array with zeros for each day
    const chartData = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      chartData.push({
        name: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        value: 0,
        date: date
      });
    }
    
    // Count orders for each day
    querySnapshot.forEach(doc => {
      const orderData = doc.data();
      const createdAt = orderData.createdAt.toDate();
      
      // Find matching day in the chart data
      const dayIndex = Math.floor((createdAt - startDate) / (1000 * 60 * 60 * 24));
      if (dayIndex >= 0 && dayIndex < chartData.length) {
        chartData[dayIndex].value += 1;
      }
    });
    
    return chartData;
  } catch (error) {
    console.error('Error fetching total shipments chart data:', error);
    // Return empty data on error
    return Array(7).fill().map((_, i) => ({ 
      name: `Day ${i+1}`, 
      value: 0 
    }));
  }
}

/**
 * Get historical data for the delivered shipments chart
 * @returns {Promise<Array>} Array of data points for the chart
 */
export async function getDeliveredShipmentsChartData(days = 7) {
  try {
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const startTimestamp = Timestamp.fromDate(startDate);
    const endTimestamp = Timestamp.fromDate(endDate);
    
    // Fetch delivered orders within the date range
    const ordersCollection = collection(db, 'Orders');
    const q = query(
      ordersCollection,
      where('createdAt', '>=', startTimestamp),
      where('createdAt', '<=', endTimestamp),
      where('status', '==', 'Delivered'),
      orderBy('createdAt', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    
    // Initialize data array with zeros for each day
    const chartData = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      chartData.push({
        name: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        value: 0,
        date: date
      });
    }
    
    // Count orders for each day
    querySnapshot.forEach(doc => {
      const orderData = doc.data();
      const createdAt = orderData.createdAt.toDate();
      
      // Find matching day in the chart data
      const dayIndex = Math.floor((createdAt - startDate) / (1000 * 60 * 60 * 24));
      if (dayIndex >= 0 && dayIndex < chartData.length) {
        chartData[dayIndex].value += 1;
      }
    });
    
    return chartData;
  } catch (error) {
    console.error('Error fetching delivered shipments chart data:', error);
    // Return empty data on error
    return Array(7).fill().map((_, i) => ({ 
      name: `Day ${i+1}`, 
      value: 0 
    }));
  }
}

/**
 * Calculate week-over-week change percentage for shipments
 * @returns {Promise<Object>} Object with totalChange and deliveredChange properties
 */
export async function getWeeklyChangeStats() {
  try {
    // Calculate date ranges for current week and previous week
    const currentEnd = new Date();
    const currentStart = new Date();
    currentStart.setDate(currentStart.getDate() - 7);
    
    const prevEnd = new Date(currentStart);
    const prevStart = new Date();
    prevStart.setDate(prevStart.getDate() - 14);
    
    // Convert to timestamps
    const currentStartTimestamp = Timestamp.fromDate(currentStart);
    const currentEndTimestamp = Timestamp.fromDate(currentEnd);
    const prevStartTimestamp = Timestamp.fromDate(prevStart);
    const prevEndTimestamp = Timestamp.fromDate(prevEnd);
    
    const ordersCollection = collection(db, 'Orders');
    
    // Query for current week total shipments
    const currentTotalQuery = query(
      ordersCollection,
      where('createdAt', '>=', currentStartTimestamp),
      where('createdAt', '<=', currentEndTimestamp)
    );
    
    // Query for previous week total shipments
    const prevTotalQuery = query(
      ordersCollection,
      where('createdAt', '>=', prevStartTimestamp),
      where('createdAt', '<=', prevEndTimestamp)
    );
    
    // Query for current week delivered shipments
    const currentDeliveredQuery = query(
      ordersCollection,
      where('createdAt', '>=', currentStartTimestamp),
      where('createdAt', '<=', currentEndTimestamp),
      where('status', '==', 'Delivered')
    );
    
    // Query for previous week delivered shipments
    const prevDeliveredQuery = query(
      ordersCollection,
      where('createdAt', '>=', prevStartTimestamp),
      where('createdAt', '<=', prevEndTimestamp),
      where('status', '==', 'Delivered')
    );
    
    // Execute all queries
    const [currentTotalSnapshot, prevTotalSnapshot, currentDeliveredSnapshot, prevDeliveredSnapshot] = await Promise.all([
      getDocs(currentTotalQuery),
      getDocs(prevTotalQuery),
      getDocs(currentDeliveredQuery),
      getDocs(prevDeliveredQuery)
    ]);
    
    // Calculate counts
    const currentTotalCount = currentTotalSnapshot.size;
    const prevTotalCount = prevTotalSnapshot.size;
    const currentDeliveredCount = currentDeliveredSnapshot.size;
    const prevDeliveredCount = prevDeliveredSnapshot.size;
    
    // Calculate percent changes
    let totalChange = 0;
    let deliveredChange = 0;
    
    if (prevTotalCount > 0) {
      totalChange = Math.round(((currentTotalCount - prevTotalCount) / prevTotalCount) * 100);
    } else if (currentTotalCount > 0) {
      totalChange = 100; // If previous was 0 and current is not, that's a 100% increase
    }
    
    if (prevDeliveredCount > 0) {
      deliveredChange = Math.round(((currentDeliveredCount - prevDeliveredCount) / prevDeliveredCount) * 100);
    } else if (currentDeliveredCount > 0) {
      deliveredChange = 100; // If previous was 0 and current is not, that's a 100% increase
    }
    
    return {
      totalChange,
      deliveredChange
    };
  } catch (error) {
    console.error('Error calculating weekly change stats:', error);
    return {
      totalChange: 0,
      deliveredChange: 0
    };
  }
}
