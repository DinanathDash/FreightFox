import React, { useState, useEffect } from 'react';

function PaymentProcessingAnimation({ cardType = 'visa', onComplete }) {
  const [stage, setStage] = useState(0);
  
  // Card logos based on card type
  const cardLogo = 
    cardType === 'visa' ? 'https://img.icons8.com/color/48/000000/visa.png' :
    cardType === 'mastercard' ? 'https://img.icons8.com/color/48/000000/mastercard.png' :
    cardType === 'amex' ? 'https://img.icons8.com/color/48/000000/amex.png' : 
    cardType === 'rupay' ? 'https://cdn.icon-icons.com/icons2/2699/PNG/512/rupay_logo_icon_169762.png' :
    'https://img.icons8.com/color/48/000000/visa.png';
    
  const razorpayLogo = 'https://razorpay.com/assets/razorpay-glyph.svg';
    
  // Define animation stages
  const stages = [
    { text: 'Connecting to payment gateway...', duration: 800 },
    { text: 'Verifying card details...', duration: 1200 },
    { text: 'Processing payment...', duration: 1000 },
    { text: 'Completing transaction...', duration: 800 },
    { text: 'Payment successful!', duration: 800 }
  ];
  
  useEffect(() => {
    // Progress through the animation stages
    if (stage < stages.length - 1) {
      const timer = setTimeout(() => {
        setStage(stage + 1);
      }, stages[stage].duration);
      
      return () => clearTimeout(timer);
    } else if (stage === stages.length - 1) {
      // Animation completed
      const timer = setTimeout(() => {
        if (onComplete) onComplete();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [stage]);
  
  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-6">
      <div className="relative h-16 w-full flex items-center justify-center">
        {/* Card logo */}
        <div className={`absolute ${stage >= 2 ? 'animate-slide-right opacity-0' : 'opacity-100'} transition-all duration-500`}>
          <img src={cardLogo} alt="Card" className="h-12 w-auto" />
        </div>
        
        {/* Razorpay logo */}
        <div className={`absolute ${stage >= 1 ? 'opacity-100' : 'opacity-0'} ${stage >= 3 ? 'animate-pulse' : ''} transition-all duration-500`}>
          <img src={razorpayLogo} alt="Razorpay" className="h-10 w-auto" />
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-green-600 transition-all duration-300 ease-out"
          style={{ width: `${((stage + 1) / stages.length) * 100}%` }}
        ></div>
      </div>
      
      {/* Status text */}
      <div className="text-center">
        <p className="text-sm font-medium text-gray-700">{stages[stage].text}</p>
      </div>
      
      {/* Success animation */}
      {stage === stages.length - 1 && (
        <div className="relative flex items-center justify-center">
          <div className="absolute animate-ping h-16 w-16 rounded-full bg-green-400 opacity-20"></div>
          <div className="relative rounded-full bg-green-500 p-3">
            <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
      )}
      
      {/* Animation styles are now in global CSS */}
    </div>
  );
}

export default PaymentProcessingAnimation;
