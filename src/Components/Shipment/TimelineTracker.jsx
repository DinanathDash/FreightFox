import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

// TimelineTracker component for visualizing shipment progress
function TimelineTracker({ orders, activeTrackingId, setActiveTrackingId }) {
  // Get current active order - looking for orderId first, then fallback to trackingId
  const activeOrder = orders.find(order => order.orderId === activeTrackingId || order.id === activeTrackingId || order.trackingId === activeTrackingId) || orders[0];
  
  // Calculate the progress percentage based on order status
  const calculateProgress = (status) => {
    switch(status) {
      case 'Pending': 
        return 0;
      case 'Processing':
        return 10;
      case 'Shipped':
        return 25;
      case 'In Transit':
        return 50;
      case 'Out for Delivery':
        return 75;
      case 'Delivered':
        return 100;
      case 'Cancelled':
        return 0; // Cancelled orders show no progress
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
          <div className="flex items-center justify-center">
            No shipment data available
          </div>
        </CardContent>
      </Card>
    );
  }

  // Get the origin, destination, and current location
  // Support both new (from/to) and legacy (shipping.source/destination) structure
  const origin = activeOrder?.from?.city || activeOrder?.shipping?.source?.city || 'Unknown';
  const destination = activeOrder?.to?.city || activeOrder?.shipping?.destination?.city || 'Unknown';
  const distance = activeOrder?.distance || 0; // Use the distance directly from the order
  const progress = calculateProgress(activeOrder.status);
  const estimatedDelivery = activeOrder?.estimatedArrivalDate 
    ? new Date(activeOrder.estimatedArrivalDate).toLocaleDateString()
    : activeOrder?.shipping?.estimatedArrivalDate 
      ? new Date(activeOrder.shipping.estimatedArrivalDate).toLocaleDateString()
      : 'Unknown';
  
  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Shipment Tracker</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Order Status Information */}
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Order ID</p>
              <p className="font-semibold">#{activeOrder.orderId || activeOrder.id || activeOrder.trackingId}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Status</p>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                activeOrder.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                activeOrder.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                activeOrder.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                activeOrder.status === 'Processing' ? 'bg-purple-100 text-purple-800' :
                activeOrder.status === 'In Transit' ? 'bg-blue-100 text-blue-800' :
                activeOrder.status === 'Out for Delivery' ? 'bg-amber-100 text-amber-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {activeOrder.status}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Estimated Delivery</p>
              <p className="font-semibold">{estimatedDelivery}</p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full h-3 bg-gray-200 rounded-full mb-4">
            <div 
              className="h-3 bg-blue-500 rounded-full transition-all duration-500 ease-in-out" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          
          {/* Shipping Path */}
          <div className="flex items-center justify-between relative mb-8">
            {/* Source */}
            <div className="text-center">
              <div className={`w-6 h-6 rounded-full mx-auto mb-1 ${progress >= 0 ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
              <p className="text-xs font-medium">{origin}</p>
              <p className="text-xs text-gray-500">{activeOrder?.from?.state || activeOrder?.shipping?.source?.state}</p>
            </div>
            
            {/* Line */}
            <div className="flex-1 h-1 bg-gray-200 mx-2"></div>
            
            {/* Shipped */}
            <div className="text-center">
              <div className={`w-6 h-6 rounded-full mx-auto mb-1 ${progress >= 25 ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
              <p className="text-xs font-medium">Shipped</p>
              <p className="text-xs text-gray-500">Package processed</p>
            </div>
            
            {/* Line */}
            <div className="flex-1 h-1 bg-gray-200 mx-2"></div>
            
            {/* In Transit */}
            <div className="text-center">
              <div className={`w-6 h-6 rounded-full mx-auto mb-1 ${progress >= 50 ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
              <p className="text-xs font-medium">In Transit</p>
              <p className="text-xs text-gray-500">On the way</p>
            </div>
            
            {/* Line */}
            <div className="flex-1 h-1 bg-gray-200 mx-2"></div>
            
            {/* Out for Delivery */}
            <div className="text-center">
              <div className={`w-6 h-6 rounded-full mx-auto mb-1 ${progress >= 75 ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
              <p className="text-xs font-medium">Out for Delivery</p>
              <p className="text-xs text-gray-500">Almost there</p>
            </div>
            
            {/* Line */}
            <div className="flex-1 h-1 bg-gray-200 mx-2"></div>
            
            {/* Destination */}
            <div className="text-center">
              <div className={`w-6 h-6 rounded-full mx-auto mb-1 ${progress >= 100 ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
              <p className="text-xs font-medium">{destination}</p>
              <p className="text-xs text-gray-500">{activeOrder?.to?.state || activeOrder?.shipping?.destination?.state}</p>
            </div>
          </div>
          
          {/* Package Details */}
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-medium text-gray-500">Distance</p>
              <p className="font-semibold">{activeOrder?.distance || activeOrder?.shipping?.distance || '0'} km</p>
            </div>
            <div>
              <p className="font-medium text-gray-500">Package Category</p>
              <p className="font-semibold">{activeOrder?.packageDetails?.category || 'Standard'}</p>
            </div>
            <div>
              <p className="font-medium text-gray-500">Weight</p>
              <p className="font-semibold">{activeOrder?.packageDetails?.weight || '0'} kg</p>
            </div>
          </div>

          {/* Order ID selector dropdown */}
          <div className="mt-2 flex justify-end">
            <Select 
              value={activeTrackingId} 
              onValueChange={handleOrderChange}
            >
              <SelectTrigger className="w-[180px] h-8 bg-white border border-gray-100">
                <SelectValue placeholder="Select Order ID" />
              </SelectTrigger>
              <SelectContent position="popper" sideOffset={8} align="center">
                {orders.map((order) => (
                  <SelectItem key={order.trackingId || order.id} value={order.orderId || order.id || order.trackingId}>
                    # {order.orderId || order.id || order.trackingId}
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

// Make sure we're explicitly exporting the component
export default TimelineTracker;
