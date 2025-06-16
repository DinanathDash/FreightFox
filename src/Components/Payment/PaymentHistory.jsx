import React, { useState, useEffect } from 'react';
import { useAuth } from '../../Context/AuthContext';
import { getUserPayments } from '../../Firebase/development/paymentServices.js';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import PaymentCard from './PaymentCard';

function PaymentHistory() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchPayments = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        const userPayments = await getUserPayments(currentUser.uid);
        setPayments(userPayments);
      } catch (error) {
        console.error("Error fetching payments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [currentUser]);

  if (loading) {
    return (
      <Card className="mx-auto max-w-full sm:max-w-none">
        <CardContent className="flex justify-center items-center py-4 sm:py-8">
          <div className="text-center w-full">
            <div className="animate-pulse h-3 sm:h-4 w-32 sm:w-48 bg-gray-200 rounded mb-2 sm:mb-4 mx-auto"></div>
            <div className="animate-pulse h-16 sm:h-20 w-full bg-gray-100 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (payments.length === 0) {
    return (
      <Card className="mx-auto max-w-full sm:max-w-none">
        <CardHeader className="px-3 sm:px-6">
          <CardTitle className="text-lg sm:text-xl">Payment History</CardTitle>
        </CardHeader>
        <CardContent className="px-3 sm:px-6">
          <p className="text-center text-sm sm:text-base text-muted-foreground py-4 sm:py-8">
            No payment records found
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="mx-auto max-w-full sm:max-w-none">
        <CardHeader className="px-3 sm:px-6">
          <CardTitle className="text-lg sm:text-xl">Payment History</CardTitle>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Your recent payment transactions
          </p>
        </CardHeader>
        <CardContent className="px-2 sm:px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 space-y-2 sm:space-y-0">
            <div className="flex flex-wrap gap-2 sm:gap-0 sm:space-x-2">
              <div className="flex items-center">
                <span className="h-3 w-3 rounded-full bg-green-500 mr-1"></span>
                <span className="text-xs">Completed</span>
              </div>
              <div className="flex items-center">
                <span className="h-3 w-3 rounded-full bg-amber-500 mr-1"></span>
                <span className="text-xs">Processing</span>
              </div>
              <div className="flex items-center">
                <span className="h-3 w-3 rounded-full bg-red-500 mr-1"></span>
                <span className="text-xs">Failed</span>
              </div>
            </div>
            <span className="text-xs text-muted-foreground">
              Total Transactions: {payments.length}
            </span>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 px-1 sm:px-0">
        {payments.map(payment => (
          <PaymentCard key={payment.id} payment={payment} />
        ))}
      </div>
    </div>
  );
}

export default PaymentHistory;
