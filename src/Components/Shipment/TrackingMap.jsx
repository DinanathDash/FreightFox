import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for the Leaflet marker icon issue in React
// This is required because of how webpack handles assets
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Create custom marker icons
const sourceIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const currentIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const destinationIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function TrackingMap({ orders, activeTrackingId, setActiveTrackingId }) {
  // Get current active order - looking for orderId first, then fallback to trackingId
  const activeOrder = orders.find(order => order.orderId === activeTrackingId || order.id === activeTrackingId || order.trackingId === activeTrackingId) || orders[0];
  const [mapKey, setMapKey] = useState(1); // Used to force re-render the map when order changes

  useEffect(() => {
    // Force re-render of map when active order changes
    setMapKey(prev => prev + 1);
  }, [activeTrackingId]);

  // Set up path coordinates based on order data
  const getPathCoordinates = () => {
    if (!activeOrder) return [];
  
    // Check for new structure (from/to) first, then fall back to legacy structure
    const source = activeOrder.from || (activeOrder.shipping?.source);
    const destination = activeOrder.to || (activeOrder.shipping?.destination);
    const currentLocation = activeOrder.currentLocation || activeOrder.shipping?.currentLocation;
    
    // If we have source and destination coordinates
    if (source?.coordinates && destination?.coordinates) {
      const path = [
        [source.coordinates.lat, source.coordinates.lng]
      ];
      
      // Add current location if available
      if (currentLocation?.coordinates) {
        path.push([
          currentLocation.coordinates.lat,
          currentLocation.coordinates.lng
        ]);
      }
      
      path.push([
        destination.coordinates.lat,
        destination.coordinates.lng
      ]);
      
      return path;
    }
    
    // Fallback default path
    return [
      [37.7749, -122.4194],
      [39.7392, -104.9903],
    ];
  };

  // Calculate bounds for the map
  const getBounds = () => {
    const path = getPathCoordinates();
    if (path.length > 0) {
      return L.latLngBounds(path);
    }
    // Default bounds (United States)
    return [
      [24.396308, -125.000000],
      [49.384358, -66.934570]
    ];
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
          <CardTitle>Tracking Map</CardTitle>
        </CardHeader>
        <CardContent className="p-0 pb-1">
          <div className="h-[200px] bg-blue-50 flex items-center justify-center">
            No shipment data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Tracking Map</CardTitle>
      </CardHeader>
      <CardContent className="p-0 pb-1">
        <div className="relative h-[200px] rounded-md overflow-hidden">
          <MapContainer 
            key={mapKey}
            style={{ height: '200px', width: '100%', borderRadius: '0.375rem' }}
            bounds={getBounds()}
            zoom={4}
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Route path as polyline */}
            <Polyline 
              positions={getPathCoordinates()}
              color="#3b82f6"
              weight={4}
            />
            
            {/* Source Marker */}
            {(activeOrder?.from?.coordinates || activeOrder?.shipping?.source?.coordinates) && (
              <Marker 
                position={[
                  (activeOrder.from?.coordinates || activeOrder.shipping?.source?.coordinates).lat,
                  (activeOrder.from?.coordinates || activeOrder.shipping?.source?.coordinates).lng
                ]}
                icon={sourceIcon}
              >
                <Popup>
                  <div className="text-sm font-medium">
                    Origin: {(activeOrder.from || activeOrder.shipping?.source).city}, {(activeOrder.from || activeOrder.shipping?.source).country}
                  </div>
                </Popup>
              </Marker>
            )}
            
            {/* Current Location Marker */}
            {(activeOrder?.currentLocation?.coordinates || activeOrder?.shipping?.currentLocation?.coordinates) && (
              <Marker 
                position={[
                  (activeOrder.currentLocation?.coordinates || activeOrder.shipping?.currentLocation?.coordinates).lat,
                  (activeOrder.currentLocation?.coordinates || activeOrder.shipping?.currentLocation?.coordinates).lng
                ]}
                icon={currentIcon}
              >
                <Popup>
                  <div className="text-sm font-medium">
                    Current Location: {(activeOrder.currentLocation || activeOrder.shipping?.currentLocation).city || 'In Transit'}
                  </div>
                </Popup>
              </Marker>
            )}
            
            {/* Destination Marker */}
            {(activeOrder?.to?.coordinates || activeOrder?.shipping?.destination?.coordinates) && (
              <Marker 
                position={[
                  (activeOrder.to?.coordinates || activeOrder.shipping?.destination?.coordinates).lat,
                  (activeOrder.to?.coordinates || activeOrder.shipping?.destination?.coordinates).lng
                ]}
                icon={destinationIcon}
              >
                <Popup>
                  <div className="text-sm font-medium">
                    Destination: {(activeOrder.to || activeOrder.shipping?.destination).city}, {(activeOrder.to || activeOrder.shipping?.destination).country}
                  </div>
                </Popup>
              </Marker>
            )}
          </MapContainer>
          
          {/* Order ID selector dropdown using shadcn/ui Select */}
          <div className="absolute bottom-3 right-3 z-[1000]">
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

export default TrackingMap;
