# FreightFox Payment System

This directory contains the components and utilities for the FreightFox payment system, which is designed to handle payment processing for shipping orders in a manner similar to Razorpay.

## Components

### Payment Form Components

| Component | Description |
|-----------|-------------|
| `PaymentForm.jsx` | Form for collecting card/UPI/wallet/netbanking payment info with demo cards |
| `PaymentDialog.jsx` | Dialog wrapper for the payment form with success message |
| `PaymentCard.jsx` | Component to display payment details |
| `PaymentMethodSelector.jsx` | Component for selecting payment methods |
| `PaymentHistory.jsx` | Component to display user's payment history |
| `PaymentSummary.jsx` | Component to show payment summary with "Pay Now" button |
| `PaymentProcessingAnimation.jsx` | Visual animation for payment processing |

## Demo Payment Details

### Card Payment

Use the following demo card details for testing:

#### Visa
- Number: 4111 1111 1111 1111
- Name: Test User
- Expiry: 12/28
- CVV: 123

#### Mastercard
- Number: 5555 5555 5555 4444
- Name: Test User
- Expiry: 12/28
- CVV: 123

#### American Express
- Number: 3714 4963 5398 431
- Name: Test User
- Expiry: 12/28
- CVV: 1234

#### RuPay
- Number: 6522 3614 6548 7894
- Name: Test User
- Expiry: 12/28
- CVV: 123

### UPI Payment

Any UPI ID in the format `name@upi` will be accepted for testing.

### Net Banking

Select any bank from the list to test net banking payments.

### Wallet

Select any wallet provider to test wallet payments.

## Integration

The payment system integrates with the rest of the application as follows:

1. **Shipment Creation**: When a shipment is created, the user is prompted to complete payment through the `PaymentDialog`.

2. **Order Payment**: Existing orders can be paid for through the `PaymentSummary` component in the `ShipmentDetails` page.

3. **Payment History**: Users can view their payment history on the dedicated Payments page.

## Database Schema

Payments are stored in the Firestore `Payments` collection with the following structure:

```javascript
{
  userId: "user-id",
  orderId: "order-id",
  amount: 1000,
  currency: "INR",
  paymentMethod: "card|upi|netbanking|wallet",
  paymentDetails: {
    // Method-specific details like cardType, lastFourDigits, etc.
  },
  status: "completed|failed|pending",
  timestamp: FirestoreTimestamp,
  createdAt: FirestoreTimestamp
}
```

When a payment is completed, the related order in the `Orders` collection is updated with the following fields:

```javascript
{
  status: "Processing",
  isPaid: true,
  paymentId: "payment-id",
  paymentTimestamp: FirestoreTimestamp,
  payment: {
    status: "completed",
    timestamp: FirestoreTimestamp,
    amount: 1000,
    method: "card|upi|netbanking|wallet",
    id: "payment-id",
    details: {
      // Method-specific details
    }
  }
}
```

## Services

Payment-related Firestore operations are handled in `/Firebase/paymentServices.js`:

- `addPayment`: Create a new payment and update the related order
- `getUserPayments`: Fetch all payments for a specific user
- `getPaymentById`: Fetch a payment by ID
- `getPaymentByOrderId`: Fetch payment(s) related to a specific order
- `deletePayment`: Remove a payment (admin function)
