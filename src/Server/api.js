// Serverless Express API for handling Razorpay integration
// This can be deployed to Firebase Cloud Functions, Vercel, or Netlify

const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const Razorpay = require('razorpay');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors({ origin: true }));

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.VITE_RAZORPAY_KEY_ID,
  key_secret: process.env.VITE_RAZORPAY_KEY_SECRET,
});

// Create an order with Razorpay
app.post('/api/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt, notes } = req.body;
    
    const options = {
      amount: Math.round(amount * 100), // convert to paise
      currency,
      receipt,
      notes,
    };
    
    const order = await razorpay.orders.create(options);
    res.status(200).json(order);
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Verify payment signature
app.post('/api/verify-payment', (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature 
    } = req.body;

    // Creating the signature verification string
    const signatureVerificationString = 
      razorpay_order_id + '|' + razorpay_payment_id;
    
    // Creating the HMAC with SHA256
    const expectedSignature = crypto
      .createHmac('sha256', process.env.VITE_RAZORPAY_KEY_SECRET)
      .update(signatureVerificationString)
      .digest('hex');
    
    // Compare signatures
    const isValid = expectedSignature === razorpay_signature;
    
    if (isValid) {
      res.status(200).json({ valid: true });
    } else {
      res.status(400).json({ valid: false, error: 'Invalid payment signature' });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ valid: false, error: 'Payment verification failed' });
  }
});

// Get payment details
app.get('/api/payment/:paymentId', async (req, res) => {
  try {
    const { paymentId } = req.params;
    const payment = await razorpay.payments.fetch(paymentId);
    res.status(200).json(payment);
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({ error: 'Failed to fetch payment details' });
  }
});

// Export for serverless
module.exports = app;

// For local development
if (process.env.NODE_ENV === 'development') {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
