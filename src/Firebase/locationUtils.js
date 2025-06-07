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
  // Create default shipping object if it doesn't exist
  const shipping = order.shipping || {};
  
  // Use existing source and destination cities if available
  let sourceCity;
  let destinationCity;
  
  // If we already have source city information but no coordinates
  if (shipping.source && shipping.source.city) {
    // Find the matching city in our majorCities list
    sourceCity = majorCities.find(c => c.city === shipping.source.city);
    // If not found, use a matching country or random city
    if (!sourceCity) {
      if (shipping.source.country) {
        // Try to find a city in the same country
        const citiesInCountry = majorCities.filter(c => c.country === shipping.source.country);
        if (citiesInCountry.length > 0) {
          sourceCity = citiesInCountry[0];
        }
      }
      // If still not found, use a random city but preserve the city name
      if (!sourceCity) {
        const randomCity = getRandomCity();
        sourceCity = {
          city: shipping.source.city,
          country: shipping.source.country || randomCity.country,
          coordinates: randomCity.coordinates
        };
      }
    }
  } else {
    // If no source info at all, generate a random one
    sourceCity = getRandomCity();
  }
  
  // Same approach for destination
  if (shipping.destination && shipping.destination.city) {
    destinationCity = majorCities.find(c => c.city === shipping.destination.city);
    if (!destinationCity) {
      if (shipping.destination.country) {
        const citiesInCountry = majorCities.filter(c => c.country === shipping.destination.country);
        if (citiesInCountry.length > 0) {
          destinationCity = citiesInCountry[0];
        }
      }
      if (!destinationCity) {
        const randomCity = getRandomCity();
        destinationCity = {
          city: shipping.destination.city,
          country: shipping.destination.country || randomCity.country,
          coordinates: randomCity.coordinates
        };
      }
    }
  } else {
    // Make sure destination is different from source
    do {
      destinationCity = getRandomCity();
    } while (destinationCity.city === sourceCity.city);
  }
  
  // Calculate distance
  const distance = calculateDistance(
    sourceCity.coordinates.lat,
    sourceCity.coordinates.lng,
    destinationCity.coordinates.lat,
    destinationCity.coordinates.lng
  );
  
  // Calculate current location based on status
  let currentLocation = null;
  let progress = 0;
  
  switch(order.status) {
    case 'Processing':
      progress = 0;
      break;
    case 'Shipped':
      progress = 0.25;
      break;
    case 'In Transit':
      progress = 0.5;
      break;
    case 'Out for Delivery':
      progress = 0.75;
      break;
    case 'Delivered':
      progress = 1;
      break;
    default:
      progress = Math.random(); // Random location along the route
  }
  
  // For everything except delivered or processing, calculate current point
  if (progress > 0 && progress < 1) {
    const current = getPointAlongRoute(
      sourceCity.coordinates,
      destinationCity.coordinates,
      progress
    );
    
    currentLocation = {
      coordinates: current,
      // Find the closest city or just say "In Transit"
      city: "In Transit",
      country: sourceCity.country
    };
  }
  
  // Create shipping object with coordinates, preserving original data
  const enhancedShipping = {
    ...shipping,
    source: {
      ...(shipping.source || {}),  // Preserve any existing fields
      city: sourceCity.city,
      country: sourceCity.country,
      coordinates: sourceCity.coordinates
    },
    destination: {
      ...(shipping.destination || {}),  // Preserve any existing fields
      city: destinationCity.city,
      country: destinationCity.country,
      coordinates: destinationCity.coordinates
    },
    distance,
    currentLocation
  };
  
  // Return the enhanced order
  return {
    ...order,
    shipping: enhancedShipping
  };
}

export default {
  getRandomCity,
  calculateDistance,
  getPointAlongRoute,
  enhanceOrderWithCoordinates
};
