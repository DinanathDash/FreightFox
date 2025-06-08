import { db } from './sharedConfig.js';
import { collection, addDoc, getDocs, query, where, setDoc, doc, serverTimestamp, Timestamp } from 'firebase/firestore';

// Sample data based on the Firebase details provided
const sampleOrder = {
  arrival: "1d - Surat",
  arrivalDateString: "20-04-2025",
  category: "Books",
  cost: {
    baseCost: 130.56,
    currency: "INR",
    distanceCost: 26.8,
    sizeMultiplier: 1.5,
    totalAmount: 222.64
  },
  createdAt: Timestamp.fromDate(new Date("April 19, 2025")),
  distance: 268,
  estimatedArrivalDate: Timestamp.fromDate(new Date("April 20, 2025")),
  estimatedDeliveryDays: 1,
  from: {
    city: "Hyderabad",
    landmark: "Near Park",
    pincode: "500001",
    state: "Telangana",
    street: "963 Main St"
  },
  orderId: "69773610",
  packageDetails: {
    category: "Books",
    description: "Medium Books package",
    dimensions: "50cm x 40cm x 20cm",
    size: "Medium",
    weight: 6.53
  },
  route: "Hyderabad → Surat",
  status: "Delivered",
  to: {
    city: "Surat",
    landmark: "Near Mall",
    pincode: "395001",
    state: "Gujarat",
    street: "300 MG Road"
  },
  trackingId: "TRK-120829",
  userEmail: "t5379880@gmail.com",
  userId: "user_xufe9l9ljzf",
  userName: "T5379880"
};

// More sample orders with different data
const additionalOrders = [
  {
    ...sampleOrder,
    orderId: "56910240",
    trackingId: "TRK-220198",
    status: "Pending",
    from: {
      ...sampleOrder.from,
      city: "Delhi",
      state: "Delhi"
    },
    to: {
      ...sampleOrder.to,
      city: "Mumbai",
      state: "Maharashtra"
    },
    packageDetails: {
      ...sampleOrder.packageDetails,
      category: "Electronics",
      description: "Laptop and accessories",
      weight: 4.2
    },
    route: "Delhi → Mumbai",
    distance: 1421,
    createdAt: Timestamp.fromDate(new Date("June 1, 2025")),
    estimatedArrivalDate: Timestamp.fromDate(new Date("June 5, 2025")),
    estimatedDeliveryDays: 4,
    cost: {
      ...sampleOrder.cost,
      totalAmount: 345.80
    }
  },
  {
    ...sampleOrder,
    orderId: "45273139",
    trackingId: "TRK-935761",
    status: "Pending",
    from: {
      ...sampleOrder.from,
      city: "Bangalore",
      state: "Karnataka"
    },
    to: {
      ...sampleOrder.to,
      city: "Chennai",
      state: "Tamil Nadu"
    },
    packageDetails: {
      ...sampleOrder.packageDetails,
      category: "Clothing",
      description: "Winter clothing",
      weight: 3.1
    },
    route: "Bangalore → Chennai",
    distance: 346,
    createdAt: Timestamp.fromDate(new Date("May 28, 2025")),
    estimatedArrivalDate: Timestamp.fromDate(new Date("May 30, 2025")),
    estimatedDeliveryDays: 2
  },
  {
    ...sampleOrder,
    orderId: "46369789",
    trackingId: "TRK-091284",
    status: "Pending",
    from: {
      ...sampleOrder.from,
      city: "Kolkata",
      state: "West Bengal"
    },
    to: {
      ...sampleOrder.to,
      city: "Pune",
      state: "Maharashtra"
    },
    packageDetails: {
      ...sampleOrder.packageDetails,
      category: "Furniture",
      description: "Desk chair",
      weight: 12.8
    },
    route: "Kolkata → Pune",
    distance: 1867,
    createdAt: Timestamp.fromDate(new Date("May 25, 2025")),
    estimatedArrivalDate: Timestamp.fromDate(new Date("June 1, 2025")),
    estimatedDeliveryDays: 7
  },
  {
    ...sampleOrder,
    orderId: "99241245",
    trackingId: "TRK-476291",
    status: "Pending",
    from: {
      ...sampleOrder.from,
      city: "Jaipur",
      state: "Rajasthan"
    },
    to: {
      ...sampleOrder.to,
      city: "Ahmedabad",
      state: "Gujarat"
    },
    packageDetails: {
      ...sampleOrder.packageDetails,
      category: "Art",
      description: "Handcrafted pottery",
      weight: 5.7
    },
    route: "Jaipur → Ahmedabad",
    distance: 648,
    createdAt: Timestamp.fromDate(new Date("May 22, 2025")),
    estimatedArrivalDate: Timestamp.fromDate(new Date("May 26, 2025")),
    estimatedDeliveryDays: 4
  },
  {
    ...sampleOrder,
    orderId: "29602259",
    trackingId: "TRK-772149",
    status: "Delivered",
    from: {
      ...sampleOrder.from,
      city: "Indore",
      state: "Madhya Pradesh"
    },
    to: {
      ...sampleOrder.to,
      city: "Bhopal",
      state: "Madhya Pradesh"
    },
    packageDetails: {
      ...sampleOrder.packageDetails,
      category: "Food",
      description: "Special sweets",
      weight: 2.3
    },
    route: "Indore → Bhopal",
    distance: 192,
    createdAt: Timestamp.fromDate(new Date("April 10, 2025")),
    estimatedArrivalDate: Timestamp.fromDate(new Date("April 11, 2025")),
    estimatedDeliveryDays: 1
  }
];

// Helper function to add a pre-defined order
export async function addSampleOrder() {
  try {
    const ordersRef = collection(db, 'Orders');
    
    // Check if the sample order already exists
    const q = query(ordersRef, where("orderId", "==", sampleOrder.orderId));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      // If it doesn't exist, add it
      const docRef = await addDoc(ordersRef, sampleOrder);
      console.log("Sample order added with ID:", docRef.id);
      return docRef.id;
    } else {
      console.log("Sample order already exists");
      return querySnapshot.docs[0].id;
    }
  } catch (error) {
    console.error("Error adding sample order:", error);
    throw error;
  }
}

// Add multiple orders for testing
export async function addMultipleSampleOrders() {
  try {
    const ordersRef = collection(db, 'Orders');
    const results = [];
    
    // Add original sample order
    const q = query(ordersRef, where("orderId", "==", sampleOrder.orderId));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      const docRef = await addDoc(ordersRef, sampleOrder);
      results.push({ id: docRef.id, orderId: sampleOrder.orderId });
    } else {
      results.push({ id: querySnapshot.docs[0].id, orderId: sampleOrder.orderId, existed: true });
    }
    
    // Add additional orders
    for (const order of additionalOrders) {
      const q = query(ordersRef, where("orderId", "==", order.orderId));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        const docRef = await addDoc(ordersRef, order);
        results.push({ id: docRef.id, orderId: order.orderId });
      } else {
        results.push({ id: querySnapshot.docs[0].id, orderId: order.orderId, existed: true });
      }
    }
    
    console.log("Orders added or found:", results);
    return results;
  } catch (error) {
    console.error("Error adding multiple sample orders:", error);
    throw error;
  }
}

// Helper function to check if orders exist in the database
export async function checkOrdersExist() {
  try {
    const ordersRef = collection(db, 'Orders');
    const snapshot = await getDocs(ordersRef);
    
    if (snapshot.empty) {
      console.log("No orders found in the database");
      return false;
    } else {
      console.log(`Found ${snapshot.size} orders in the database`);
      return true;
    }
  } catch (error) {
    console.error("Error checking orders:", error);
    throw error;
  }
}

// Main function to ensure sample data exists
export async function ensureSampleDataExists() {
  try {
    const hasOrders = await checkOrdersExist();
    
    if (!hasOrders) {
      console.log("No orders found. Adding sample data...");
      await addMultipleSampleOrders();
      return true;
    } else {
      console.log("Orders already exist in the database");
      return false;
    }
  } catch (error) {
    console.error("Error ensuring sample data exists:", error);
    throw error;
  }
}

export default {
  addSampleOrder,
  addMultipleSampleOrders,
  checkOrdersExist,
  ensureSampleDataExists
};
