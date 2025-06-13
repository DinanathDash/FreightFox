import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

function SimpleTracker({ orders, activeTrackingId: activeOrderId, setActiveTrackingId: setActiveOrderId }) {
  // Get current active order - looking for matching order ID
  const activeOrder = orders.find(order => {
    // Convert everything to strings for comparison since orderId might be numeric
    const orderId = order.orderId ? order.orderId.toString() : null;
    const id = order.id ? order.id.toString() : null;
    const activeId = activeOrderId ? activeOrderId.toString() : null;

    return orderId === activeId || id === activeId;
  }) || orders[0];

  // Calculate the progress percentage based on order status
  const calculateProgress = (status) => {
    // Normalize status to lowercase for case-insensitive comparison
    const normalizedStatus = status?.toLowerCase() || '';

    switch (normalizedStatus) {
      case 'pending':
        return 0;
      case 'processing':
        return 10;
      case 'shipped':
        return 25;
      case 'in transit':
        return 50;
      case 'out for delivery':
        return 75;
      case 'delivered':
        return 100;
      case 'cancelled':
        return 0; // Cancelled orders show no progress
      default:
        return 25; // Default to shipped
    }
  };

  // Handle order selection change
  const handleOrderChange = (value) => {
    setActiveOrderId(value);
  };

  // If no orders or active order, show loading state
  if (!orders.length || !activeOrder) {
    return (
      <Card className="col-span-full lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>Shipment Tracker</CardTitle>
        </CardHeader>
        <CardContent className="p-0 pb-1">
          <div className="h-[250px] flex items-center justify-center">
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
  // Use the distance directly from the order's distance field in Firebase
  const distance = activeOrder?.distance || 0;
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
            <p className="text-sm font-medium text-gray-500">Order ID: <span className="font-bold text-gray-700">{activeOrder.orderId || activeOrder.id}</span></p>

            {/* Status Line - Now full width above from/to */}
            <div className="mt-4 mb-4 w-full">
              <div className="w-full h-1 bg-gray-200 relative">
                <div className="h-1 bg-blue-500" style={{ width: `${progress}%` }}></div>
                <div
                  className="absolute top-1/2 transform -translate-y-1/2 w-4 h-4 rounded-full bg-blue-500"
                  style={{ left: `${progress}%`, marginLeft: '-8px' }}
                ></div>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs text-gray-500">Order Placed</span>
                <span className="text-xs text-gray-500">Delivered</span>
              </div>
            </div>

            {/* From/To information - now below the status line */}
            <div className="flex justify-between items-center mt-4">
              <div>
                <p className="text-sm font-medium text-gray-500">From</p>
                <p className="font-semibold text-sm sm:text-[16px]">{origin}, {activeOrder?.from?.state || activeOrder?.shipping?.source?.state || ''}</p>
              </div>
              <div className='text-right md:text-left'>
                <p className="text-sm font-medium text-gray-500">To</p>
                <p className="font-semibold text-sm sm:text-[16px]">{destination}, {activeOrder?.to?.state || activeOrder?.shipping?.destination?.state || ''}</p>
              </div>
            </div>
          </div>

          {/* Status Information */}
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Status</p>
                <span className={`px-3 py-1 mt-1 inline-block rounded-full text-xs font-medium ${activeOrder.status?.toLowerCase() === 'delivered' ? 'bg-green-100 text-green-800' :
                    activeOrder.status?.toLowerCase() === 'pending' ? 'bg-amber-100 text-amber-800' :
                      activeOrder.status?.toLowerCase() === 'cancelled' ? 'bg-red-100 text-red-800' :
                        activeOrder.status?.toLowerCase() === 'processing' ? 'bg-purple-100 text-purple-800' :
                          activeOrder.status?.toLowerCase() === 'in transit' ? 'bg-blue-100 text-blue-800' :
                            activeOrder.status?.toLowerCase() === 'out for delivery' ? 'bg-amber-100 text-amber-800' :
                              'bg-gray-100 text-gray-800'
                  }`}>
                  {/* Ensure first letter is capitalized */}
                  {activeOrder.status?.charAt(0).toUpperCase() + activeOrder.status?.slice(1) || 'N/A'}
                </span>
              </div>
              <div className='text-right md:text-left'>
                <p className="text-sm font-medium text-gray-500">Distance</p>
                <p className="font-semibold">{activeOrder?.distance || 0} km</p>
              </div>
              {activeOrder?.packageDetails && (
                <>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Package Type</p>
                    <p className="font-semibold">{activeOrder.packageDetails.category || 'Standard'}</p>
                  </div>
                  <div className='text-right md:text-left'>
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
              value={activeOrderId}
              onValueChange={handleOrderChange}
            >
              <SelectTrigger className="w-[130px] h-8 bg-white border border-gray-100">
                <SelectValue placeholder="Select Order ID" />
              </SelectTrigger>
              <SelectContent>
                {orders.map((order) => {
                  // Use orderId as the displayed ID
                  const displayId = order.orderId || order.id;
                  const valueId = order.orderId || order.id;
                  return (
                    <SelectItem key={displayId} value={valueId.toString()}>
                      #{displayId}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default SimpleTracker;
