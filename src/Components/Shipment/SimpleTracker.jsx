import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

function SimpleTracker({ orders, activeTrackingId, setActiveTrackingId }) {
  // Get current active order - now looking for orderId or id first, then trackingId as fallback
  const activeOrder = orders.find(order => order.orderId === activeTrackingId || order.id === activeTrackingId || order.trackingId === activeTrackingId) || orders[0];
  
  // Calculate the progress percentage based on order status
  const calculateProgress = (status) => {
    switch(status) {
      case 'Processing':
        return 0;
      case 'Shipped':
        return 25;
      case 'In Transit':
        return 50;
      case 'Out for Delivery':
        return 75;
      case 'Delivered':
        return 100;
      default:
        return 25; // Default to shipped
    }
  };

  // Handle order selection change
  const handleOrderChange = (value) => {
    setActiveTrackingId(value);
  };

  // If no orders or active order, show loading state
  if (!orders.length || !activeOrder) {
    return (
      <Card className="col-span-full lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>Shipment Tracker</CardTitle>
        </CardHeader>
        <CardContent className="p-0 pb-1">
          <div className="h-[200px] bg-blue-50 flex items-center justify-center">
            No shipment data available
          </div>
        </CardContent>
      </Card>
    );
  }

  // Get the origin, destination, and current location
  // Use consistent source and destination values from the original order data
  const origin = activeOrder?.shipping?.source?.city || 'Origin';
  const destination = activeOrder?.shipping?.destination?.city || 'Destination';
  const progress = calculateProgress(activeOrder.status);
  
  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Shipment Tracker</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative pb-8">
          {/* Order Info */}
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-500">Order ID: <span className="font-bold text-gray-700">{activeOrder.orderId || activeOrder.id || activeOrder.trackingId}</span></p>
            <div className="flex justify-between items-center mt-2">
              <div>
                <p className="text-sm font-medium text-gray-500">From</p>
                <p className="font-semibold">{origin}, {activeOrder?.shipping?.source?.country || ''}</p>
              </div>
              <div className="flex-1 mx-4 h-1 bg-gray-200 relative">
                <div className="h-1 bg-blue-500" style={{ width: `${progress}%` }}></div>
                <div 
                  className="absolute top-1/2 transform -translate-y-1/2 w-4 h-4 rounded-full bg-blue-500" 
                  style={{ left: `${progress}%`, marginLeft: '-8px' }}
                ></div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">To</p>
                <p className="font-semibold">{destination}, {activeOrder?.shipping?.destination?.country || ''}</p>
              </div>
            </div>
          </div>
          
          {/* Status Information */}
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Status</p>
                <span className={`px-3 py-1 mt-1 inline-block rounded-full text-xs font-medium ${
                  activeOrder.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                  activeOrder.status === 'In Transit' ? 'bg-blue-100 text-blue-800' :
                  activeOrder.status === 'Processing' ? 'bg-purple-100 text-purple-800' :
                  activeOrder.status === 'Out for Delivery' ? 'bg-amber-100 text-amber-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {activeOrder.status}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Distance</p>
                <p className="font-semibold">{activeOrder?.shipping?.distance || '0'} km</p>
              </div>
              {activeOrder?.packageDetails && (
                <>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Package Type</p>
                    <p className="font-semibold">{activeOrder.packageDetails.category || 'Standard'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Weight</p>
                    <p className="font-semibold">{activeOrder.packageDetails.weight || '0'} kg</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Order Selection */}
          <div className="absolute bottom-0 right-0">
            <Select 
              value={activeTrackingId} 
              onValueChange={handleOrderChange}
            >
              <SelectTrigger className="w-[180px] h-8 bg-white border border-gray-100">
                <SelectValue placeholder="Select Order ID" />
              </SelectTrigger>
              <SelectContent>
                {orders.map((order) => (
                  <SelectItem key={order.trackingId || order.id} value={order.orderId || order.id || order.trackingId}>
                    #{order.orderId || order.id || order.trackingId}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default SimpleTracker;
