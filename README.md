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
- Razorpay for payment processing

## Razorpay Integration

### Setting Up Razorpay

1. Create a Razorpay account at [razorpay.com](https://razorpay.com)
2. Get your API keys from the Razorpay Dashboard
3. Add keys to the `.env` file:
   ```
   VITE_RAZORPAY_KEY_ID=your_key_id
   VITE_RAZORPAY_KEY_SECRET=your_key_secret
   ```
4. For testing, use Razorpay's test mode keys and [test card details](https://razorpay.com/docs/payments/payments/test-card-details/)

### Test Card Details

For testing the payment flow, use these test cards:
- Card Number: 4111 1111 1111 1111
- Expiry: Any future date
- CVV: Any 3 digits
- Name: Any name

### Security Notes

- Never commit `.env` files with real API keys to version control
- For production, implement proper server-side handling of payments
- Consider using webhooks for payment verification in production

### Server Integration

For production use, deploy the included Express server for secure payment handling:

1. See [RAZORPAY_DEPLOYMENT.md](./docs/RAZORPAY_DEPLOYMENT.md) for deployment options
2. The server handles order creation and payment verification
3. Update the `VITE_API_URL` environment variable to point to your deployed server

## Payment Integration

FreightFox uses Razorpay for seamless payment processing. Our implementation includes:

- Multi-step order creation flow with ShadCN Dialog and Tabs
- Secure payment processing through Razorpay
- Cross-window payment state tracking for handling redirects and multi-tab scenarios
- Session recovery for interrupted payment flows
- Intelligent dialog management to prevent accidental closures during payment

### Payment Flow

1. User enters shipment details
2. System calculates shipping cost based on distance, weight, size, and service type
3. User initiates payment through Razorpay
4. On successful payment, shipment is created in Firebase
5. User receives confirmation and tracking ID

For more details on Razorpay integration, see [Razorpay Deployment Guide](./docs/RAZORPAY_DEPLOYMENT.md).
