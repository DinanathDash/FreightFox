// Client-side API utilities for Razorpay integration

// Base API URL - update this based on where your API is hosted
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Create a new Razorpay order
 * @param {Object} orderData - Order data including amount, currency, etc.
 */
export const createRazorpayOrder = async (orderData) => {
  try {
    const response = await fetch(`${API_URL}/api/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      throw new Error('Failed to create order');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    throw error;
  }
};

/**
 * Verify a Razorpay payment
 * @param {Object} paymentData - Payment response from Razorpay
 */
export const verifyRazorpayPayment = async (paymentData) => {
  try {
    const response = await fetch(`${API_URL}/api/verify-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });

    if (!response.ok) {
      throw new Error('Payment verification failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw error;
  }
};

/**
 * Get details of a payment
 * @param {string} paymentId - Razorpay payment ID
 */
export const getPaymentDetails = async (paymentId) => {
  try {
    const response = await fetch(`${API_URL}/api/payment/${paymentId}`);

    if (!response.ok) {
      throw new Error('Failed to fetch payment details');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching payment details:', error);
    throw error;
  }
};

/**
 * Helper function to load Razorpay script with retry logic
 * @param {number} maxRetries - Maximum number of retry attempts
 */
export const loadRazorpayScript = (maxRetries = 3) => {
  return new Promise((resolve) => {
    // Check if Razorpay already exists in the window
    if (window.Razorpay) {
      console.log("Razorpay already loaded");
      resolve(true);
      return;
    }
    
    let retryCount = 0;
    
    const loadScript = () => {
      // Remove any existing failed script
      const existingScript = document.querySelector('script[src*="checkout.razorpay.com"]');
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
      
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      
      script.onload = () => {
        console.log("Razorpay script loaded successfully");
        resolve(true);
      };
      
      script.onerror = () => {
        retryCount++;
        console.warn(`Failed to load Razorpay script. Retry attempt ${retryCount}/${maxRetries}`);
        
        if (retryCount < maxRetries) {
          setTimeout(loadScript, 1000); // Wait 1 second before retry
        } else {
          console.error("Maximum retry attempts reached. Could not load Razorpay script");
          resolve(false);
        }
      };
      
      document.body.appendChild(script);
    };
    
    loadScript();
  });
};
