import { db } from './sharedConfig.js';
import { 
  collection, 
  addDoc, 
  Timestamp, 
  serverTimestamp,
  query,
  where,
  doc,
  getDoc
} from 'firebase/firestore';
import { getAuthenticatedUsers } from './authUserData.js';

/**
 * Generate order for a specific user with date offset (months ago)
 */
async function generateOrderForUser(userId, monthsAgo = 0) {
  // First get the user details
  try {
    const userDoc = await getDoc(doc(db, 'Users', userId));
    if (!userDoc.exists()) {
      console.error(`User with ID ${userId} not found`);
      return null;
    }
    
    const userData = userDoc.data();
    
    // List of Indian cities for shipping addresses
    const cities = [
      { name: 'Mumbai', state: 'Maharashtra', pincode: '400001' },
      { name: 'Delhi', state: 'NCT', pincode: '110001' },
      { name: 'Bangalore', state: 'Karnataka', pincode: '560001' },
      { name: 'Chennai', state: 'Tamil Nadu', pincode: '600001' },
      { name: 'Hyderabad', state: 'Telangana', pincode: '500001' },
      { name: 'Kolkata', state: 'West Bengal', pincode: '700001' },
      { name: 'Ahmedabad', state: 'Gujarat', pincode: '380001' },
      { name: 'Pune', state: 'Maharashtra', pincode: '411001' },
      { name: 'Surat', state: 'Gujarat', pincode: '395001' },
      { name: 'Jaipur', state: 'Rajasthan', pincode: '302001' },
    ];
    
    // Package size categories
    const packageSizes = ['Small', 'Medium', 'Large', 'Extra Large'];
    
    // Package categories
    const packageCategories = ['Electronics', 'Clothing', 'Food', 'Books', 'Home Goods', 'Medical Supplies', 'Auto Parts', 'Furniture'];
    
    // Status options
    const statusOptions = ['Pending', 'Processing', 'Shipping', 'Delivered', 'Cancelled'];
    
    // Randomly select source and destination cities (ensure they're different)
    let sourceIndex = Math.floor(Math.random() * cities.length);
    let destinationIndex;
    do {
      destinationIndex = Math.floor(Math.random() * cities.length);
    } while (destinationIndex === sourceIndex);
    
    // Create addresses
    const sourceAddress = {
      street: `${Math.floor(1 + Math.random() * 999)} ${['Main St', 'Park Ave', 'Gandhi Road', 'MG Road', 'Nehru Blvd'][Math.floor(Math.random() * 5)]}`,
      city: cities[sourceIndex].name,
      state: cities[sourceIndex].state,
      pincode: cities[sourceIndex].pincode,
      landmark: `Near ${['Temple', 'Mall', 'Park', 'Hospital', 'School'][Math.floor(Math.random() * 5)]}`
    };
    
    const destinationAddress = {
      street: `${Math.floor(1 + Math.random() * 999)} ${['Main St', 'Park Ave', 'Gandhi Road', 'MG Road', 'Nehru Blvd'][Math.floor(Math.random() * 5)]}`,
      city: cities[destinationIndex].name,
      state: cities[destinationIndex].state,
      pincode: cities[destinationIndex].pincode,
      landmark: `Near ${['Temple', 'Mall', 'Park', 'Hospital', 'School'][Math.floor(Math.random() * 5)]}`
    };
    
    // Generate package details
    const packageSize = packageSizes[Math.floor(Math.random() * packageSizes.length)];
    const packageCategory = packageCategories[Math.floor(Math.random() * packageCategories.length)];
    
    // Weight based on size
    let weight;
    switch(packageSize) {
      case 'Small': weight = 1 + Math.random() * 4; break; // 1-5 kg
      case 'Medium': weight = 5 + Math.random() * 5; break; // 5-10 kg
      case 'Large': weight = 10 + Math.random() * 15; break; // 10-25 kg
      case 'Extra Large': weight = 25 + Math.random() * 75; break; // 25-100 kg
      default: weight = 5;
    }
    
    // Package dimensions based on size
    let dimensions;
    switch(packageSize) {
      case 'Small': dimensions = '30cm x 20cm x 10cm'; break;
      case 'Medium': dimensions = '50cm x 40cm x 20cm'; break;
      case 'Large': dimensions = '80cm x 60cm x 40cm'; break;
      case 'Extra Large': dimensions = '120cm x 80cm x 60cm'; break;
      default: dimensions = '50cm x 40cm x 20cm';
    }
    
    const packageDetails = {
      size: packageSize,
      weight: Number(weight.toFixed(2)),
      dimensions,
      category: packageCategory,
      description: `${packageSize} ${packageCategory} package`
    };
    
    // Generate a random order date based on monthsAgo parameter
    let orderDate;
    if (monthsAgo > 0) {
      // Create date in past months
      const now = new Date();
      const targetMonth = now.getMonth() - monthsAgo;
      const targetYear = now.getFullYear() + Math.floor(targetMonth / 12);
      const normalizedMonth = ((targetMonth % 12) + 12) % 12; // Handle negative month values
      
      // Get a random day in the month
      const daysInMonth = new Date(targetYear, normalizedMonth + 1, 0).getDate();
      const randomDay = Math.floor(Math.random() * daysInMonth) + 1;
      
      orderDate = new Date(targetYear, normalizedMonth, randomDay);
    } else {
      // Current month, random day
      const now = new Date();
      const daysInCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      const randomDay = Math.floor(Math.random() * daysInCurrentMonth) + 1;
      
      orderDate = new Date(now.getFullYear(), now.getMonth(), randomDay);
      
      // If random day is in the future, use today's date
      if (orderDate > now) {
        orderDate = now;
      }
    }
    
    // Generate a random 8-digit order ID
    const orderId = Math.floor(10000000 + Math.random() * 90000000).toString();
    
    // Calculate shipping cost based on package size, weight and distance
    const { size } = packageDetails;
    
    // Basic cost calculation
    // Base rate per kg and size category
    const baseCostPerKg = 20; // ₹20 per kg
    let sizeMultiplier = 1;
    
    // Size multipliers
    switch(size) {
      case 'Small': sizeMultiplier = 1; break;
      case 'Medium': sizeMultiplier = 1.5; break;
      case 'Large': sizeMultiplier = 2.3; break;
      case 'Extra Large': sizeMultiplier = 3.5; break;
      default: sizeMultiplier = 1;
    }
    
    // Calculate the distance between source and destination
    // In a real app, this would use an API like Google Maps
    // Here we're using a simplified approach with random distances
    const distance = Math.floor(100 + Math.random() * 900); // 100km to 1000km
    
    // Distance rate: ₹10 per 100 km
    const distanceRate = 10;
    const distanceCost = (distance / 100) * distanceRate;
    
    // Calculate total shipping cost
    const shippingCost = (weight * baseCostPerKg * sizeMultiplier) + distanceCost;
    
    // Calculate estimated delivery time based on distance
    // Assumption: Average speed is 300 km per day for ground shipping
    const deliveryDays = Math.ceil(distance / 300);
    
    // Calculate estimated arrival date
    const arrivalDate = new Date(orderDate);
    arrivalDate.setDate(arrivalDate.getDate() + deliveryDays);
    
    // Generate a tracking code
    const trackingId = `TRK-${Math.floor(100000 + Math.random() * 900000)}`;
    
    // Determine appropriate status based on dates
    let status;
    const now = new Date();
    
    if (arrivalDate < now) {
      // If the estimated arrival date is in the past, most likely delivered
      status = Math.random() > 0.1 ? 'Delivered' : 'Cancelled';
    } else if (orderDate < now) {
      // If order date is in the past but arrival date is in future, it's in process
      const statusRandom = Math.random();
      if (statusRandom < 0.6) {
        status = 'Shipping';
      } else {
        status = 'Processing';
      }
    } else {
      status = 'Pending';
    }
    
    // Create order object
    const order = {
      orderId,
      userId,
      userName: userData.name || userData.displayName || 'Unknown User',
      userEmail: userData.email || 'unknown@example.com',
      trackingId,
      packageDetails: {
        ...packageDetails,
        description: packageDetails.description || "Standard shipping package",
      },
      shipping: {
        source: sourceAddress,
        destination: destinationAddress,
        distance: distance, // in kilometers
        estimatedDeliveryDays: deliveryDays,
        estimatedArrivalDate: Timestamp.fromDate(arrivalDate),
        arrivalDateString: `${arrivalDate.getDate().toString().padStart(2, '0')}-${(arrivalDate.getMonth() + 1).toString().padStart(2, '0')}-${arrivalDate.getFullYear()}`,
      },
      // For display in the dashboard
      category: packageDetails.category || "Standard",
      arrival: `${deliveryDays}d - ${destinationAddress.city}`,
      route: `${sourceAddress.city} → ${destinationAddress.city}`,
      status,
      createdAt: Timestamp.fromDate(orderDate),
      cost: {
        baseCost: Number((weight * baseCostPerKg).toFixed(2)),
        sizeMultiplier,
        distanceCost: Number(distanceCost.toFixed(2)),
        totalAmount: Number(shippingCost.toFixed(2)),
        currency: "INR"
      }
    };
    
    // Add the document to Firestore
    const docRef = await addDoc(collection(db, 'Orders'), order);
    console.log(`Created order with ID: ${docRef.id} for user: ${userId}, date: ${orderDate.toISOString().split('T')[0]}`);
    
    return { id: docRef.id, ...order };
  } catch (error) {
    console.error(`Error generating order for user ${userId}:`, error);
    throw error;
  }
}

/**
 * Create multiple orders for each user over the past 5 months
 */
export async function generateHistoricalOrders() {
  try {
    // Get existing authenticated users from Firebase Auth
    const users = await getAuthenticatedUsers();
    
    if (users.length === 0) {
      console.log("No authenticated users found!");
      return { success: false, error: "No users found" };
    }
    
    console.log(`Generating orders for ${users.length} existing users...`);
    
    const createdOrders = [];
    
    // For each user, create varying numbers of orders across the last 5 months
    for (const user of users) {
      console.log(`Processing user: ${user.name || user.email || user.id}`);
      
      // Create orders for current month (1-3 orders)
      const currentMonthOrderCount = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < currentMonthOrderCount; i++) {
        const order = await generateOrderForUser(user.id, 0);
        if (order) createdOrders.push(order);
      }
      
      // Create orders for past 5 months (1-3 orders per month)
      for (let month = 1; month <= 5; month++) {
        const monthOrderCount = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < monthOrderCount; i++) {
          const order = await generateOrderForUser(user.id, month);
          if (order) createdOrders.push(order);
        }
      }
    }
    
    console.log(`Successfully created ${createdOrders.length} orders for ${users.length} users.`);
    return { success: true, orderCount: createdOrders.length, userCount: users.length };
    
  } catch (error) {
    console.error("Error generating historical orders:", error);
    return { success: false, error: error.message };
  }
}