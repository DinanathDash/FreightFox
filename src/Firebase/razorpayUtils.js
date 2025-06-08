// This file contains utilities for server-side Razorpay operations
// Note: In a production app, these functions would typically be used in a backend service

import { serverTimestamp } from 'firebase/firestore';
import { 
  updatePaymentState,
  savePaymentSession,
  clearPaymentSession,
  getPaymentSession
} from './paymentStateTracking';

let activeRazorpay = null;

// Verify Razorpay signature (in a real backend)
export const verifyRazorpaySignature = (orderId, paymentId, signature, secret) => {
  // In a real implementation, this would be on the server side
  // The signature verification requires the server-side secret key
  // Here we're just returning true for demonstration
  console.log("Would verify signature with:", { orderId, paymentId, signature });
  return true;
};

// Check if popup blockers might interfere with Razorpay
export const detectPopupBlockers = () => {
  try {
    const popup = window.open('about:blank', '_blank', 'width=1,height=1');
    if (!popup || popup.closed || typeof popup.closed === 'undefined') {
      return true; // Popup blocker detected
    }
    // Close the test popup
    popup.close();
    return false; // No popup blocker
  } catch (e) {
    return true; // Error opening popup, likely blocker present
  }
};

// Format order data for Razorpay 
export const formatRazorpayOrderData = (shipmentData, amount) => {
  return {
    amount: Math.round(amount * 100), // convert to paise
    currency: "INR",
    receipt: `receipt_${Date.now()}`,
    notes: {
      fromCity: shipmentData.fromCity,
      toCity: shipmentData.toCity,
      weight: shipmentData.weight,
      packageType: shipmentData.packageSize,
      serviceType: shipmentData.serviceType
    }
  };
};

// Function to store payment session data for recovery
export const storePaymentSessionData = (sessionData) => {
  try {
    // Store in localStorage for recovery if dialog is closed mid-payment
    localStorage.setItem('rzp_recovery_session', JSON.stringify({
      ...sessionData,
      timestamp: new Date().toISOString()
    }));
    return true;
  } catch (error) {
    console.error("Error storing payment session data:", error);
    return false;
  }
};

// Function to retrieve payment session data
export const getPaymentSessionData = () => {
  try {
    const data = localStorage.getItem('rzp_recovery_session');
    if (!data) return null;
    
    const sessionData = JSON.parse(data);
    
    // Check if data is too old (15 min expiry)
    const sessionTime = new Date(sessionData.timestamp).getTime();
    const now = new Date().getTime();
    const fifteenMinutesInMs = 15 * 60 * 1000;
    
    if (now - sessionTime > fifteenMinutesInMs) {
      // Session expired, remove it
      localStorage.removeItem('rzp_recovery_session');
      return null;
    }
    
    return sessionData;
  } catch (error) {
    console.error("Error retrieving payment session data:", error);
    return null;
  }
};

// Clear payment session data
export const clearPaymentSessionData = () => {
  try {
    localStorage.removeItem('rzp_recovery_session');
    return true;
  } catch (error) {
    console.error("Error clearing payment session data:", error);
    return false;
  }
};

// Map payment data to Firestore format
export const mapPaymentToFirestore = (paymentResponse) => {
  return {
    id: paymentResponse.razorpay_payment_id,
    orderId: paymentResponse.razorpay_order_id,
    signature: paymentResponse.razorpay_signature,
    status: 'completed',
    timestamp: serverTimestamp()
  };
};

// Get Razorpay key from env
export const getRazorpayKey = () => {
  return import.meta.env.VITE_RAZORPAY_KEY_ID;
};

/**
 * Creates and opens a Razorpay payment window
 * 
 * @param {Object} options - Razorpay options
 * @param {Object} handlers - Event handlers for Razorpay events
 * @param {Function} handlers.onSuccess - Called when payment is successful
 * @param {Function} handlers.onError - Called when payment fails
 * @param {Function} handlers.onModalClose - Called when Razorpay modal is closed
 * @returns {Object} Razorpay instance
 */
export const openRazorpayCheckout = (options, handlers = {}) => {
  // Clean up any existing instances first
  cleanupRazorpayInstance();
  
  // Save session for potential recovery
  savePaymentSession({
    orderId: options.order_id,
    amount: options.amount,
    currency: options.currency,
    name: options.name,
    description: options.description
  });
  
  const { onSuccess, onError, onModalClose } = handlers;
  
  try {
    if (typeof window.Razorpay === 'undefined') {
      throw new Error('Razorpay SDK not loaded');
    }
    
    // Create new Razorpay instance
    const razorpayOptions = {
      ...options,
      handler: function(response) {
        // Update payment state
        updatePaymentState('success', { 
          paymentId: response.razorpay_payment_id,
          orderId: options.order_id
        });
        
        // Clear session since payment completed
        clearPaymentSession();
        
        if (onSuccess && typeof onSuccess === 'function') {
          onSuccess(response);
        }
      },
      modal: {
        ondismiss: function() {
          // Update payment state
          updatePaymentState('cancelled');
          
          if (onModalClose && typeof onModalClose === 'function') {
            onModalClose();
          }
        },
        // Prevent closing on escape key or clicking outside
        escape: false,
        backdropclose: false
      }
    };
    
    const paymentObject = new window.Razorpay(razorpayOptions);
    
    // Store reference to active instance
    activeRazorpay = paymentObject;
    
    // Additional event listeners for better user feedback
    paymentObject.on('payment.failed', function(response) {
      updatePaymentState('failed', { 
        error: response.error,
        orderId: options.order_id 
      });
      
      if (onError && typeof onError === 'function') {
        onError(response);
      }
    });
    
    paymentObject.on('payment.submit', function(response) {
      updatePaymentState('authenticating', { orderId: options.order_id });
    });
    
    paymentObject.on('payment.external_website_redirect', function() {
      updatePaymentState('redirected', { orderId: options.order_id });
    });
    
    paymentObject.on('payment.authorized', function(response) {
      updatePaymentState('processing', { 
        paymentId: response.razorpay_payment_id,
        orderId: options.order_id
      });
    });
    
    // Open the payment window
    updatePaymentState('initiated', { orderId: options.order_id });
    paymentObject.open();
    
    return paymentObject;
  } catch (error) {
    console.error('Failed to initialize Razorpay:', error);
    
    updatePaymentState('failed', { 
      error: { 
        code: 'INITIALIZATION_ERROR',
        description: error.message
      }
    });
    
    if (onError && typeof onError === 'function') {
      onError({
        error: {
          code: 'INITIALIZATION_ERROR',
          description: error.message
        }
      });
    }
    
    return null;
  }
};

/**
 * Clean up active Razorpay instance
 * @returns {boolean} True if instance was cleaned up
 */
export const cleanupRazorpayInstance = () => {
  if (activeRazorpay) {
    try {
      activeRazorpay.close();
      activeRazorpay = null;
      return true;
    } catch (error) {
      console.error('Failed to clean up Razorpay instance:', error);
    }
  }
  return false;
};

/**
 * Detect if popup windows are blocked by the browser
 * @returns {boolean} True if popups are blocked
 */
export const detectPopupBlocker = () => {
  const popup = window.open('about:blank', '_blank', 'width=1,height=1');
  
  const isBlocked = !popup || popup.closed;
  
  if (popup) {
    popup.close();
  }
  
  return isBlocked;
};

/**
 * Check if Razorpay iframe is visible in the DOM
 * @returns {Object} Visibility status
 */
export const checkRazorpayVisibility = () => {
  // Look for Razorpay iframe in the DOM
  const razorpayFrames = document.querySelectorAll('iframe[src*="api.razorpay.com"]');
  
  if (razorpayFrames.length === 0) {
    return { visible: false, reason: 'no-frame' };
  }
  
  // Check visibility of each frame
  for (const frame of razorpayFrames) {
    const rect = frame.getBoundingClientRect();
    const style = window.getComputedStyle(frame);
    
    // Check if the frame is hidden
    if (style.display === 'none' || style.visibility === 'hidden' || rect.width === 0 || rect.height === 0) {
      return { visible: false, reason: 'hidden-frame', element: frame };
    }
    
    // Check if frame is outside viewport
    if (rect.bottom < 0 || rect.top > window.innerHeight || rect.right < 0 || rect.left > window.innerWidth) {
      return { visible: false, reason: 'out-of-viewport', element: frame };
    }
  }
  
  return { visible: true };
};

/**
 * Recover payment from a previously saved session
 * @param {Object} sessionData - Session data from getPaymentSession()
 * @param {Object} handlers - Event handlers
 * @returns {Object} Razorpay instance if recovery was started
 */
export const recoverPaymentSession = (sessionData, handlers = {}) => {
  if (!sessionData || !sessionData.orderId) {
    console.error('Invalid payment session data for recovery');
    return null;
  }
  
  try {
    const options = {
      order_id: sessionData.orderId,
      amount: sessionData.amount,
      currency: sessionData.currency || 'INR',
      name: sessionData.name || 'FreightFox',
      description: sessionData.description || 'Payment recovery'
    };
    
    return openRazorpayCheckout(options, handlers);
  } catch (error) {
    console.error('Failed to recover payment session:', error);
    return null;
  }
};

export default {
  openRazorpayCheckout,
  cleanupRazorpayInstance,
  detectPopupBlocker,
  checkRazorpayVisibility,
  recoverPaymentSession
};
