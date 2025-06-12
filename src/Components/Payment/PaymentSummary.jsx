import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { toast } from "sonner";
import { useAuth } from '../../Context/AuthContext';
import PaymentDialog from './PaymentDialog';

function PaymentSummary({ order, onPaymentComplete = null }) {
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  // Check if the order is already paid
  const isPaid = order?.status === 'Processing' || order?.status === 'In Transit' || 
                order?.status === 'Out For Delivery' || order?.status === 'Delivered';
  
  // Format currency display
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };
  
  // Handle payment success
  const handlePaymentSuccess = (paymentDetails) => {
    if (onPaymentComplete) {
      onPaymentComplete(paymentDetails);
    }
    
    toast.success("Payment completed successfully!");
    
    // Close payment dialog
    setShowPaymentDialog(false);
  };

  // Handle "Pay Now" button click
  const handlePayNow = () => {
    if (!currentUser) {
      toast.error("Please log in to make a payment");
      return;
    }
    
    setShowPaymentDialog(true);
  };

  // Get order cost - handle different data structures
  const getOrderAmount = () => {
    if (order?.cost?.totalAmount) {
      return order.cost.totalAmount;
    }
    if (order?.price) {
      return order.price;
    }
    if (order?.shipping?.price) {
      return order.shipping.price;
    }
    return 0;
  };

  const orderAmount = getOrderAmount();
  
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Payment Summary</CardTitle>
          <CardDescription>
            Order #{order?.orderId || 'Unknown'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md bg-muted p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm">Status:</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                isPaid 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {isPaid ? 'Paid' : 'Pending Payment'}
              </span>
            </div>
            
            {order?.timestamp && (
              <div className="flex items-center justify-between text-sm">
                <span>Date:</span>
                <span>
                  {order.timestamp?.toDate 
                    ? order.timestamp.toDate().toLocaleString()
                    : new Date(order.timestamp).toLocaleString()}
                </span>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Shipping Charges
              </span>
              <span>{formatCurrency(orderAmount * 0.95)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Service Fee
              </span>
              <span>{formatCurrency(orderAmount * 0.05)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Tax (GST)
              </span>
              <span>{formatCurrency(0)}</span>
            </div>
            
            <Separator className="my-2" />
            
            <div className="flex justify-between font-medium">
              <span>Total</span>
              <span>{formatCurrency(orderAmount)}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          {isPaid ? (
            <Button className="w-full" variant="outline" onClick={() => navigate('/payments')}>
              View Payment History
            </Button>
          ) : (
            <Button className="w-full" onClick={handlePayNow}>
              Pay Now
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Payment Dialog */}
      <PaymentDialog
        open={showPaymentDialog}
        onOpenChange={setShowPaymentDialog}
        amount={orderAmount}
        orderId={order?.orderId}
        onSuccess={handlePaymentSuccess}
      />
    </>
  );
}

export default PaymentSummary;
