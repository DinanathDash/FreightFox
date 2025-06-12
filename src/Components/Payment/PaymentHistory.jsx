import React, { useState, useEffect } from 'react';
import { useAuth } from '../../Context/AuthContext';
import { getUserPayments } from '../../Firebase/paymentServices.js';
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
      <Card>
        <CardContent className="flex justify-center items-center py-8">
          <div className="text-center">
            <div className="animate-pulse h-4 w-48 bg-gray-200 rounded mb-4"></div>
            <div className="animate-pulse h-20 w-full bg-gray-100 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (payments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            No payment records found
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <p className="text-muted-foreground text-sm">
            Your recent payment transactions
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex space-x-2">
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {payments.map(payment => (
          <PaymentCard key={payment.id} payment={payment} />
        ))}
      </div>
    </div>
  );
}

export default PaymentHistory;
