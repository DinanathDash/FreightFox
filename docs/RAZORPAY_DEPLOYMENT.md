# Razorpay Server Deployment Guide

This guide explains how to deploy the Razorpay integration server for FreightFox.

## Local Development

1. Install dependencies:
   ```bash
   cd src/Server
   npm install
   ```

2. Create a `.env` file in the server directory:
   ```
   VITE_RAZORPAY_KEY_ID=your_key_id
   VITE_RAZORPAY_KEY_SECRET=your_key_secret
   PORT=3001
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Deploying to Production

### Option 1: Vercel Serverless Functions

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Create a `vercel.json` file in the project root:
   ```json
   {
     "version": 2,
     "builds": [
       { "src": "src/Server/api.js", "use": "@vercel/node" }
     ],
     "routes": [
       { "src": "/api/(.*)", "dest": "src/Server/api.js" }
     ]
   }
   ```

3. Deploy:
   ```bash
   vercel
   ```

4. Set environment variables in the Vercel dashboard.

### Option 2: Firebase Cloud Functions

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Initialize Firebase Functions:
   ```bash
   firebase init functions
   ```

3. Modify your `functions/index.js`:
   ```javascript
   const functions = require('firebase-functions');
   const app = require('../src/Server/api');

   exports.api = functions.https.onRequest(app);
   ```

4. Set environment variables:
   ```bash
   firebase functions:config:set razorpay.key_id="your_key_id" razorpay.key_secret="your_key_secret"
   ```

5. Deploy:
   ```bash
   firebase deploy --only functions
   ```

## Client Configuration

After deploying, update the `API_URL` in `src/Firebase/apiClient.js` to point to your production API endpoint:

```javascript
const API_URL = import.meta.env.VITE_API_URL || 'https://your-api-endpoint.com';
```

Set the `VITE_API_URL` environment variable in your frontend deployment.

## Cross-Window Payment State Tracking

FreightFox implements a robust cross-window payment state tracking system that helps maintain payment state across multiple browser windows and sessions. This system is important for handling payment interruptions, browser refreshes, and other edge cases during the Razorpay checkout flow.

### How it works

1. **LocalStorage-based state tracking**:
   - Payment state is stored in localStorage under the key `freightfox_payment_state`
   - Payment sessions are stored under the key `freightfox_payment_session`
   - This allows cross-window communication and state recovery

2. **State synchronization**:
   - When a payment is initiated, modified, completed, or cancelled in one window, all other windows with the FreightFox app open will receive updates
   - This prevents duplicate payments and ensures consistent UI feedback

3. **Available payment states**:
   - `idle`: No payment in progress
   - `initiated`: Payment has been started
   - `processing`: Payment is being processed
   - `authenticating`: Additional authentication is required (e.g., OTP)
   - `redirected`: User has been redirected to bank website for verification
   - `success`: Payment was successful
   - `failed`: Payment failed
   - `cancelled`: Payment was cancelled by the user

4. **Payment recovery**:
   - If a payment is interrupted (page refresh, browser crash, etc.), a recovery alert is shown
   - Sessions are stored for 30 minutes, after which they expire
   - The system can recover partial form data and resume payments

5. **Navigation protection**:
   - The system prevents accidental navigation (browser back button) during active payments
   - Warning prompts are shown when attempting to close windows or navigate away

### Integration points

- `paymentStateTracking.js`: Core functionality for state management
- `razorpayUtils.js`: Integration with Razorpay and event handling
- `CreateShipmentDialog.jsx`: UI components and user interactions
- `payment-status.jsx`: Visual feedback about payment states
- `payment-recovery-alert.jsx`: Recovery mechanism for interrupted payments

### Important methods

- `updatePaymentState(state, data)`: Update payment state across windows
- `subscribeToPaymentStateChanges(callback)`: Listen for state changes
- `savePaymentSession(sessionData)`: Save session for recovery
- `getPaymentSession()`: Get saved session if not expired
- `clearPaymentSession()`: Remove saved session data

### Security considerations

- No sensitive payment information (card details) is stored in localStorage
- Only payment state, order IDs, and minimal session data are stored
- All stored data is cleared after successful payment or session expiration
