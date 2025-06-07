import { useState } from 'react';
import GenerateUserOrders from '../../Components/Admin/GenerateUserOrders';
import { Card } from '../../Components/ui/card';

export default function AdminTools() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Admin Tools</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-5">
          <GenerateUserOrders />
        </Card>
      </div>
    </div>
  );
}
