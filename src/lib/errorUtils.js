// Error tracking utility that captures errors and provides methods to handle them

// Store for captured errors
const capturedErrors = [];

/**
 * Captures an error and stores it for later use
 * @param {Error} error - The error object
 * @param {string} context - Where the error occurred
 * @param {Object} additionalInfo - Any additional information
 */
export function captureError(error, context = 'unknown', additionalInfo = {}) {
  const errorData = {
    timestamp: new Date().toISOString(),
    message: error.message || 'Unknown error',
    stack: error.stack,
    context,
    additionalInfo,
    url: window.location.href,
    userAgent: navigator.userAgent
  };
  
  capturedErrors.push(errorData);
  
  // Log to console (can be extended to external logging service)
  console.error('Error captured:', errorData);
  
  return errorData;
}

/**
 * Get all captured errors
 * @returns {Array} List of captured errors
 */
export function getCapturedErrors() {
  return [...capturedErrors];
}

/**
 * Clear the error store
 */
export function clearCapturedErrors() {
  capturedErrors.length = 0;
}

/**
 * Set up global error handlers
 */
export function setupGlobalErrorHandlers() {
  // Capture unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    captureError(
      event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
      'unhandledRejection'
    );
  });

  // Capture global errors
  window.addEventListener('error', (event) => {
    captureError(
      event.error || new Error(event.message),
      'windowError',
      { 
        lineNo: event.lineno,
        colNo: event.colno,
        filename: event.filename
      }
    );
  });

  // Override console.error to capture console errors
  const originalConsoleError = console.error;
  console.error = (...args) => {
    // Avoid infinite recursion - don't process errors from our own error capturing
    if (args[0] && typeof args[0] === 'string' && args[0].includes('Error captured:')) {
      originalConsoleError.apply(console, args);
      return;
    }

    try {
      const errorMessage = args.map(arg => {
        if (arg === null) return 'null';
        if (arg === undefined) return 'undefined';
        if (typeof arg !== 'object') return String(arg);
        
        try {
          return JSON.stringify(arg, null, 2);
        } catch (e) {
          return '[Object cannot be stringified]';
        }
      }).join(' ');
      
      if (args[0] instanceof Error) {
        // Don't call captureError to avoid potential recursion
      } else if (!errorMessage.includes('Error captured:')) {
        // Don't call captureError to avoid potential recursion
      }
    } catch (e) {
      // If anything goes wrong in our error handling, just log it directly
    }
    
    originalConsoleError.apply(console, args);
  };
}

// Function to navigate to error page programmatically
export function navigateToErrorPage(navigate, statusCode = 500, message) {
  navigate('/error', { 
    state: { 
      statusCode, 
      message
    }
  });
}
