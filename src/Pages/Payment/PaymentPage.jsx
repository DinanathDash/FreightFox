import React, { useState } from 'react';
import { Button } from "../../Components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../Components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "../../Components/ui/card";
import { Separator } from "../../Components/ui/separator";
import PaymentHistory from '../../Components/Payment/PaymentHistory';
import PaymentMethodSelector from '../../Components/Payment/PaymentMethodSelector';
import DashboardLayout from '../../Components/Dashboard/DashboardLayout';

function PaymentPage() {
  const [activeTab, setActiveTab] = useState("history");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Payments</h1>
          <p className="text-muted-foreground">
            Manage your payment methods and view transaction history
          </p>
        </div>
      </div>

      <Tabs defaultValue="history" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="history">Payment History</TabsTrigger>
          <TabsTrigger value="methods">Payment Methods</TabsTrigger>
        </TabsList>
        
        <TabsContent value="history" className="space-y-4">
          <PaymentHistory />
        </TabsContent>
        
        <TabsContent value="methods" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Saved Payment Methods</CardTitle>
            </CardHeader>
            <CardContent>
              <PaymentMethodSelector 
                selectedMethod={selectedPaymentMethod} 
                onSelect={setSelectedPaymentMethod} 
              />
              
              <Separator className="my-6" />
              
              <div className="flex justify-end">
                <Button>Save Preferences</Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Payment Security</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                All payment information is encrypted and processed securely. 
                We use industry-standard security measures to protect your data.
              </p>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-xl mb-2">🔒</div>
                  <h3 className="font-medium">Encryption</h3>
                  <p className="text-sm text-muted-foreground">256-bit SSL encryption</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-xl mb-2">✓</div>
                  <h3 className="font-medium">PCI Compliant</h3>
                  <p className="text-sm text-muted-foreground">Following security standards</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-xl mb-2">🛡️</div>
                  <h3 className="font-medium">Fraud Protection</h3>
                  <p className="text-sm text-muted-foreground">24/7 monitoring</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}

export default PaymentPage;
