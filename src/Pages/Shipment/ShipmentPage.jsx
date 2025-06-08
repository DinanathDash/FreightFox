import { useState, useEffect } from 'react';
import DashboardLayout from '../../Components/Dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from "../../Components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../Components/ui/table";
import { Button } from "../../Components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../Components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../Components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../Components/ui/tabs";
import { toast } from "sonner";
import { getAllOrders, getOrdersByDateRange } from '../../Firebase/services.js';
import { ensureSampleDataExists } from '../../Firebase/seedDemoData.js';
import TimelineTracker from '../../Components/Shipment/TimelineTracker.jsx';
import DateRangeDialog from '../../Components/Dashboard/DateRangeDialog';
import FiltersDialog from '../../Components/Dashboard/FiltersDialog';
import ShipmentDetails from './ShipmentDetails';
import PriceCalculator from './PriceCalculator';
import CreateShipmentDialog from './CreateShipmentDialog';

function ShipmentPage() {
  const [shipments, setShipments] = useState([]);
  const [filteredShipments, setFilteredShipments] = useState([]);
  const [activeTrackingId, setActiveTrackingId] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [dateRangeDialogOpen, setDateRangeDialogOpen] = useState(false);
  const [filtersDialogOpen, setFiltersDialogOpen] = useState(false);
  const [customDateRange, setCustomDateRange] = useState(null);
  const [activeFilters, setActiveFilters] = useState({ status: null, category: null });
  const [sortOrder, setSortOrder] = useState("latest"); // 'latest', 'oldest', 'status'
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [priceCalculatorOpen, setPriceCalculatorOpen] = useState(false);
  const [createShipmentDialogOpen, setCreateShipmentDialogOpen] = useState(false);

  useEffect(() => {
    const fetchShipments = async () => {
      setLoading(true);
      try {
        console.log("Fetching all orders...");
        
        // Check if we have any data, and if not, add sample data
        await ensureSampleDataExists();
        
        const orders = await getAllOrders();
        console.log(`Fetched ${orders.length} orders`);
        
        // Log the first order to debug
        if (orders.length > 0) {
          console.log("First order sample:", orders[0]);
        }
        
        setShipments(orders);
        setFilteredShipments(orders);

        if (orders.length > 0) {
          // Set the first order as active
          console.log("Setting active tracking ID to:", orders[0].orderId || orders[0].id || orders[0].trackingId);
          setActiveTrackingId(orders[0].orderId || orders[0].id || orders[0].trackingId);
        } else {
          console.log("No orders found in the database");
          toast.error("Could not fetch shipments");
        }
      } catch (error) {
        console.error("Error fetching shipment data:", error);
        toast.error("Error loading shipments");
      } finally {
        setLoading(false);
      }
    };

    fetchShipments();
  }, []);

  // Handle custom date range filtering
  useEffect(() => {
    // If customDateRange is null, reset to show all shipments
    if (customDateRange === null) {
      const fetchAllShipments = async () => {
        setLoading(true);
        try {
          const orders = await getAllOrders();
          console.log(`Fetched all ${orders.length} orders after date filter reset`);
          setShipments(orders);
          setFilteredShipments(orders);
        } catch (error) {
          console.error("Error fetching all shipments:", error);
        } finally {
          setLoading(false);
        }
      };
      
      fetchAllShipments();
      return;
    }
    
    const applyDateRangeFilter = async () => {
      if (!customDateRange || !customDateRange.startDate || !customDateRange.endDate) {
        console.log("Missing date range information, skipping filter");
        return;
      }

      console.log("Applying date range filter:", {
        startDate: customDateRange.startDate instanceof Date ? customDateRange.startDate.toISOString() : customDateRange.startDate,
        endDate: customDateRange.endDate instanceof Date ? customDateRange.endDate.toISOString() : customDateRange.endDate
      });
      
      setLoading(true);
      try {
        const { startDate, endDate } = customDateRange;
        
        // Ensure dates are proper JavaScript Date objects
        const start = startDate instanceof Date ? startDate : new Date(startDate);
        const end = endDate instanceof Date ? endDate : new Date(endDate);
        
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          console.error("Invalid date objects:", { start, end });
          throw new Error("Invalid date range");
        }
        
        // Get orders for the specified date range
        const orders = await getOrdersByDateRange(null, start, end);
        
        console.log(`Fetched ${orders.length} orders for date range:`, {
          startDate: start.toISOString(),
          endDate: end.toISOString()
        });
        
        if (orders.length === 0) {
          console.log("No orders found in the specified date range");
          toast.warning("No shipments found in the selected date range");
        } else {
          console.log("First order timestamp:", 
            orders[0].timestamp instanceof Date ? orders[0].timestamp.toISOString() : 
            typeof orders[0].timestamp === 'object' ? 'Timestamp object' : 
            orders[0].timestamp || 'Unknown');
          
          toast.success(`Found ${orders.length} shipments in the selected date range`);
        }
        
        setShipments(orders);
        setFilteredShipments(orders);
        
        // Reset active filters when applying a new date range
        setActiveFilters({ status: null, category: null });
        setActiveFilter("all");
      } catch (error) {
        console.error("Error applying date range filter:", error);
        toast.error("Failed to filter by date range");
        
        // Fallback to all orders
        const orders = await getAllOrders();
        setShipments(orders);
        setFilteredShipments(orders);
      } finally {
        setLoading(false);
      }
    };

    if (customDateRange) {
      applyDateRangeFilter();
    }
  }, [customDateRange]);

  // Apply filters and sorting
  useEffect(() => {
    console.log("Filter/Sort effect running with:", {
      activeFilter,
      activeFilters,
      sortOrder,
      shipments: shipments.length
    });

    let result = [...shipments];

    // Apply tab filter
    if (activeFilter !== "all") {
      if (activeFilter === "transit") {
        result = result.filter(order => 
          ["In Transit", "Shipped", "Processing", "Out for Delivery"].includes(order.status)
        );
        console.log(`After transit filter: ${result.length} orders`);
      } else if (activeFilter === "delivered") {
        result = result.filter(order => order.status === "Delivered");
        console.log(`After delivered filter: ${result.length} orders`);
      }
    }

    // Apply status filter
    if (activeFilters.status) {
      console.log(`Applying status filter: ${activeFilters.status}`);
      result = result.filter(order => order.status === activeFilters.status);
      console.log(`After status filter: ${result.length} orders`);
    }

    // Apply category filter
    if (activeFilters.category) {
      console.log(`Applying category filter: ${activeFilters.category}`);
      result = result.filter(order => order.category === activeFilters.category);
      console.log(`After category filter: ${result.length} orders`);
    }

    // Apply sorting
    console.log(`Applying sort order: ${sortOrder}`);
    if (sortOrder === "latest") {
      result.sort((a, b) => new Date(b.timestamp || b.created || 0) - new Date(a.timestamp || a.created || 0));
    } else if (sortOrder === "oldest") {
      result.sort((a, b) => new Date(a.timestamp || a.created || 0) - new Date(b.timestamp || b.created || 0));
    } else if (sortOrder === "status") {
      // Sort by status priority: 'Processing', 'Shipped', 'In Transit', 'Out for Delivery', 'Delivered'
      const statusPriority = {
        "Processing": 0,
        "Shipped": 1,
        "In Transit": 2, 
        "Out for Delivery": 3,
        "Delivered": 4
      };
      
      result.sort((a, b) => (statusPriority[a.status] || 0) - (statusPriority[b.status] || 0));
    }
    
    console.log(`Final filtered result: ${result.length} orders`);
    setFilteredShipments(result);
  }, [shipments, activeFilters, sortOrder, activeFilter]);

  const handleOpenDetails = (shipment) => {
    setSelectedShipment(shipment);
    setDetailsDialogOpen(true);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      case 'In Transit':
        return 'bg-blue-100 text-blue-800';
      case 'Shipped':
        return 'bg-purple-100 text-purple-800';
      case 'Processing':
        return 'bg-purple-100 text-purple-800'; // Updated to match TimelineTracker
      case 'Out for Delivery':
        return 'bg-amber-100 text-amber-800'; // Updated to match TimelineTracker
      case 'Pending':
        return 'bg-amber-100 text-amber-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6 p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Shipments</h1>
            <p className="text-gray-500">Manage and track all shipments</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={() => setPriceCalculatorOpen(true)}
            >
              Calculate Price
            </Button>
            <Button onClick={() => setCreateShipmentDialogOpen(true)}>
              Create New Shipment
            </Button>
          </div>
        </div>

        {activeTrackingId && (
          <TimelineTracker 
            orders={shipments}
            activeTrackingId={activeTrackingId}
            setActiveTrackingId={setActiveTrackingId}
          />
        )}

        <Card>
          <CardHeader className="flex flex-col md:flex-row justify-between pb-3">
            <CardTitle>Shipment List</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2 mt-2 md:mt-0">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setFiltersDialogOpen(true)}
                className={activeFilters.status || activeFilters.category ? "border-purple-500 text-purple-500 hover:text-purple-600" : ""}
              >
                {activeFilters.status || activeFilters.category ? 
                  `Filters (${[activeFilters.status, activeFilters.category].filter(Boolean).length})` : 
                  "Filter"}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setDateRangeDialogOpen(true)} 
                className={customDateRange ? "border-blue-500 text-blue-500 hover:text-blue-600" : ""}
              >
                {customDateRange ? "Date Filter Active" : "Date Range"}
              </Button>
              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">Latest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="status">By Status</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" value={activeFilter} onValueChange={setActiveFilter}>
              <TabsList className="mb-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="transit">In Transit</TabsTrigger>
                <TabsTrigger value="delivered">Delivered</TabsTrigger>
              </TabsList>

              {loading ? (
                <div className="text-center py-8">Loading shipments...</div>
              ) : filteredShipments.length === 0 ? (
                <div className="text-center py-8">No shipments found</div>
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
                      {filteredShipments.map(order => (
                        <TableRow 
                          key={order.id || order.orderId}
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => handleOpenDetails(order)}
                        >
                          <TableCell className="font-medium">{order.orderId || order.id}</TableCell>
                          <TableCell>{formatDate(order.timestamp || order.created)}</TableCell>
                          <TableCell>{order.origin || "N/A"}</TableCell>
                          <TableCell>{order.destination || "N/A"}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusClass(order.status)}`}>
                              {order.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveTrackingId(order.orderId || order.id || order.trackingId);
                              }}
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
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Shipment Details</DialogTitle>
            <DialogDescription>
              Complete information about this shipment
            </DialogDescription>
          </DialogHeader>
          {selectedShipment && <ShipmentDetails shipment={selectedShipment} />}
        </DialogContent>
      </Dialog>

      <Dialog open={priceCalculatorOpen} onOpenChange={setPriceCalculatorOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Calculate Shipping Price</DialogTitle>
            <DialogDescription>
              Enter shipment details to get an estimate
            </DialogDescription>
          </DialogHeader>
          <PriceCalculator />
        </DialogContent>
      </Dialog>

      <DateRangeDialog
        open={dateRangeDialogOpen}
        onOpenChange={setDateRangeDialogOpen}
        onDateRangeChange={setCustomDateRange}
      />

      <FiltersDialog
        open={filtersDialogOpen}
        onOpenChange={setFiltersDialogOpen}
        onFiltersChange={setActiveFilters}
        currentFilters={activeFilters}
      />

      <CreateShipmentDialog
        open={createShipmentDialogOpen}
        onOpenChange={(isOpen) => {
          setCreateShipmentDialogOpen(isOpen);
          
          // Refresh shipments list when dialog closes (potential new shipment created)
          if (!isOpen) {
            const fetchShipments = async () => {
              setLoading(true);
              try {
                const orders = await getAllOrders();
                setShipments(orders);
                setFilteredShipments(orders);
              } catch (error) {
                console.error("Error refreshing shipments:", error);
              } finally {
                setLoading(false);
              }
            };
            
            fetchShipments();
          }
        }}
      />
    </DashboardLayout>
  );
}

export default ShipmentPage;
