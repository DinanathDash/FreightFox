import { useState, useEffect } from 'react';
import { useAuth } from '../../Context/AuthContext';
import { getUserOrdersWithShipmentDetails } from '../../Firebase/services';
import SimpleTracker from './SimpleTracker.jsx';
import TimelineTracker from './TimelineTracker.jsx';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

function UserOrdersList() {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeOrder, setActiveOrder] = useState(null);
  const [activeTabValue, setActiveTabValue] = useState("all");
  const [isMobile, setIsMobile] = useState(false);
  
  // Setting up correct status badge classes
  const getStatusBadgeClass = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    const statusLower = status.toLowerCase();
    
    if (statusLower === 'delivered') return 'bg-green-100 text-green-800';
    if (statusLower === 'in transit') return 'bg-blue-100 text-blue-800';
    if (statusLower === 'processing') return 'bg-purple-100 text-purple-800';
    if (statusLower === 'shipped') return 'bg-amber-100 text-amber-800';
    if (statusLower === 'pending') return 'bg-amber-100 text-amber-800';
    if (statusLower === 'cancelled' || statusLower === 'canceled') return 'bg-red-100 text-red-800';
    if (statusLower === 'out for delivery') return 'bg-amber-100 text-amber-800';
    
    return 'bg-gray-100 text-gray-800';
  };

  // Check for mobile screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  // Format date for mobile view
  const formatDateForMobile = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: '2-digit' });
  };

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        if (currentUser) {
          const userOrders = await getUserOrdersWithShipmentDetails(currentUser.uid);
          
          // Process orders to add formatted dates for mobile
          const processedOrders = userOrders.map(order => ({
            ...order,
            shortFormattedDate: formatDateForMobile(order.createdAt)
          }));
          
          setOrders(processedOrders);
          
          // Set first order as active if available, using orderId for tracking
          if (processedOrders.length > 0) {
            setActiveOrder(processedOrders[0].orderId || processedOrders[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [currentUser]);

  // Filter orders based on tab
  const filteredOrders = orders.filter(order => {
    const status = order.status?.toLowerCase() || '';
    if (activeTabValue === 'all') return true;
    if (activeTabValue === 'delivered') return status === 'delivered';
    if (activeTabValue === 'canceled') return status === 'canceled' || status === 'cancelled';
    if (activeTabValue === 'inTransit') return ['in transit', 'shipped', 'processing', 'out for delivery'].includes(status);
    return true;
  });

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col space-y-6">
        <div className="text-center sm:text-left">
          <h1 className="text-2xl font-bold">My Shipments</h1>
          <p className="text-gray-500">Track and manage your shipments</p>
        </div>

        {/* Timeline Tracker for the selected order */}
        {activeOrder && (
          <div className="overflow-hidden">
            <div className={isMobile ? "scale-90 origin-top" : ""}>
              <TimelineTracker 
                orders={orders}
                activeTrackingId={activeOrder}
                setActiveTrackingId={setActiveOrder}
              />
            </div>
          </div>
        )}

        {/* Orders List */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex flex-col space-y-4 w-full">
              <div className="flex flex-row justify-between items-center">
                <CardTitle>My Orders</CardTitle>
              </div>
              
              <Tabs defaultValue="all" value={activeTabValue} onValueChange={setActiveTabValue} className="w-full">
                <TabsList className="grid grid-cols-2 md:flex w-full gap-1 p-1">
                  <TabsTrigger value="all" className="text-sm">All Orders</TabsTrigger>
                  <TabsTrigger value="inTransit" className="text-sm">In Transit</TabsTrigger>
                  <TabsTrigger value="delivered" className="text-sm">Delivered</TabsTrigger>
                  <TabsTrigger value="canceled" className="text-sm">Canceled</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em]" role="status">
                  <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
                </div>
                <div className="mt-2">Loading orders...</div>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <p className="mt-2 text-gray-500">No orders found</p>
              </div>
            ) : (
              <div className="transition-all duration-300 ease-in-out">
                {/* Table view for tablet and desktop */}
                <div className="hidden sm:block">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="uppercase text-xs font-medium text-gray-500">Order ID</TableHead>
                          <TableHead className="uppercase text-xs font-medium text-gray-500">Date</TableHead>
                          <TableHead className="uppercase text-xs font-medium text-gray-500">From</TableHead>
                          <TableHead className="uppercase text-xs font-medium text-gray-500">To</TableHead>
                          <TableHead className="uppercase text-xs font-medium text-gray-500">Status</TableHead>
                          <TableHead className="text-right uppercase text-xs font-medium text-gray-500">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredOrders.map(order => (
                          <TableRow 
                            key={order.id} 
                            className={`transition-colors duration-200 hover:bg-gray-50 ${activeOrder === (order.orderId || order.id) ? 'bg-blue-50 hover:bg-blue-50' : ''}`}
                          >
                            <TableCell className="font-medium">
                              {order.orderId || order.id}
                            </TableCell>
                            <TableCell>{order.formattedCreatedAt}</TableCell>
                            <TableCell className="max-w-[120px]">
                              <div className="truncate">
                                {order.shipping?.source?.city || 'N/A'}{order.shipping?.source?.country ? `, ${order.shipping.source.country}` : ''}
                              </div>
                            </TableCell>
                            <TableCell className="max-w-[120px]">
                              <div className="truncate">
                                {order.shipping?.destination?.city || 'N/A'}{order.shipping?.destination?.country ? `, ${order.shipping.destination.country}` : ''}
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(order.status)}`}>
                                {/* Ensure first letter is capitalized */}
                                {order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || 'N/A'}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="shadow-sm hover:shadow-none transition-shadow"
                                onClick={() => setActiveOrder(order.orderId || order.id)}
                              >
                                <span className="flex items-center justify-center gap-1">
                                  <svg className="w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
                                  Track
                                </span>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
                
                {/* Card view for mobile */}
                <div className="block sm:hidden">
                  <div className="divide-y divide-gray-100">
                    {filteredOrders.map(order => (
                      <div 
                        key={order.id} 
                        className={`p-4 ${activeOrder === (order.orderId || order.id) ? 'bg-blue-50' : ''} transition-colors duration-200 ease-in-out hover:bg-gray-50 active:bg-gray-100`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="font-medium text-base">{order.orderId || order.id}</div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusBadgeClass(order.status)}`}>
                            {order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || 'N/A'}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm mt-3">
                          <div>
                            <div className="text-gray-500 text-xs uppercase font-medium">Date</div>
                            <div className="line-clamp-1">{order.shortFormattedDate || order.formattedCreatedAt}</div>
                          </div>
                          <div>
                            <div className="text-gray-500 text-xs uppercase font-medium">From</div>
                            <div className="line-clamp-1">{order.shipping?.source?.city || 'N/A'}{order.shipping?.source?.country ? `, ${order.shipping.source.country}` : ''}</div>
                          </div>
                          <div>
                            <div className="text-gray-500 text-xs uppercase font-medium">To</div>
                            <div className="line-clamp-1">{order.shipping?.destination?.city || 'N/A'}{order.shipping?.destination?.country ? `, ${order.shipping.destination.country}` : ''}</div>
                          </div>
                          <div className="flex justify-end items-end">
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="w-full shadow-sm active:shadow-none transition-shadow"
                              onClick={() => setActiveOrder(order.orderId || order.id)}
                            >
                              <span className="flex items-center justify-center gap-1">
                                <svg className="w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                                Track
                              </span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default UserOrdersList;