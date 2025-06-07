import { useState, useEffect } from 'react';
import DashboardLayout from '../../Components/Dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from "../../Components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../Components/ui/table";
import { Button } from "../../Components/ui/button";
import { getAllOrders, getDashboardStats } from '../../Firebase/services.js';

function DashboardPage() {
  const [activeFilter, setActiveFilter] = useState("12 months");
  const [activeTrackingId, setActiveTrackingId] = useState("");
  const [shipments, setShipments] = useState([]);
  const [stats, setStats] = useState({
    totalShipments: 0,
    totalOrders: 0,
    revenue: 0,
    delivered: 0
  });
  const [loading, setLoading] = useState(true);

  const filterOptions = [
    "12 months",
    "30 days",
    "7 days",
    "24 hours"
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch orders based on active filter
        const orders = await getAllOrders(activeFilter);
        setShipments(orders);
        
        // Get dashboard statistics
        const dashboardStats = await getDashboardStats(activeFilter);
        setStats(dashboardStats);
        
        // Set an active tracking ID from the first order if available
        if (orders.length > 0 && orders[0].trackingId) {
          setActiveTrackingId(orders[0].trackingId);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeFilter]);

  // Sample data as fallback if firebase fetch fails
  const fallbackShipments = [
    {
      orderId: "43123445",
      category: "Category A",
      arrival: "01-User 1",
      route: "01-User 1",
      status: "Delivered"
    },
    {
      id: "43123445",
      category: "Category B",
      arrival: "02-User 2",
      route: "02-User 2",
      status: "Pending"
    },
    {
      id: "43123445",
      category: "Category A",
      arrival: "01-User 1",
      route: "01-User 1",
      status: "Shipping"
    }
  ];

  return (
    <DashboardLayout>
      {/* Header with Welcome message and filter controls */}
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="flex items-start space-x-1">
            {filterOptions.map((option) => (
              <button
                key={option}
                onClick={() => setActiveFilter(option)}
                className={`px-3 py-1.5 text-sm ${activeFilter === option
                  ? "bg-blue-50 text-blue-800 border-blue-100"
                  : "bg-white text-gray-700 border-gray-100"
                  } border rounded-md`}
              >
                {option}
              </button>
            ))}
          </div>
          <div className='flex items-end space-x-2'>
            <Button variant="outline" className="flex items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
                <path d="M8 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M16 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M3 10H21" stroke="currentColor" strokeWidth="2" />
              </svg>
              Select Dates
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 7H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M6 12H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M10 17H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Filters
            </Button>
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4'>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 mt-4">
            {/* Total Shipments */}
            <Card className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-1 pt-3">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-blue-500 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 6V8.42C22 10 21 11 19.42 11H16V4.01C16 2.9 16.91 2 18.02 2C19.11 2.01 20.11 2.45 20.83 3.17C21.55 3.9 22 4.9 22 6Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M2 7V21C2 21.83 2.94 22.3 3.6 21.8L5.31 20.52C5.71 20.22 6.27 20.26 6.63 20.62L8.29 22.29C8.68 22.68 9.32 22.68 9.71 22.29L11.39 20.61C11.74 20.26 12.3 20.22 12.69 20.52L14.4 21.8C15.06 22.29 16 21.82 16 21V4C16 2.9 16.9 2 18 2H7H6C3 2 2 3.79 2 6V7Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <CardTitle className="text-sm font-medium">Total Shipments</CardTitle>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="2" fill="currentColor" />
                    <circle cx="19" cy="12" r="2" fill="currentColor" />
                    <circle cx="5" cy="12" r="2" fill="currentColor" />
                  </svg>
                </button>
              </CardHeader>
              <CardContent className="pb-3 pt-1">
                <div className="flex flex-col">
                  <div className="text-3xl font-bold">{loading ? "..." : stats.totalShipments.toLocaleString()}</div>
                  <div className="flex items-center mt-1">
                    <span className="text-xs text-gray-500">VS Last Week</span>
                    <span className="ml-2 px-1.5 py-0.5 text-xs bg-green-100 text-green-800 rounded">+150</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Total Orders */}
            <Card className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-1 pt-3">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-blue-500 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3.17 7.44L12 12.55L20.77 7.47" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 21.61V12.54" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M9.93 2.48L4.59 5.45C3.38 6.12 2.39 7.8 2.39 9.18V14.83C2.39 16.21 3.38 17.89 4.59 18.56L9.93 21.53C11.07 22.16 12.94 22.16 14.08 21.53L19.42 18.56C20.63 17.89 21.62 16.21 21.62 14.83V9.18C21.62 7.8 20.63 6.12 19.42 5.45L14.08 2.48C12.93 1.84 11.07 1.84 9.93 2.48Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <CardTitle className="text-sm font-medium">Total Order</CardTitle>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="2" fill="currentColor" />
                    <circle cx="19" cy="12" r="2" fill="currentColor" />
                    <circle cx="5" cy="12" r="2" fill="currentColor" />
                  </svg>
                </button>
              </CardHeader>
              <CardContent className="pb-3 pt-1">
                <div className="flex flex-col">
                  <div className="text-3xl font-bold">{loading ? "..." : stats.totalOrders.toLocaleString()}</div>
                  <div className="flex items-center mt-1">
                    <span className="text-xs text-gray-500">VS Last Week</span>
                    <span className="ml-2 px-1.5 py-0.5 text-xs bg-green-100 text-green-800 rounded">+150</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Revenue */}
            <Card className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-1 pt-3">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-blue-500 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8.67188 14.3298C8.67188 15.6198 9.66188 16.6598 10.8919 16.6598H13.4019C14.4719 16.6598 15.3419 15.7498 15.3419 14.6298C15.3419 13.4098 14.8119 12.9798 14.0219 12.6998L9.99187 11.2998C9.20187 11.0198 8.67188 10.5898 8.67188 9.36984C8.67188 8.24984 9.54187 7.33984 10.6119 7.33984H13.1219C14.3519 7.33984 15.3419 8.37984 15.3419 9.66984" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 6V18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="2" fill="currentColor" />
                    <circle cx="19" cy="12" r="2" fill="currentColor" />
                    <circle cx="5" cy="12" r="2" fill="currentColor" />
                  </svg>
                </button>
              </CardHeader>
              <CardContent className="pb-3 pt-1">
                <div className="flex flex-col">
                  <div className="text-3xl font-bold">{loading ? "..." : `$${stats.revenue.toLocaleString()}`}</div>
                  <div className="flex items-center mt-1">
                    <span className="text-xs text-gray-500">VS Last Week</span>
                    <span className="ml-2 px-1.5 py-0.5 text-xs bg-green-100 text-green-800 rounded">+$150</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Delivered */}
            <Card className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-1 pt-3">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-blue-500 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2.5 13.24V11.51C2.5 9.44001 4.18999 7.75 6.25999 7.75H17.74C19.81 7.75 21.5 9.44001 21.5 11.51V12.95H19.48C18.92 12.95 18.41 13.17 18.04 13.55C17.62 13.96 17.38 14.55 17.44 15.18C17.53 16.26 18.52 17.05 19.6 17.05H21.5V18.24C21.5 20.31 19.81 22 17.74 22H12.26" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M2.5 12.41V7.84004C2.5 6.65004 3.23 5.59 4.34 5.17L12.28 2.17C13.52 1.7 14.85 2.62003 14.85 3.95003V7.75002" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M22.5588 13.9702V16.0302C22.5588 16.5802 22.1188 17.0302 21.5588 17.0502H19.5988C18.5188 17.0502 17.5288 16.2602 17.4388 15.1802C17.3788 14.5502 17.6188 13.9602 18.0388 13.5502C18.4088 13.1702 18.9188 12.9502 19.4788 12.9502H21.5588C22.1188 12.9702 22.5588 13.4202 22.5588 13.9702Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M7 12H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M3 16.5H8.34C8.98 16.5 9.5 17.02 9.5 17.66V18.94" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M4.22 15.28L3 16.5L4.22 17.72" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M9.5 21.78H4.16C3.52 21.78 3 21.26 3 20.62V19.34" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M8.28125 23.0003L9.50125 21.7803L8.28125 20.5603" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <CardTitle className="text-sm font-medium">Delivered</CardTitle>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="2" fill="currentColor" />
                    <circle cx="19" cy="12" r="2" fill="currentColor" />
                    <circle cx="5" cy="12" r="2" fill="currentColor" />
                  </svg>
                </button>
              </CardHeader>
              <CardContent className="pb-3 pt-1">
                <div className="flex flex-col">
                  <div className="text-3xl font-bold">{loading ? "..." : stats.delivered.toLocaleString()}</div>
                  <div className="flex items-center mt-1">
                    <span className="text-xs text-gray-500">VS Last Week</span>
                    <span className="ml-2 px-1.5 py-0.5 text-xs bg-green-100 text-green-800 rounded">+150</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Tracking Map */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
            <Card className="col-span-full lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle>Tracking Track</CardTitle>
                <button className="text-gray-400 hover:text-gray-600">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="2" fill="currentColor" />
                    <circle cx="19" cy="12" r="2" fill="currentColor" />
                    <circle cx="5" cy="12" r="2" fill="currentColor" />
                  </svg>
                </button>
              </CardHeader>
              <CardContent className="p-0 pb-1">
                <div className="relative h-[200px] rounded-md overflow-hidden">
                  {/* Map styling to match screenshot */}
                  <div className="absolute inset-0 bg-blue-50">
                    {/* Route illustration with SVG - updated to match the image */}
                    <svg viewBox="0 0 400 200" className="w-full h-full">
                      {/* Background styling */}
                      <rect x="0" y="0" width="400" height="200" fill="#f0f7ff" />

                      {/* Route path - matching blue line in image */}
                      <path
                        d="M50,150 C90,100 130,170 170,130 C210,90 250,130 300,70 C330,40 350,50 370,30"
                        stroke="#3b82f6"
                        strokeWidth="4"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {/* Start point */}
                      <circle cx="50" cy="150" r="5" fill="#3b82f6" />

                      {/* Midpoint */}
                      <circle cx="170" cy="130" r="5" fill="#3b82f6" />
                      <circle cx="170" cy="130" r="8" fill="#3b82f6" fillOpacity="0.3" />

                      {/* Current location point with outer ring */}
                      <circle cx="370" cy="30" r="5" fill="#3b82f6" />
                      <circle cx="370" cy="30" r="8" fill="#3b82f6" fillOpacity="0.3" />
                      <circle cx="370" cy="30" r="11" fill="#3b82f6" fillOpacity="0.2" />
                    </svg>
                  </div>

                  {/* ID selector dropdown - matches the UI in the image */}
                  <div className="absolute bottom-3 right-3">
                    <div className="bg-white rounded-md shadow-sm p-2 flex items-center space-x-2 border border-gray-100">
                      <span className="text-xs font-medium text-gray-700">ID: {activeTrackingId}</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Shipping List Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
          {/* Shipping List (full width on mobile, 1/3 width on larger screens) */}
          <div className="col-span-full lg:col-span-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle>Shipping List</CardTitle>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="flex items-center gap-1 text-xs h-8">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
                      <path d="M8 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <path d="M16 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <path d="M3 10H21" stroke="currentColor" strokeWidth="2" />
                    </svg>
                    Last 7d
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center gap-1 text-xs h-8">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 7H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <path d="M6 12H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <path d="M10 17H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    Sort by: Latest
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="w-[150px] uppercase text-xs font-medium text-gray-500">ORDER ID</TableHead>
                      <TableHead className="uppercase text-xs font-medium text-gray-500">CATEGORY</TableHead>
                      <TableHead className="uppercase text-xs font-medium text-gray-500">ARRIVAL TIME</TableHead>
                      <TableHead className="uppercase text-xs font-medium text-gray-500">ROUTE</TableHead>
                      <TableHead className="uppercase text-xs font-medium text-gray-500">STATUS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">Loading...</TableCell>
                      </TableRow>
                    ) : shipments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">No orders found</TableCell>
                      </TableRow>
                    ) : (
                      shipments.map((shipment, index) => (                      <TableRow key={index} className="hover:bg-gray-50">
                        <TableCell className="font-medium text-sm">{`#${shipment.orderId || shipment.id}`}</TableCell>
                        <TableCell className="text-sm">
                          {shipment.packageDetails?.category || shipment.category}
                          {shipment.packageDetails && 
                            <div className="text-xs text-gray-500">
                              {shipment.packageDetails.size} • {shipment.packageDetails.weight} kg
                            </div>
                          }
                        </TableCell>
                        <TableCell className="text-sm">
                          {shipment.shipping?.estimatedArrivalDate ? 
                            shipment.shipping.arrivalDateString :
                            shipment.arrival}
                          {shipment.shipping && 
                            <div className="text-xs text-gray-500">
                              {shipment.shipping.estimatedDeliveryDays} days
                            </div>
                          }
                        </TableCell>
                        <TableCell className="text-sm">
                          {shipment.route || 
                            (shipment.shipping && 
                              `${shipment.shipping.source.city} → ${shipment.shipping.destination.city}`)}
                          {shipment.shipping && 
                            <div className="text-xs text-gray-500">
                              {shipment.shipping.distance} km
                            </div>
                          }
                        </TableCell>
                        <TableCell>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            shipment.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                            shipment.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                            shipment.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                            shipment.status === 'Processing' ? 'bg-purple-100 text-purple-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {shipment.status}
                          </span>
                        </TableCell>
                      </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default DashboardPage;
