// Serverless Cloud Functions for FreightFox
// This file needs to be deployed to Firebase Functions separately

const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

// No email configuration needed

/**
 * Simple ping function to test if Firebase Cloud Functions are running
 */
exports.ping = functions.https.onCall(async (data, context) => {
  return {
    message: "Firebase Functions are operational",
    timestamp: new Date().toISOString()
  };
});

/**
 * Cloud function to get counts of orders in different status categories
 */
exports.getOrderStatistics = functions.https.onCall(async (data, context) => {
  try {
    // Ensure user is authenticated
    if (!context.auth) {
      throw new Error('Authentication required');
    }
    
    const userId = context.auth.uid;
    
    // Reference to the user's orders
    const ordersRef = admin.firestore().collection('Orders');
    
    // Query for all orders for this user
    const userOrdersSnapshot = await ordersRef.where('userId', '==', userId).get();
    
    if (userOrdersSnapshot.empty) {
      return {
        total: 0,
        pending: 0,
        inTransit: 0,
        delivered: 0,
        cancelled: 0
      };
    }
    
    // Count orders by status
    let stats = {
      total: 0,
      pending: 0,
      inTransit: 0,
      delivered: 0,
      cancelled: 0
    };
    
    userOrdersSnapshot.forEach(doc => {
      const order = doc.data();
      stats.total++;
      
      if (!order.status) return;
      
      const status = order.status.toLowerCase();
      
      if (status === 'processing' || status === 'pending') {
        stats.pending++;
      } else if (status === 'in transit' || status === 'out for delivery') {
        stats.inTransit++;
      } else if (status === 'delivered' || status === 'completed') {
        stats.delivered++;
      } else if (status === 'cancelled' || status === 'failed' || status === 'returned') {
        stats.cancelled++;
      }
    });
    
    return stats;
    
  } catch (error) {
    console.error("Error getting order statistics:", error);
    
    throw new functions.https.HttpsError(
      'internal',
      'Failed to get order statistics',
      error.message
    );
  }
});






