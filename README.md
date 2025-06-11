# FreightFox - Shipment Tracking Platform

A modern web application for tracking and managing shipments and orders with real-time updates.

## Features

- User authentication with Firebase Auth
- Real-time order tracking with Firestore
- Interactive tracking map
- Timeline visualization for shipment progress
- Dashboard with order statistics and analytics

## Order Structure

Orders in FreightFox are now structured with direct `from` and `to` properties instead of nesting them inside a shipping object. This makes it easier to access location data for tracking purposes.

Example order structure:

```javascript
{
  orderId: "12345678",
  trackingId: "TRK-123456",
  userId: "user123",
  from: {
    street: "123 Main St",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400001",
    landmark: "Near Gateway of India",
    coordinates: { lat: 19.076, lng: 72.8777 }
  },
  to: {
    street: "456 Park Ave",
    city: "Delhi",
    state: "NCT",
    pincode: "110001",
    landmark: "Near India Gate",
    coordinates: { lat: 28.7041, lng: 77.1025 }
  },
  distance: 1200, // kilometers
  estimatedDeliveryDays: 4,
  status: "In Transit",
  // other order details...
}
```

## Setup & Development

### Installation

```bash
npm install
```

### Running the application

```bash
npm run dev
```

### Data Generation

To generate sample orders with the new `from/to` structure:

```bash
npm run generate-new-orders
```

This script will fetch users from the Firebase users collection and create multiple orders for each user with realistic shipment details.

## Technology Stack

- React
- Firebase (Authentication & Firestore)
- Leaflet for maps
- TailwindCSS + shadcn/ui for styling

## Payment Integration

FreightFox uses a simple direct payment system. Our implementation includes:

- Multi-step order creation flow with ShadCN Dialog and Tabs
- Order creation based on user input
- Shipping cost calculation based on distance, weight, size, and service type

### Payment Flow

1. User enters shipment details
2. System calculates shipping cost based on distance, weight, size, and service type
3. User creates the shipment
4. Shipment is created in Firebase
5. User receives confirmation and tracking ID
