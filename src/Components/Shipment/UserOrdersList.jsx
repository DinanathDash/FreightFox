import { useState, useEffect } from 'react';
import { useAuth } from '../../Context/AuthContext';
import { getUserOrdersWithShipmentDetails } from '../../Firebase/services';
import SimpleTracker from './SimpleTracker.jsx';
import TimelineTracker from './TimelineTrackerIndex.js';
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

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        if (currentUser) {
          const userOrders = await getUserOrdersWithShipmentDetails(currentUser.uid);
          setOrders(userOrders);
          
          // Set first order as active if available, using orderId for easier user searching
          if (userOrders.length > 0) {
            setActiveOrder(userOrders[0].orderId || userOrders[0].id || userOrders[0].trackingId);
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
    if (activeTabValue === 'all') return true;
    if (activeTabValue === 'delivered') return order.status === 'Delivered';
    if (activeTabValue === 'inTransit') return ['In Transit', 'Shipped', 'Processing'].includes(order.status);
    return true;
  });

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-2xl font-bold">My Shipments</h1>
          <p className="text-gray-500">Track and manage your shipments</p>
        </div>

        {/* Timeline Tracker for the selected order */}
        {activeOrder && (
          <TimelineTracker 
            orders={orders}
            activeTrackingId={activeOrder}
            setActiveTrackingId={setActiveOrder}
          />
        )}

        {/* Orders List */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
              <CardTitle>My Orders</CardTitle>
              
              <Tabs defaultValue="all" value={activeTabValue} onValueChange={setActiveTabValue}>
                <TabsList>
                  <TabsTrigger value="all">All Orders</TabsTrigger>
                  <TabsTrigger value="inTransit">In Transit</TabsTrigger>
                  <TabsTrigger value="delivered">Delivered</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading orders...</div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-8">No orders found</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>From</TableHead>
                      <TableHead>To</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map(order => (
                      <TableRow 
                        key={order.id} 
                        className={activeOrder === order.trackingId ? 'bg-blue-50' : ''}
                      >
                        <TableCell className="font-medium">
                          {order.trackingId || order.id}
                        </TableCell>
                        <TableCell>{order.formattedCreatedAt}</TableCell>
                        <TableCell>
                          {order.shipping?.source?.city || 'N/A'}, 
                          {order.shipping?.source?.country || ''}
                        </TableCell>
                        <TableCell>
                          {order.shipping?.destination?.city || 'N/A'}, 
                          {order.shipping?.destination?.country || ''}
                        </TableCell>
                        <TableCell>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                            order.status === 'In Transit' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'Processing' ? 'bg-purple-100 text-purple-800' :
                            order.status === 'Shipped' ? 'bg-amber-100 text-amber-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {order.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setActiveOrder(order.trackingId)}
                          >
                            Track
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default UserOrdersList;