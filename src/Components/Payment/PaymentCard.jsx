import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import visaSvg from '../../assets/visa.svg';
import mastercardSvg from '../../assets/mastercard.svg';
import amexSvg from '../../assets/amex.svg';
import rupaySvg from '../../assets/rupay.svg';

function PaymentCard({ payment }) {
  // Format date
  const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
      // Handle Firestore Timestamp objects
      if (date && typeof date === 'object' && date.seconds) {
        // Convert Firestore Timestamp to milliseconds
        return new Date(date.seconds * 1000).toLocaleString();
      } 
      // Handle Date objects or valid date strings
      else if (date instanceof Date || !isNaN(new Date(date).getTime())) {
        return new Date(date).toLocaleString();
      }
      // Return placeholder for invalid dates
      return 'Invalid date';
    } catch (error) {
      console.error("Error formatting date:", error);
      return 'Invalid date';
    }
  };

  // Format payment method
  const getPaymentMethodDetails = (payment) => {
    switch (payment.paymentMethod) {
      case 'card':
        return {
          method: 'Card Payment',
          details: `${payment.paymentDetails?.cardType || 'Card'} ending in ${payment.paymentDetails?.lastFourDigits || '****'}`
        };
      case 'upi':
        return {
          method: 'UPI Payment',
          details: payment.paymentDetails?.upiId || 'UPI ID'
        };
      case 'netbanking':
        return {
          method: 'Net Banking',
          details: payment.paymentDetails?.bank || 'Bank'
        };
      default:
        return {
          method: 'Online Payment',
          details: 'Payment processed successfully'
        };
    }
  };

  // Get badge color based on status
  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'processing':
        return 'bg-amber-100 text-amber-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const paymentInfo = getPaymentMethodDetails(payment);

  // Get card or payment method icon
  const getPaymentIcon = () => {
    const method = payment.paymentMethod;
    const cardType = payment.paymentDetails?.cardType;
    
    if (method === 'card') {
      switch(cardType) {
        case 'visa': return <img src={visaSvg} alt="Visa" className="h-6 w-auto" />;
        case 'mastercard': return <img src={mastercardSvg} alt="Mastercard" className="h-6 w-auto" />;
        case 'amex': return <img src={amexSvg} alt="American Express" className="h-6 w-auto" />;
        case 'rupay': return <img src={rupaySvg} alt="RuPay" className="h-6 w-auto" />;
        default: return '💳';
      }
    } else if (method === 'upi') {
      return '📱';
    } else if (method === 'netbanking') {
      return '🏦';
    } else if (method === 'wallet') {
      return '👛';
    }
    return '💰';
  };

  return (
    <Card className="overflow-hidden">
      <div className={`h-1.5 w-full ${payment.status === 'completed' ? 'bg-green-500' : 
        payment.status === 'processing' ? 'bg-amber-500' : 
        payment.status === 'failed' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-primary-50 flex items-center justify-center text-lg">
              {getPaymentIcon()}
            </div>
            <div>
              <CardTitle className="text-lg">Payment Receipt</CardTitle>
              <CardDescription>Order #{payment.orderId}</CardDescription>
            </div>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(payment.status)}`}>
            {payment.status}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Amount</span>
            <span className="font-semibold text-lg">₹{payment.amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Payment Method</span>
            <span>{paymentInfo.method}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Details</span>
            <span className="text-right">{paymentInfo.details}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Date</span>
            <span>{formatDate(payment.timestamp)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Transaction ID</span>
            <span className="font-mono text-xs bg-gray-50 px-2 py-1 rounded">{payment.id || 'TX' + Math.random().toString(36).substr(2, 9)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default PaymentCard;
