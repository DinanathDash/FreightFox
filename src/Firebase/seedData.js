import { db, auth } from './sharedConfig.js';
import { collection, addDoc, Timestamp, serverTimestamp, getDocs, query, where, setDoc, doc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

async function createUsersIfNeeded() {
  try {
    // Define sample users
    const usersToCreate = [
      {
        email: 'user1@example.com',
        password: 'Password123!',
        name: 'John Doe',
        phone: '9022345678',
        address: '123 Main St, Mumbai, Maharashtra',
        profilePhoto: 'https://randomuser.me/api/portraits/men/1.jpg'
      },
      {
        email: 'user2@example.com',
        password: 'Password123!',
        name: 'Jane Smith',
        phone: '8122345670',
        address: '456 Park Ave, Delhi, NCR',
        profilePhoto: 'https://randomuser.me/api/portraits/women/2.jpg'
      },
      {
        email: 'user3@example.com',
        password: 'Password123!',
        name: 'Rahul Kumar',
        phone: '7122345677',
        address: '789 Ocean Blvd, Chennai, Tamil Nadu',
        profilePhoto: 'https://randomuser.me/api/portraits/men/3.jpg'
      }
    ];
    
    console.log('Creating users if they don\'t exist...');
    const userRefs = [];
    
    // Check for existing users in Firestore first
    const usersCollection = collection(db, 'Users');
    
    for (const user of usersToCreate) {
      try {
        // Try to create a new user with authentication
        console.log(`Creating user: ${user.email}`);
        
        // Check if user exists in Firebase Auth by trying to create them
        const userCredential = await createUserWithEmailAndPassword(auth, user.email, user.password)
          .catch(error => {
            // If user already exists, we'll handle this silently
            if (error.code === 'auth/email-already-in-use') {
              console.log(`User ${user.email} already exists in Auth`);
              return null;
            }
            throw error;
          });
        
        if (userCredential && userCredential.user) {
          // Update user profile
          await updateProfile(userCredential.user, {
            displayName: user.name,
            photoURL: user.profilePhoto
          });
          
          // Save additional user data in Firestore
          const userData = {
            uid: userCredential.user.uid,
            email: user.email,
            name: user.name,
            phone: user.phone,
            address: user.address,
            profilePhoto: user.profilePhoto,
            createdAt: serverTimestamp()
          };
          
          // Use the Auth UID as document ID in Firestore
          await setDoc(doc(db, 'Users', userCredential.user.uid), userData);
          console.log(`Added user with ID: ${userCredential.user.uid}`);
          userRefs.push({ id: userCredential.user.uid, ...userData });
        } else {
          // User already exists, fetch their data from Firestore
          const q = query(usersCollection, where("email", "==", user.email));
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            const existingUser = { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
            userRefs.push(existingUser);
            console.log(`Found existing user with ID: ${existingUser.id}`);
          } else {
            // If user exists in Auth but not in Firestore, create the Firestore record
            console.log(`Creating Firestore record for existing auth user: ${user.email}`);
            
            // Get existing users from Firestore to find their UID
            const userData = {
              email: user.email,
              name: user.name,
              phone: user.phone,
              address: user.address,
              profilePhoto: user.profilePhoto,
              createdAt: serverTimestamp()
            };
            
            // Create a new document with auto-generated ID
            const docRef = await addDoc(collection(db, 'Users'), userData);
            userRefs.push({ id: docRef.id, ...userData });
            console.log(`Added missing user record with ID: ${docRef.id}`);
          }
        }
      } catch (error) {
        console.error(`Error creating user ${user.email}:`, error);
      }
    }
    
    return userRefs;
  } catch (error) {
    console.error('Error creating users:', error);
    throw error;
  }
}

async function generateOrder(userId, packageDetails, sourceAddress, destinationAddress, status) {
  // Generate a random 8-digit order ID
  const orderId = Math.floor(10000000 + Math.random() * 90000000).toString();
  
  // Calculate shipping cost based on package size, weight and distance
  const { size, weight } = packageDetails;
  
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
  const currentDate = new Date();
  const arrivalDate = new Date(currentDate);
  arrivalDate.setDate(arrivalDate.getDate() + deliveryDays);
  
  // Generate a tracking code
  const trackingId = `TRK-${Math.floor(100000 + Math.random() * 900000)}`;
  
  // Create order object
  return {
    orderId,
    userId,
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
      estimatedArrivalDate: arrivalDate,
      arrivalDateString: `${arrivalDate.getDate().toString().padStart(2, '0')}-${(arrivalDate.getMonth() + 1).toString().padStart(2, '0')}-${arrivalDate.getFullYear()}`,
    },
    // For display in the dashboard
    category: packageDetails.category || "Standard",
    arrival: `${deliveryDays}d - ${destinationAddress.city}`,
    route: `${sourceAddress.city} → ${destinationAddress.city}`,
    status,
    createdAt: serverTimestamp(),
    cost: {
      baseCost: Number((weight * baseCostPerKg).toFixed(2)),
      sizeMultiplier,
      distanceCost: Number(distanceCost.toFixed(2)),
      totalAmount: Number(shippingCost.toFixed(2)),
      currency: "INR"
    }
  };
}

async function seedData() {
  try {
    // Get or create users
    const userRefs = await createUsersIfNeeded();
    
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
    
    // Generate multiple orders for each user
    const orders = [];
    
    console.log('Generating orders for users...');
    
    for (const user of userRefs) {
      // Generate 2-4 orders per user
      const numOrders = 2 + Math.floor(Math.random() * 3);
      
      for (let i = 0; i < numOrders; i++) {
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
        
        // Randomly select a status, with higher probability for Delivered
        const statusRandom = Math.random();
        let status;
        if (statusRandom < 0.4) {
          status = 'Delivered';
        } else if (statusRandom < 0.6) {
          status = 'Shipping';
        } else if (statusRandom < 0.8) {
          status = 'Pending';
        } else if (statusRandom < 0.9) {
          status = 'Processing';
        } else {
          status = 'Cancelled';
        }
        
        // Generate the order
        const order = await generateOrder(user.id, packageDetails, sourceAddress, destinationAddress, status);
        orders.push(order);
      }
    }
    
    console.log('Adding orders to Firestore...');
    for (const order of orders) {
      const docRef = await addDoc(collection(db, 'Orders'), order);
      console.log(`Added order with ID: ${docRef.id}, orderId: ${order.orderId}, tracking: ${order.trackingId}`);
    }
    
    console.log('Data seeding completed successfully!');
    return { success: true, userCount: userRefs.length, orderCount: orders.length };
  } catch (error) {
    console.error('Error seeding data:', error);
    return { success: false, error: error.message };
  }
}

export { seedData };
