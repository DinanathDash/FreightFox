// Utility functions for generating coordinates and route data for orders

// Major cities around the world with their coordinates
const majorCities = [
  { city: 'New York', country: 'USA', coordinates: { lat: 40.7128, lng: -74.0060 } },
  { city: 'Los Angeles', country: 'USA', coordinates: { lat: 34.0522, lng: -118.2437 } },
  { city: 'Chicago', country: 'USA', coordinates: { lat: 41.8781, lng: -87.6298 } },
  { city: 'Houston', country: 'USA', coordinates: { lat: 29.7604, lng: -95.3698 } },
  { city: 'Phoenix', country: 'USA', coordinates: { lat: 33.4484, lng: -112.0740 } },
  { city: 'Philadelphia', country: 'USA', coordinates: { lat: 39.9526, lng: -75.1652 } },
  { city: 'San Antonio', country: 'USA', coordinates: { lat: 29.4241, lng: -98.4936 } },
  { city: 'San Diego', country: 'USA', coordinates: { lat: 32.7157, lng: -117.1611 } },
  { city: 'Dallas', country: 'USA', coordinates: { lat: 32.7767, lng: -96.7970 } },
  { city: 'San Jose', country: 'USA', coordinates: { lat: 37.3382, lng: -121.8863 } },
  { city: 'London', country: 'UK', coordinates: { lat: 51.5074, lng: -0.1278 } },
  { city: 'Berlin', country: 'Germany', coordinates: { lat: 52.5200, lng: 13.4050 } },
  { city: 'Paris', country: 'France', coordinates: { lat: 48.8566, lng: 2.3522 } },
  { city: 'Tokyo', country: 'Japan', coordinates: { lat: 35.6762, lng: 139.6503 } },
  { city: 'Sydney', country: 'Australia', coordinates: { lat: -33.8688, lng: 151.2093 } },
  { city: 'Mumbai', country: 'India', coordinates: { lat: 19.0760, lng: 72.8777 } },
  { city: 'Delhi', country: 'India', coordinates: { lat: 28.7041, lng: 77.1025 } },
  { city: 'Bangalore', country: 'India', coordinates: { lat: 12.9716, lng: 77.5946 } },
  { city: 'Chennai', country: 'India', coordinates: { lat: 13.0827, lng: 80.2707 } },
  { city: 'Kolkata', country: 'India', coordinates: { lat: 22.5726, lng: 88.3639 } }
];

// Get a random city from the list
export function getRandomCity() {
  return majorCities[Math.floor(Math.random() * majorCities.length)];
}

// Calculate distance between two points using Haversine formula
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in kilometers
  return Math.round(distance);
}

// Get a point along a route between source and destination
export function getPointAlongRoute(source, destination, progress) {
  // Simple linear interpolation between source and destination
  const lat = source.lat + (destination.lat - source.lat) * progress;
  const lng = source.lng + (destination.lng - source.lng) * progress;
  
  return { lat, lng };
}

// Enhance an order with realistic shipping coordinates
export function enhanceOrderWithCoordinates(order) {
  if (!order) return order;
  
  // Create a copy of the order to avoid mutating the original
  const enhancedOrder = { ...order };
  
  // Map Firebase data structure to UI expected structure
  if (order.from) {
    enhancedOrder.origin = `${order.from.city}, ${order.from.state}`;
    enhancedOrder.originAddress = `${order.from.street || ''}, ${order.from.landmark || ''}, ${order.from.city}, ${order.from.state}, ${order.from.pincode}`;
    enhancedOrder.originCoordinates = { lat: 0, lng: 0 }; // You'd need to add real coordinates
  }
  
  if (order.to) {
    enhancedOrder.destination = `${order.to.city}, ${order.to.state}`;
    enhancedOrder.destinationAddress = `${order.to.street || ''}, ${order.to.landmark || ''}, ${order.to.city}, ${order.to.state}, ${order.to.pincode}`;
    enhancedOrder.destinationCoordinates = { lat: 0, lng: 0 }; // You'd need to add real coordinates
  }
  
  // Ensure route is set
  if (!enhancedOrder.route && order.from && order.to) {
    enhancedOrder.route = `${order.from.city} → ${order.to.city}`;
  }
  
  // Map package details
  if (order.packageDetails) {
    enhancedOrder.weight = order.packageDetails.weight;
    enhancedOrder.dimensions = order.packageDetails.dimensions;
    enhancedOrder.category = order.packageDetails.category || order.category;
    enhancedOrder.description = order.packageDetails.description;
  }
  
  // Ensure category is set
  if (!enhancedOrder.category && order.category) {
    enhancedOrder.category = order.category;
  }
  
  // Map dates and convert Firebase timestamp to JavaScript Date if needed
  if (order.createdAt) {
    if (typeof order.createdAt.toDate === 'function') {
      enhancedOrder.timestamp = order.createdAt.toDate();
      enhancedOrder.created = order.createdAt.toDate();
    } else if (order.createdAt instanceof Date) {
      enhancedOrder.timestamp = order.createdAt;
      enhancedOrder.created = order.createdAt;
    } else if (typeof order.createdAt === 'string') {
      enhancedOrder.timestamp = new Date(order.createdAt);
      enhancedOrder.created = new Date(order.createdAt);
    }
  }
  
  if (order.estimatedArrivalDate) {
    if (typeof order.estimatedArrivalDate.toDate === 'function') {
      enhancedOrder.expectedDelivery = order.estimatedArrivalDate.toDate();
    } else if (order.estimatedArrivalDate instanceof Date) {
      enhancedOrder.expectedDelivery = order.estimatedArrivalDate;
    } else if (typeof order.estimatedArrivalDate === 'string') {
      enhancedOrder.expectedDelivery = new Date(order.estimatedArrivalDate);
    }
  }
  
  // Map cost details
  if (order.cost) {
    enhancedOrder.price = order.cost.totalAmount;
    enhancedOrder.currency = order.cost.currency || 'INR';
  }
  
  // Ensure orderId is available
  if (!enhancedOrder.orderId && order.id) {
    enhancedOrder.orderId = order.id;
  }
  
  // Add shipping service information
  enhancedOrder.carrier = enhancedOrder.carrier || "FreightFox";
  enhancedOrder.serviceType = enhancedOrder.serviceType || "Standard";
  
  return enhancedOrder;
}

export default {
  getRandomCity,
  calculateDistance,
  getPointAlongRoute,
  enhanceOrderWithCoordinates
};
