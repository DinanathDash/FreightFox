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
      <Tabs defaultValue="history" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4 w-full sm:w-auto flex overflow-x-auto">
          <TabsTrigger value="history" className="flex-1 sm:flex-none">Payment History</TabsTrigger>
          <TabsTrigger value="methods" className="flex-1 sm:flex-none">Payment Methods</TabsTrigger>
        </TabsList>
        
        <TabsContent value="history" className="space-y-4">
          <PaymentHistory />
        </TabsContent>
        
        <TabsContent value="methods" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Saved Payment Methods</CardTitle>
            </CardHeader>
            <CardContent className="px-2 sm:px-6">
              <PaymentMethodSelector 
                selectedMethod={selectedPaymentMethod} 
                onSelect={setSelectedPaymentMethod} 
              />
              
              <Separator className="my-4 sm:my-6" />
              
              <div className="flex justify-center sm:justify-end">
                <Button className="w-full sm:w-auto">Save Preferences</Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Payment Security</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm sm:text-base text-muted-foreground mb-4">
                All payment information is encrypted and processed securely. 
                We use industry-standard security measures to protect your data.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 text-center">
                <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
                  <div className="text-lg sm:text-xl mb-2">🔒</div>
                  <h3 className="font-medium">Encryption</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">256-bit SSL encryption</p>
                </div>
                <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
                  <div className="text-lg sm:text-xl mb-2">✓</div>
                  <h3 className="font-medium">PCI Compliant</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">Following security standards</p>
                </div>
                <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
                  <div className="text-lg sm:text-xl mb-2">🛡️</div>
                  <h3 className="font-medium">Fraud Protection</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">24/7 monitoring</p>
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
