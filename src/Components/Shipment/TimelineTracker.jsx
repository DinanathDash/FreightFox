import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { CheckIcon } from '@heroicons/react/24/solid';

// Custom hook to track window size
const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    // Handler to call on window resize
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Call handler right away so state gets updated with initial window size
    handleResize();

    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []); // Empty array ensures effect is only run on mount and unmount

  return windowSize;
};

// TimelineTracker component for visualizing shipment progress
function TimelineTracker({ orders, activeTrackingId: activeOrderId, setActiveTrackingId: setActiveOrderId }) {
  // Get window size for responsive layout
  const { width } = useWindowSize();
  const isMobile = width < 768; // Consider mobile if width is less than 768px

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
          <div className="flex items-center justify-center py-8">
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
      <CardContent className={isMobile ? 'px-3' : ''}>
        <div className="relative">
          {/* Order Status Information */}
          <div className={`flex ${isMobile ? 'flex-col space-y-3' : 'justify-between items-center'} mb-4`}>
            <div className={`${isMobile ? 'flex justify-between items-center' : ''}`}>
              <p className="text-sm font-medium text-gray-500">Order ID</p>
              <p className="font-semibold">#{activeOrder.orderId || activeOrder.id}</p>
            </div>
            <div className={`${isMobile ? 'flex justify-between items-center' : ''}`}>
              <p className="text-sm font-medium text-gray-500">Status</p>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${activeOrder.status?.toLowerCase() === 'delivered' ? 'bg-green-100 text-green-800' :
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
            <div className={`${isMobile ? 'flex justify-between items-center' : ''}`}>
              <p className="text-sm font-medium text-gray-500">Estimated Delivery</p>
              <p className="font-semibold">{estimatedDelivery}</p>
            </div>
          </div>

          {/* Shipping Path - Different views for mobile and desktop */}
          {isMobile ? (
            /* Mobile Vertical Shipping Path */
            <div className="flex flex-col space-y-4 mb-8">
              {/* Source */}
              <div className="flex items-center">
                <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center ${progress >= 0 ? 'bg-blue-500' : 'bg-gray-300'}`}>
                  {progress >= 0 && <CheckIcon className="w-3 h-3 text-white" />}
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium">{origin}</p>
                  <p className="text-xs text-gray-500">{activeOrder?.from?.state || activeOrder?.shipping?.source?.state}</p>
                </div>
              </div>

              {/* Vertical Line */}
              <div className="w-1 h-8 bg-gray-200 ml-3"></div>

              {/* Shipped */}
              <div className="flex items-center">
                <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center ${progress >= 25 ? 'bg-blue-500' : 'bg-gray-300'}`}>
                  {progress >= 25 && <CheckIcon className="w-3 h-3 text-white" />}
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium">Shipped</p>
                  <p className="text-xs text-gray-500">Package processed</p>
                </div>
              </div>

              {/* Vertical Line */}
              <div className="w-1 h-8 bg-gray-200 ml-3"></div>

              {/* In Transit */}
              <div className="flex items-center">
                <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center ${progress >= 50 ? 'bg-blue-500' : 'bg-gray-300'}`}>
                  {progress >= 50 && <CheckIcon className="w-3 h-3 text-white" />}
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium">In Transit</p>
                  <p className="text-xs text-gray-500">On the way</p>
                </div>
              </div>

              {/* Vertical Line */}
              <div className="w-1 h-8 bg-gray-200 ml-3"></div>

              {/* Out for Delivery */}
              <div className="flex items-center">
                <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center ${progress >= 75 ? 'bg-blue-500' : 'bg-gray-300'}`}>
                  {progress >= 75 && <CheckIcon className="w-3 h-3 text-white" />}
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium">Out for Delivery</p>
                  <p className="text-xs text-gray-500">Almost there</p>
                </div>
              </div>

              {/* Vertical Line */}
              <div className="w-1 h-8 bg-gray-200 ml-3"></div>

              {/* Destination */}
              <div className="flex items-center">
                <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center ${progress >= 100 ? 'bg-blue-500' : 'bg-gray-300'}`}>
                  {progress >= 100 && <CheckIcon className="w-3 h-3 text-white" />}
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium">{destination}</p>
                  <p className="text-xs text-gray-500">{activeOrder?.to?.state || activeOrder?.shipping?.destination?.state}</p>
                </div>
              </div>
            </div>
          ) : (
            /* Desktop View */
            <>
              {/* Progress Bar */}
              <div className="w-full h-3 bg-gray-200 rounded-full mb-4">
                <div
                  className="h-3 bg-blue-500 rounded-full transition-all duration-500 ease-in-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>

              {/* Desktop Horizontal Shipping Path */}
              <div className="flex items-center justify-between relative mb-8">
                {/* Source */}
                <div className="text-center">
                  <div className={`w-6 h-6 rounded-full mx-auto mb-1 flex items-center justify-center ${progress >= 0 ? 'bg-blue-500' : 'bg-gray-300'}`}>
                    {progress >= 0 && <CheckIcon className="w-3 h-3 text-white" />}
                  </div>
                  <p className="text-xs font-medium">{origin}</p>
                  <p className="text-xs text-gray-500">{activeOrder?.from?.state || activeOrder?.shipping?.source?.state}</p>
                </div>

                {/* Line */}
                <div className="flex-1 h-1 bg-gray-200 mx-2"></div>

                {/* Shipped */}
                <div className="text-center">
                  <div className={`w-6 h-6 rounded-full mx-auto mb-1 flex items-center justify-center ${progress >= 25 ? 'bg-blue-500' : 'bg-gray-300'}`}>
                    {progress >= 25 && <CheckIcon className="w-3 h-3 text-white" />}
                  </div>
                  <p className="text-xs font-medium">Shipped</p>
                  <p className="text-xs text-gray-500">Package processed</p>
                </div>

                {/* Line */}
                <div className="flex-1 h-1 bg-gray-200 mx-2"></div>

                {/* In Transit */}
                <div className="text-center">
                  <div className={`w-6 h-6 rounded-full mx-auto mb-1 flex items-center justify-center ${progress >= 50 ? 'bg-blue-500' : 'bg-gray-300'}`}>
                    {progress >= 50 && <CheckIcon className="w-3 h-3 text-white" />}
                  </div>
                  <p className="text-xs font-medium">In Transit</p>
                  <p className="text-xs text-gray-500">On the way</p>
                </div>

                {/* Line */}
                <div className="flex-1 h-1 bg-gray-200 mx-2"></div>

                {/* Out for Delivery */}
                <div className="text-center">
                  <div className={`w-6 h-6 rounded-full mx-auto mb-1 flex items-center justify-center ${progress >= 75 ? 'bg-blue-500' : 'bg-gray-300'}`}>
                    {progress >= 75 && <CheckIcon className="w-3 h-3 text-white" />}
                  </div>
                  <p className="text-xs font-medium">Out for Delivery</p>
                  <p className="text-xs text-gray-500">Almost there</p>
                </div>

                {/* Line */}
                <div className="flex-1 h-1 bg-gray-200 mx-2"></div>

                {/* Destination */}
                <div className="text-center">
                  <div className={`w-6 h-6 rounded-full mx-auto mb-1 flex items-center justify-center ${progress >= 100 ? 'bg-blue-500' : 'bg-gray-300'}`}>
                    {progress >= 100 && <CheckIcon className="w-3 h-3 text-white" />}
                  </div>
                  <p className="text-xs font-medium">{destination}</p>
                  <p className="text-xs text-gray-500">{activeOrder?.to?.state || activeOrder?.shipping?.destination?.state}</p>
                </div>
              </div>
            </>
          )}

          {/* Package Details */}
          <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-3'} gap-4 text-sm`}>
            <div className={isMobile ? 'flex justify-between items-center' : ''}>
              <p className="font-medium text-gray-500">Distance</p>
              <p className="font-semibold">{activeOrder?.distance || activeOrder?.shipping?.distance || '0'} km</p>
            </div>
            <div className={isMobile ? 'flex justify-between items-center' : ''}>
              <p className="font-medium text-gray-500">Package Category</p>
              <p className="font-semibold">{activeOrder?.packageDetails?.category || 'Standard'}</p>
            </div>
            <div className={isMobile ? 'flex justify-between items-center' : ''}>
              <p className="font-medium text-gray-500">Weight</p>
              <p className="font-semibold">{activeOrder?.packageDetails?.weight || '0'} kg</p>
            </div>
          </div>

          {/* Order ID selector dropdown */}
          <div className={`mt-4 flex ${isMobile ? 'justify-end' : 'justify-end'}`}>
            <Select
              value={activeOrderId}
              onValueChange={handleOrderChange}
            >
              <SelectTrigger className={`h-8 bg-white border border-gray-100`}>
                <SelectValue placeholder="Select Order ID" />
              </SelectTrigger>
              <SelectContent position="popper" sideOffset={8} align={isMobile ? "center" : "end"}>
                {orders.map((order) => {
                  // Use orderId as the displayed ID
                  const displayId = order.orderId || order.id;
                  const valueId = order.orderId || order.id;
                  return (
                    <SelectItem key={displayId} value={valueId.toString()}>
                      # {displayId}
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

export default TimelineTracker;
