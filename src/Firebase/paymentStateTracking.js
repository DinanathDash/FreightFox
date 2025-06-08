// Constants
export const PAYMENT_STATE_KEY = 'freightfox_payment_state';
export const PAYMENT_SESSION_KEY = 'freightfox_payment_session';

// Payment states
const PAYMENT_STATES = {
  IDLE: 'idle',
  INITIATED: 'initiated',
  PROCESSING: 'processing',
  AUTHENTICATING: 'authenticating',
  REDIRECTED: 'redirected',
  SUCCESS: 'success',
  FAILED: 'failed',
  CANCELLED: 'cancelled'
};

/**
 * Update payment state across windows
 * @param {string} state - Current payment state
 * @param {Object} data - Additional payment data
 */
export const updatePaymentState = (state, data = {}) => {
  try {
    if (!Object.values(PAYMENT_STATES).includes(state)) {
      console.warn(`Invalid payment state: ${state}`);
      return;
    }
    
    const paymentState = {
      state,
      timestamp: Date.now(),
      ...data
    };
    
    // Update localStorage to broadcast to other windows
    localStorage.setItem(PAYMENT_STATE_KEY, JSON.stringify(paymentState));
    
    // Dispatch custom event for same window updates
    const event = new CustomEvent('payment-state-change', { detail: paymentState });
    window.dispatchEvent(event);
    
  } catch (error) {
    console.error('Failed to update payment state:', error);
  }
};

/**
 * Subscribe to payment state changes across windows
 * @param {Function} callback - Function to call when payment state changes
 * @returns {Function} Cleanup function to remove event listeners
 */
export const subscribeToPaymentStateChanges = (callback) => {
  const handleStorageChange = (event) => {
    if (event.key === PAYMENT_STATE_KEY && event.newValue) {
      try {
        const newState = JSON.parse(event.newValue);
        callback(newState);
      } catch (error) {
        console.error('Error parsing payment state:', error);
      }
    }
  };
  
  const handleCustomEvent = (event) => {
    callback(event.detail);
  };
  
  window.addEventListener('storage', handleStorageChange);
  window.addEventListener('payment-state-change', handleCustomEvent);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('storage', handleStorageChange);
    window.removeEventListener('payment-state-change', handleCustomEvent);
  };
};

/**
 * Save payment session for recovery
 * @param {Object} sessionData - Payment session data
 * @param {number} expiryMinutes - Session expiry in minutes
 */
export const savePaymentSession = (sessionData, expiryMinutes = 30) => {
  try {
    if (!sessionData || !sessionData.orderId) {
      console.warn('Invalid payment session data');
      return;
    }
    
    const session = {
      ...sessionData,
      savedAt: Date.now(),
      expiresAt: Date.now() + (expiryMinutes * 60 * 1000)
    };
    
    localStorage.setItem(PAYMENT_SESSION_KEY, JSON.stringify(session));
  } catch (error) {
    console.error('Failed to save payment session:', error);
  }
};

/**
 * Get saved payment session if not expired
 * @returns {Object|null} Payment session or null if expired/not found
 */
export const getPaymentSession = () => {
  try {
    const sessionData = localStorage.getItem(PAYMENT_SESSION_KEY);
    
    if (!sessionData) return null;
    
    const session = JSON.parse(sessionData);
    
    // Check if session has expired
    if (session.expiresAt < Date.now()) {
      clearPaymentSession();
      return null;
    }
    
    return session;
  } catch (error) {
    console.error('Failed to retrieve payment session:', error);
    return null;
  }
};

/**
 * Clear payment session data
 */
export const clearPaymentSession = () => {
  localStorage.removeItem(PAYMENT_SESSION_KEY);
  localStorage.removeItem(PAYMENT_STATE_KEY);
};

/**
 * Clear payment state data from localStorage
 * This is used to reset the payment state after a payment is complete
 */
export const clearPaymentState = () => {
  try {
    // Remove payment state from localStorage
    localStorage.removeItem(PAYMENT_STATE_KEY);
    
    // Dispatch event to notify other windows
    const event = new CustomEvent('payment-state-change', { 
      detail: { state: PAYMENT_STATES.IDLE, timestamp: Date.now() } 
    });
    window.dispatchEvent(event);
    
    console.log('Payment state cleared');
  } catch (error) {
    console.error('Failed to clear payment state:', error);
  }
};

/**
 * Check if there's an active payment in progress
 * @returns {boolean} True if there's an active payment
 */
export const hasActivePayment = () => {
  try {
    const stateData = localStorage.getItem(PAYMENT_STATE_KEY);
    
    if (!stateData) return false;
    
    const state = JSON.parse(stateData);
    const activeStates = [
      PAYMENT_STATES.INITIATED,
      PAYMENT_STATES.PROCESSING,
      PAYMENT_STATES.AUTHENTICATING,
      PAYMENT_STATES.REDIRECTED
    ];
    
    return activeStates.includes(state.state);
  } catch (error) {
    console.error('Failed to check active payment:', error);
    return false;
  }
};

// Make sure initPaymentStateTracking is exported as it's imported in CreateShipmentDialog.jsx
export const initPaymentStateTracking = (sessionId, initialState = 'idle') => {
  try {
    // Initialize with a fresh state
    updatePaymentState(initialState, { sessionId });
    console.log('Payment state tracking initialized with session ID:', sessionId);
    return true;
  } catch (error) {
    console.error('Failed to initialize payment state tracking:', error);
    return false;
  }
};

export default {
  PAYMENT_STATES,
  updatePaymentState,
  subscribeToPaymentStateChanges,
  savePaymentSession,
  getPaymentSession,
  clearPaymentSession,
  clearPaymentState,
  hasActivePayment,
  initPaymentStateTracking
};
