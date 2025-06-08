import React from 'react';

// This component shows the status of the Razorpay payment process
export function PaymentStatus({ status, errorMessage }) {
  // Different statuses: idle, loading, success, error, processing
  
  const getStatusContent = () => {
    switch (status) {
      case 'loading':
        return {
          icon: (
            <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ),
          text: 'Loading payment gateway...',
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-700',
          borderColor: 'border-blue-400'
        };
      
      case 'processing':
        return {
          icon: (
            <svg className="animate-pulse h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          text: 'Processing payment...',
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-700',
          borderColor: 'border-blue-400'
        };
      
      case 'success':
        return {
          icon: (
            <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ),
          text: 'Payment successful!',
          bgColor: 'bg-green-50',
          textColor: 'text-green-700',
          borderColor: 'border-green-400'
        };
      
      case 'error':
        return {
          icon: (
            <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          ),
          text: errorMessage || 'Payment failed. Please try again.',
          bgColor: 'bg-red-50',
          textColor: 'text-red-700',
          borderColor: 'border-red-400'
        };

      case 'waiting':
        return {
          icon: (
            <svg className="h-5 w-5 text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
          ),
          text: 'Waiting for payment completion...',
          bgColor: 'bg-yellow-50',
          textColor: 'text-yellow-700',
          borderColor: 'border-yellow-400'
        };
      
      case 'authenticating':
        return {
          icon: (
            <svg className="animate-pulse h-5 w-5 text-purple-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ),
          text: 'Authentication in progress, please wait...',
          bgColor: 'bg-purple-50',
          textColor: 'text-purple-700',
          borderColor: 'border-purple-400'
        };

      case 'redirected':
        return {
          icon: (
            <svg className="h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414 0l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L9.414 11H13a1 1 0 100-2H9.414l1.293-1.293a1 1 0 000-1.414z" clipRule="evenodd" />
            </svg>
          ),
          text: 'Redirected to bank for verification, please do not close this window...',
          bgColor: 'bg-indigo-50',
          textColor: 'text-indigo-700',
          borderColor: 'border-indigo-400'
        };
      
      default:
        return null;
    }
  };
  
  const content = getStatusContent();
  
  if (!content) return null;
  
  // Add extra guidance for specific statuses
  const getAdditionalGuidance = () => {
    switch (status) {
      case 'authenticating':
        return (
          <div className="mt-2 text-xs text-blue-600">
            <p>For security, your bank requires additional verification.</p>
            <p>If your bank window doesn't appear, check for popup blockers.</p>
          </div>
        );
      
      case 'redirected':
        return (
          <div className="mt-2 text-xs text-purple-600">
            <p>You're being redirected to complete your payment securely.</p>
            <p>Your shipment details are saved - return here to complete your booking.</p>
          </div>
        );
        
      case 'error':
        return errorMessage?.includes('network') ? (
          <div className="mt-2 text-xs text-red-600">
            <p>Please check your internet connection and try again.</p>
            <p>Your shipment details are saved.</p>
          </div>
        ) : null;
        
      default:
        return null;
    }
  };
  
  const additionalGuidance = getAdditionalGuidance();
  
  return (
    <div className={`${content.bgColor} border-l-4 ${content.borderColor} p-4`}>
      <div className="flex">
        <div className="flex-shrink-0">{content.icon}</div>
        <div className="ml-3">
          <p className={`text-sm ${content.textColor}`}>{content.text}</p>
          {additionalGuidance}
        </div>
      </div>
    </div>
  );
}
