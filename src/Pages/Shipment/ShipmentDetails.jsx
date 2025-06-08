import { useState } from 'react';
import { Card, CardContent } from "../../Components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../Components/ui/tabs";
import TimelineTracker from '../../Components/Shipment/TimelineTracker.jsx';
import TrackingMap from '../../Components/Shipment/TrackingMap.jsx';

function ShipmentDetails({ shipment }) {
  const [activeTab, setActiveTab] = useState("details");

  // CSS utility classes for consistent spacing and text size
  const labelClass = "text-gray-500 text-sm";
  const valueClass = "text-sm";
  const gridClass = "grid grid-cols-2 gap-1 py-0.5";

  // Format date handling different date formats
  const formatDate = (dateValue) => {
    if (!dateValue) return 'Unknown';
    
    let date;
    if (dateValue instanceof Date) {
      date = dateValue;
    } else if (typeof dateValue === 'object' && typeof dateValue.toDate === 'function') {
      // Handle Firebase Timestamp objects
      date = dateValue.toDate();
    } else if (typeof dateValue === 'string') {
      // Handle ISO strings or other date strings
      date = new Date(dateValue);
    } else {
      return 'Unknown';
    }
    
    // Check if date is valid
    if (isNaN(date.getTime())) return 'Unknown';
    
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Process shipment data for display
  const processShipmentForDisplay = (shipment) => {
    if (!shipment) return null;
    
    // Create a processed copy
    const processed = { ...shipment };
    
    // Handle address display
    if (shipment.from) {
      processed.originAddress = `${shipment.from.street || ''}, ${shipment.from.landmark || ''}, ${shipment.from.city}, ${shipment.from.state}, ${shipment.from.pincode}`;
      processed.origin = `${shipment.from.city}, ${shipment.from.state}`;
    }
    
    if (shipment.to) {
      processed.destinationAddress = `${shipment.to.street || ''}, ${shipment.to.landmark || ''}, ${shipment.to.city}, ${shipment.to.state}, ${shipment.to.pincode}`;
      processed.destination = `${shipment.to.city}, ${shipment.to.state}`;
    }
    
    // Ensure weight and dimensions are available
    if (shipment.packageDetails) {
      processed.weight = shipment.packageDetails.weight;
      
      // Handle different formats of dimensions
      if (shipment.packageDetails.dimensions) {
        if (typeof shipment.packageDetails.dimensions === 'string') {
          // If dimensions is already a formatted string
          processed.dimensions = shipment.packageDetails.dimensions;
        } else if (typeof shipment.packageDetails.dimensions === 'object') {
          // If dimensions is an object with individual properties
          const l = shipment.packageDetails.dimensions.length || '?';
          const w = shipment.packageDetails.dimensions.width || '?';
          const h = shipment.packageDetails.dimensions.height || '?';
          processed.dimensions = `${l}×${w}×${h} cm`;
        }
      } else {
        // If no dimensions provided, use a default format to avoid undefined values
        processed.dimensions = "N/A";
      }
      
      processed.itemDescription = shipment.packageDetails.description;
    }
    
    // Ensure price is available
    if (shipment.cost) {
      processed.price = shipment.cost.totalAmount;
      processed.currency = shipment.cost.currency || 'INR';
    }
    
    return processed;
  };
  
  // Apply the processing
  const processedShipment = processShipmentForDisplay(shipment);

  return (
    <div className="">
      <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-2">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="tracking">Tracking</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Order Information */}
            <Card className="overflow-hidden p-1">
              <CardContent className="p-3">
                <h3 className="text-sm font-semibold mb-1">Order Information</h3>
                <div className="space-y-0.5">
                  <div className={gridClass}>
                    <span className={labelClass}>Order ID:</span>
                    <span className={`${valueClass} font-medium`}>{processedShipment.orderId || processedShipment.id || "N/A"}</span>
                  </div>
                  <div className={gridClass}>
                    <span className={labelClass}>Date Created:</span>
                    <span className={valueClass}>{formatDate(processedShipment.timestamp || processedShipment.created || processedShipment.createdAt)}</span>
                  </div>
                  <div className={gridClass}>
                    <span className={labelClass}>Expected Delivery:</span>
                    <span className={valueClass}>{formatDate(processedShipment.expectedDelivery || processedShipment.estimatedArrivalDate) || "N/A"}</span>
                  </div>
                  <div className={gridClass}>
                    <span className={labelClass}>Status:</span>
                    <span className={`${valueClass} font-medium`}>{processedShipment.status || "N/A"}</span>
                  </div>
                  <div className={gridClass}>
                    <span className={labelClass}>Carrier:</span>
                    <span className={valueClass}>{processedShipment.carrier || "FreightFox"}</span>
                  </div>
                  <div className={gridClass}>
                    <span className={labelClass}>Service Type:</span>
                    <span className={valueClass}>{processedShipment.serviceType || "Standard"}</span>
                  </div>
                  <div className={gridClass}>
                    <span className={labelClass}>Price:</span>
                    <span className={valueClass}>
                      {processedShipment.price 
                        ? `${processedShipment.currency === 'INR' ? '₹' : '$'} ${processedShipment.price.toFixed(2)}` 
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Item Information */}
            <Card className="overflow-hidden p-1">
              <CardContent className="p-3">
                <h3 className="text-sm font-semibold mb-1">Item Information</h3>
                <div className="space-y-0.5">
                  <div className={gridClass}>
                    <span className={labelClass}>Weight:</span>
                    <span className={valueClass}>{processedShipment.weight ? `${processedShipment.weight} kg` : "N/A"}</span>
                  </div>
                  <div className={gridClass}>
                    <span className={labelClass}>Dimensions:</span>
                    <span className={valueClass}>{processedShipment.dimensions || "N/A"}</span>
                  </div>
                  <div className={gridClass}>
                    <span className={labelClass}>Package Type:</span>
                    <span className={valueClass}>{shipment.packageType || "Standard"}</span>
                  </div>
                  <div className={gridClass}>
                    <span className={labelClass}>Items:</span>
                    <span className={valueClass}>{shipment.itemCount || 1}</span>
                  </div>
                  <div className={gridClass}>
                    <span className={labelClass}>Description:</span>
                    <span className={valueClass}>{processedShipment.itemDescription || "N/A"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Address Information */}
            <Card className="overflow-hidden p-1">
              <CardContent className="p-3">
                <h3 className="text-sm font-semibold mb-1">Address Information</h3>
                <div className="space-y-1.5">
                  <div>
                    <h4 className="font-medium text-gray-700 text-sm">Origin:</h4>
                    <p className="mt-0.5 text-sm leading-tight">{processedShipment.originAddress || processedShipment.origin || "N/A"}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700 text-sm">Destination:</h4>
                    <p className="mt-0.5 text-sm leading-tight">{processedShipment.destinationAddress || processedShipment.destination || "N/A"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card className="overflow-hidden p-1">
              <CardContent className="p-3">
                <h3 className="text-sm font-semibold mb-1">Customer Information</h3>
                <div className="space-y-0.5">
                  <div className={gridClass}>
                    <span className={labelClass}>Customer Name:</span>
                    <span className={valueClass}>{shipment.customerName || shipment.userName || "N/A"}</span>
                  </div>
                  <div className={gridClass}>
                    <span className={labelClass}>Email:</span>
                    <span className={valueClass}>{shipment.customerEmail || shipment.userEmail || "N/A"}</span>
                  </div>
                  <div className={gridClass}>
                    <span className={labelClass}>Phone:</span>
                    <span className={valueClass}>{shipment.customerPhone || "N/A"}</span>
                  </div>
                  <div className={gridClass}>
                    <span className={labelClass}>Customer ID:</span>
                    <span className={valueClass}>{shipment.customerId || shipment.userId || "N/A"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tracking" className="space-y-2">
          <TimelineTracker
            orders={[shipment]}
            activeTrackingId={shipment.orderId || shipment.id || shipment.trackingId}
            detailed={true}
            setActiveTrackingId={() => {}} /* Empty function since we don't need to change tracking id */
          />
        </TabsContent>

        <TabsContent value="documents" className="space-y-2">
          <Card className="overflow-hidden">
            <CardContent className="py-2 px-3">
              <h3 className="text-md font-semibold mb-1">Shipping Documents</h3>

              {shipment.documents && shipment.documents.length > 0 ? (
                <ul className="space-y-1">
                  {shipment.documents.map((doc, index) => (
                    <li key={index} className="border rounded-md p-1 flex justify-between items-center text-xs">
                      <span>{doc.name}</span>
                      <button className="text-blue-600 hover:underline text-xs">View</button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm">No documents available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ShipmentDetails;
