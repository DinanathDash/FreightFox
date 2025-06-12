import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogOverlay, DialogPortal } from "../ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { cn } from "../../lib/utils";
import PaymentForm from './PaymentForm';

// Custom Dialog components for the payment dialog to ensure proper z-index and backdrop
const PaymentDialogOverlay = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-[59] bg-black/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
));
PaymentDialogOverlay.displayName = "PaymentDialogOverlay";

function PaymentDialog({ open, onOpenChange, amount, orderId, onSuccess }) {
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [showCloseButton, setShowCloseButton] = useState(false);

  // Show close button after a delay to encourage users to see the success message
  useEffect(() => {
    let timer;
    if (paymentCompleted) {
      timer = setTimeout(() => {
        setShowCloseButton(true);
      }, 2000);
    } else {
      setShowCloseButton(false);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [paymentCompleted]);

  const handlePaymentSuccess = (details) => {
    setPaymentDetails(details);
    setPaymentCompleted(true);
    
    // Update the order status in UI immediately
    if (onSuccess) {
      setTimeout(() => {
        onSuccess(details);
      }, 1000);
    }
  };

  const handleClose = () => {
    if (paymentCompleted && onSuccess) {
      onSuccess(paymentDetails);
    }
    onOpenChange(false);
    // Reset state after closing
    setTimeout(() => {
      setPaymentCompleted(false);
      setPaymentDetails(null);
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogPortal>
        <PaymentDialogOverlay />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-[50%] top-[50%] z-[60] grid w-full max-w-md -translate-x-1/2 -translate-y-1/2 gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg"
          )}
        >
          <DialogHeader>
            <DialogTitle>
              {paymentCompleted ? "Payment Successful" : "Complete Payment"}
            </DialogTitle>
            <DialogDescription>
              {paymentCompleted 
                ? `Your payment of ₹${amount.toFixed(2)} was processed successfully.`
                : `Please complete your payment of ₹${amount.toFixed(2)}.`
              }
            </DialogDescription>
          </DialogHeader>
          <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="M18 6 6 18M6 6l12 12"></path>
            </svg>
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        
        {paymentCompleted ? (
          <div className="space-y-4">
            <div className="rounded-lg bg-green-50 p-4 text-green-700 text-center">
              <div className="flex items-center justify-center my-3">
                <div className="relative">
                  <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                    <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="animate-ping absolute top-0 left-0 h-16 w-16 rounded-full bg-green-200 opacity-50"></span>
                </div>
              </div>
              <p className="font-medium text-lg">Payment Complete</p>
              <p className="text-sm mt-2">Transaction ID: {paymentDetails?.id || 'TX' + Math.random().toString(36).substr(2, 9)}</p>
              <p className="text-xs mt-2">Amount: ₹{amount.toFixed(2)}</p>
              <p className="text-xs mt-2">A receipt has been sent to your email</p>
            </div>
            {showCloseButton && (
              <Button onClick={handleClose} className="w-full">
                Continue
              </Button>
            )}
          </div>
        ) : (
          <PaymentForm 
            amount={amount}
            orderId={orderId}
            onPaymentSuccess={handlePaymentSuccess}
            onCancel={() => onOpenChange(false)}
          />
        )}
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}

export default PaymentDialog;
