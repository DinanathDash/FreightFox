// Payment-related Firebase services
import { db } from './sharedConfig.js';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  getDoc, 
  doc, 
  orderBy, 
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';

/**
 * Add a payment record to Firestore
 * @param {Object} paymentData - Payment details including userId, orderId, amount, paymentMethod, etc.
 * @returns {Promise<Object>} Created payment with ID
 */
export async function addPayment(paymentData) {
  try {
    // Validate required fields
    if (!paymentData.userId) {
      throw new Error("User ID is required for payment");
    }
    
    if (!paymentData.orderId) {
      throw new Error("Order ID is required for payment");
    }
    
    if (!paymentData.amount || isNaN(paymentData.amount) || paymentData.amount <= 0) {
      throw new Error("Valid payment amount is required");
    }

    // Add payment timestamp if not provided and ensure other important fields
    const data = {
      ...paymentData,
      timestamp: paymentData.timestamp || serverTimestamp(),
      createdAt: serverTimestamp(),
      status: paymentData.status || 'completed',
      paymentMethod: paymentData.paymentMethod || 'card',
      currency: paymentData.currency || 'INR'
    };

    // Add to Payments collection
    const docRef = await addDoc(collection(db, "Payments"), data);
    
    // Update the order status to "Processing" now that it's paid
    let orderUpdateSuccess = false;
    
    try {
      // First try to find order by orderId field
      const orderQuery = query(
        collection(db, "Orders"),
        where("orderId", "==", paymentData.orderId)
      );
      
      const orderSnapshot = await getDocs(orderQuery);
      if (!orderSnapshot.empty) {
        const orderDoc = orderSnapshot.docs[0];
        await updateDoc(doc(db, "Orders", orderDoc.id), {
          status: "Processing",
          isPaid: true,
          paymentId: docRef.id,
          paymentTimestamp: serverTimestamp(),
          'payment.status': 'completed',
          'payment.timestamp': serverTimestamp(),
          'payment.amount': paymentData.amount,
          'payment.method': paymentData.paymentMethod,
          'payment.id': docRef.id,
          'payment.details': paymentData.paymentDetails || {}
        });
        orderUpdateSuccess = true;
      } else {
        // If not found by orderId field, try by document ID
        const orderDocRef = doc(db, "Orders", paymentData.orderId);
        const orderDoc = await getDoc(orderDocRef);
        
        if (orderDoc.exists()) {
          await updateDoc(orderDocRef, {
            status: "Processing",
            isPaid: true,
            paymentId: docRef.id,
            paymentTimestamp: serverTimestamp(),
            'payment.status': 'completed',
            'payment.timestamp': serverTimestamp(),
            'payment.amount': paymentData.amount,
            'payment.method': paymentData.paymentMethod,
            'payment.id': docRef.id,
            'payment.details': paymentData.paymentDetails || {}
          });
          orderUpdateSuccess = true;
        } else {
          // Order not found for payment update
        }
      }
    } catch (orderUpdateError) {
      console.error("Error updating order status:", orderUpdateError);
      // Continue with payment creation even if order update fails
    }
    
    // Return the created payment with its ID and order update status
    return { 
      id: docRef.id, 
      ...data,
      orderUpdated: orderUpdateSuccess
    };
  } catch (error) {
    console.error("Error adding payment:", error);
    throw error;
  }
}

// Get all payments for a specific user
export async function getUserPayments(userId) {
  try {
    const q = query(
      collection(db, "Payments"),
      where("userId", "==", userId),
      orderBy("timestamp", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    const payments = [];
    
    querySnapshot.forEach((doc) => {
      payments.push({ id: doc.id, ...doc.data() });
    });
    
    return payments;
  } catch (error) {
    console.error("Error fetching user payments:", error);
    throw error;
  }
}

// Get payment by ID
export async function getPaymentById(paymentId) {
  try {
    const docRef = doc(db, "Payments", paymentId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error("Payment not found");
    }
  } catch (error) {
    console.error("Error fetching payment:", error);
    throw error;
  }
}

// Get payment by order ID
export async function getPaymentByOrderId(orderId) {
  try {
    const q = query(
      collection(db, "Payments"),
      where("orderId", "==", orderId)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    } else {
      return null; // No payment found for this order
    }
  } catch (error) {
    console.error("Error fetching payment by order ID:", error);
    throw error;
  }
}

// Delete a payment (typically used for admin purposes or test cleanup)
export async function deletePayment(paymentId) {
  try {
    await deleteDoc(doc(db, "Payments", paymentId));
    return { success: true };
  } catch (error) {
    console.error("Error deleting payment:", error);
    throw error;
  }
}
