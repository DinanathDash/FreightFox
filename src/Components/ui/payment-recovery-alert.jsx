import React, { useState, useEffect } from 'react';
import { Alert, AlertTitle, AlertDescription } from './alert';
import { Button } from './button';
import { X } from 'lucide-react';

export function PaymentRecoveryAlert({ 
  paymentData, 
  onRecover, 
  onDismiss,
  visible = true 
}) {
  const [isVisible, setIsVisible] = useState(visible);
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes in seconds
  
  useEffect(() => {
    if (!paymentData || !visible) {
      setIsVisible(false);
      return;
    }
    
    setIsVisible(true);
    
    // Countdown timer for expiration
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto-dismiss when time expires
          handleDismiss();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [paymentData, visible]);
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleDismiss = () => {
    setIsVisible(false);
    if (onDismiss) onDismiss();
  };
  
  const handleRecover = () => {
    if (onRecover) onRecover(paymentData);
  };
  
  if (!isVisible || !paymentData) return null;
  
  const { orderId, amount } = paymentData;
  
  return (
    <Alert className="bg-yellow-50 border-yellow-200 mb-4 relative">
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute top-2 right-2 h-6 w-6 rounded-full p-0" 
        onClick={handleDismiss}
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </Button>
      
      <AlertTitle className="text-amber-800">
        Unfinished payment detected
      </AlertTitle>
      
      <AlertDescription className="text-amber-700 mt-2">
        <p className="mb-2">
          We detected an unfinished payment of ₹{(amount/100).toFixed(2)} for order #{orderId.substring(0, 8)}... 
          Would you like to resume where you left off?
        </p>
        
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-amber-600">
            Recovery available for: {formatTime(timeLeft)}
          </span>
          
          <div className="space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="border-amber-300 text-amber-700 hover:bg-amber-100"
              onClick={handleDismiss}
            >
              Dismiss
            </Button>
            
            <Button 
              variant="default" 
              size="sm" 
              className="bg-amber-600 hover:bg-amber-700"
              onClick={handleRecover}
            >
              Resume Payment
            </Button>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}
