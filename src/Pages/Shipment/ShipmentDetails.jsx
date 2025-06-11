import { useState } from 'react';
import { Card, CardContent } from "../../Components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../Components/ui/tabs";
import TimelineTracker from '../../Components/Shipment/TimelineTracker.jsx';
import TrackingMap from '../../Components/Shipment/TrackingMap.jsx';

function ShipmentDetails({ shipment, initialTab = "details" }) {
  const [activeTab, setActiveTab] = useState(initialTab);

  // CSS utility classes for consistent spacing and text size
  const labelClass = "text-gray-500 text-sm";
  const valueClass = "text-sm break-words";
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
    
    // Handle address display - support both sender/recipient and from/to structures
    if (shipment.sender && shipment.sender.address) {
      const addr = shipment.sender.address;
      processed.originAddress = `${addr.street || ''}, ${addr.landmark || ''}, ${addr.city || ''}, ${addr.state || ''}, ${addr.pincode || ''}`.replace(/, ,/g, ',').replace(/^, |, $/g, '');
      processed.origin = `${addr.city || ''}, ${addr.state || ''}`.replace(/, $/g, '');
      
      // Extract sender info
      processed.fromName = shipment.sender.name;
      processed.fromEmail = shipment.sender.email;
      processed.fromPhone = shipment.sender.phone;
    } else if (shipment.from) {
      processed.originAddress = `${shipment.from.street || ''}, ${shipment.from.landmark || ''}, ${shipment.from.city || ''}, ${shipment.from.state || ''}, ${shipment.from.pincode || ''}`.replace(/, ,/g, ',').replace(/^, |, $/g, '');
      processed.origin = `${shipment.from.city || ''}, ${shipment.from.state || ''}`.replace(/, $/g, '');
    }
    
    if (shipment.recipient && shipment.recipient.address) {
      const addr = shipment.recipient.address;
      processed.destinationAddress = `${addr.street || ''}, ${addr.landmark || ''}, ${addr.city || ''}, ${addr.state || ''}, ${addr.pincode || ''}`.replace(/, ,/g, ',').replace(/^, |, $/g, '');
      processed.destination = `${addr.city || ''}, ${addr.state || ''}`.replace(/, $/g, '');
      
      // Extract recipient info
      processed.toName = shipment.recipient.name;
      processed.toEmail = shipment.recipient.email;
      processed.toPhone = shipment.recipient.phone;
    } else if (shipment.to) {
      processed.destinationAddress = `${shipment.to.street || ''}, ${shipment.to.landmark || ''}, ${shipment.to.city || ''}, ${shipment.to.state || ''}, ${shipment.to.pincode || ''}`.replace(/, ,/g, ',').replace(/^, |, $/g, '');
      processed.destination = `${shipment.to.city || ''}, ${shipment.to.state || ''}`.replace(/, $/g, '');
    }
    
    // Ensure weight and dimensions are available - handle both structures
    if (shipment.package) {
      processed.weight = shipment.package.weight;
      processed.dimensions = shipment.package.size || "N/A";
      processed.packageType = shipment.package.category || "Standard";
      processed.itemDescription = shipment.package.description;
    } else if (shipment.packageDetails) {
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
    
    // Handle customer information
    processed.customerName = shipment.customerName || shipment.sender?.name;
    processed.customerEmail = shipment.customerEmail || shipment.userEmail || shipment.sender?.email;
    processed.customerPhone = shipment.customerPhone || shipment.sender?.phone;
    processed.customerId = shipment.customerId || shipment.userId;
    
    // Ensure price is available - handle both structures
    if (shipment.cost) {
      processed.price = shipment.cost.totalAmount;
      processed.currency = shipment.cost.currency || 'INR';
    } else if (shipment.shipping && shipment.shipping.price) {
      processed.price = shipment.shipping.price;
      processed.currency = shipment.shipping.currency || 'INR';
    } else if (shipment.price) {
      processed.price = shipment.price;
      processed.currency = 'INR';
    }
    
    // Service Type
    processed.serviceType = shipment.serviceType || (shipment.shipping && shipment.shipping.serviceType) || "Standard";
    
    // We're using orderId as our standard tracking identifier
    processed.orderId = shipment.orderId || shipment.id;
    
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
                    <span className={valueClass}>
                      {processedShipment.serviceType === 'Express' ? 'In 1-2 business days' : 
                       processedShipment.serviceType === 'Same Day' ? 'Today' : 
                       processedShipment.serviceType === 'Next Day' ? 'Tomorrow' : 
                       'In 3-5 business days'}
                    </span>
                  </div>
                  <div className={gridClass}>
                    <span className={labelClass}>Status:</span>
                    <span className={`${valueClass} font-medium`}>
                      {processedShipment.status 
                        ? processedShipment.status.charAt(0).toUpperCase() + processedShipment.status.slice(1) 
                        : "N/A"}
                    </span>
                  </div>
                  <div className={gridClass}>
                    <span className={labelClass}>Carrier:</span>
                    <span className={valueClass}>{processedShipment.carrier || "FreightFox"}</span>
                  </div>
                  <div className={gridClass}>
                    <span className={labelClass}>Service Type:</span>
                    <span className={valueClass}>{processedShipment.serviceType}</span>
                  </div>
                  <div className={gridClass}>
                    <span className={labelClass}>Price:</span>
                    <span className={valueClass}>
                      {processedShipment.price 
                        ? `₹${processedShipment.price.toFixed(2)}` 
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
                    <span className={valueClass}>{processedShipment.packageType || "Standard"}</span>
                  </div>
                  <div className={gridClass}>
                    <span className={labelClass}>Items:</span>
                    <span className={valueClass}>{processedShipment.itemCount || 1}</span>
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
                    <span className={valueClass}>{processedShipment.customerName || "N/A"}</span>
                  </div>
                  <div className={gridClass}>
                    <span className={labelClass}>Email:</span>
                    <span className={valueClass}>{processedShipment.customerEmail || "N/A"}</span>
                  </div>
                  <div className={gridClass}>
                    <span className={labelClass}>Phone:</span>
                    <span className={valueClass}>{processedShipment.customerPhone || "N/A"}</span>
                  </div>
                  <div className={gridClass}>
                    <span className={labelClass}>Customer ID:</span>
                    <span className={valueClass}>{processedShipment.customerId || "N/A"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tracking" className="space-y-2">
          <TimelineTracker
            orders={[shipment]}
            activeTrackingId={shipment.orderId || shipment.id}
            detailed={true}
            setActiveTrackingId={() => {}} /* Empty function since we don't need to change the order id */
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
