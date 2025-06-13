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
import TimelineTracker from '../../Components/Shipment/TimelineTracker.jsx';
import DateRangeDialog from '../../Components/Dashboard/DateRangeDialog';
import FiltersDialog from '../../Components/Dashboard/FiltersDialog';
import ShipmentDetails from './ShipmentDetails';
import PriceCalculator from './PriceCalculator';
import CreateShipmentDialog from './CreateShipmentDialog';

function ShipmentPage() {
  const [shipments, setShipments] = useState([]);
  const [filteredShipments, setFilteredShipments] = useState([]);
  const [activeOrderId, setActiveOrderId] = useState("");
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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const fetchShipments = async () => {
      setLoading(true);
      try {
        const orders = await getAllOrders();

        setShipments(orders);
        setFilteredShipments(orders);

        if (orders.length > 0) {
          // Set the first order as active
          setActiveOrderId(orders[0].orderId || orders[0].id);
        } else {
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

      setLoading(true);
      try {
        const { startDate, endDate } = customDateRange;

        // Ensure dates are proper JavaScript Date objects
        const start = startDate instanceof Date ? startDate : new Date(startDate);
        const end = endDate instanceof Date ? endDate : new Date(endDate);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          throw new Error("Invalid date range");
        }

        // Get orders for the specified date range
        const orders = await getOrdersByDateRange(null, start, end);

        if (orders.length === 0) {
          toast.warning("No shipments found in the selected date range");
        } else {
          toast.success(`Found ${orders.length} shipments in the selected date range`);
        }

        setShipments(orders);
        setFilteredShipments(orders);

        // Reset active filters when applying a new date range
        setActiveFilters({ status: null, category: null });
        setActiveFilter("all");
      } catch (error) {
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
    let result = [...shipments];

    // Apply tab filter
    if (activeFilter !== "all") {
      if (activeFilter === "transit") {
        result = result.filter(order =>
          ["In Transit", "Shipped", "Processing", "Out for Delivery"].includes(order.status)
        );
      } else if (activeFilter === "delivered") {
        result = result.filter(order => order.status === "Delivered");
      }
      else if (activeFilter === "canceled") {
        result = result.filter(order => order.status === "Cancelled");
      }
    }

    // Apply status filter
    if (activeFilters.status) {
      result = result.filter(order => order.status === activeFilters.status);
    }

    // Apply category filter
    if (activeFilters.category) {
      result = result.filter(order => order.category === activeFilters.category);
    }

    // Apply sorting
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

    setFilteredShipments(result);
  }, [shipments, activeFilters, sortOrder, activeFilter]);

  const handleOpenDetails = (shipment, initialTab = "details") => {
    setSelectedShipment({ ...shipment, initialTab });
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

  // Format date with options for mobile or desktop view
  const formatDate = (timestamp, short = false) => {
    if (!timestamp) return 'Unknown';
    const date = new Date(timestamp);
    
    if (short) {
      // Shorter format for mobile view
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: '2-digit'
      });
    }
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  // Truncate long text for mobile displays
  const truncateText = (text, maxLength = 20) => {
    if (!text) return 'N/A';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
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

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6 p-3 sm:p-6">
        <div className="flex flex-row justify-end gap-2 mb-4 -mt-3">
          <Button
            variant="outline"
            onClick={() => setPriceCalculatorOpen(true)}
            className="flex-1 sm:flex-none"
          >
            <span className="flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 sm:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className={isMobile ? "hidden sm:inline" : ""}>Calculate Price</span>
              <span className={isMobile ? "inline sm:hidden" : "hidden"}>Price</span>
            </span>
          </Button>
          <Button 
            onClick={() => setCreateShipmentDialogOpen(true)}
            className="flex-1 sm:flex-none"
          >
            <span className="flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 sm:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className={isMobile ? "hidden sm:inline" : ""}>Create New Shipment</span>
              <span className={isMobile ? "inline sm:hidden" : "hidden"}>New</span>
            </span>
          </Button>
        </div>

        {activeOrderId && (
          <TimelineTracker
            orders={shipments}
            activeTrackingId={activeOrderId}
            setActiveTrackingId={setActiveOrderId}
          />
        )}

        <Card>
          <CardHeader className="flex flex-col md:flex-row justify-between">
            <CardTitle className="mb-3 md:mb-0">Shipment List</CardTitle>
            <div className="flex flex-wrap gap-2 justify-end ">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFiltersDialogOpen(true)}
                  className={`${activeFilters.status || activeFilters.category ? "border-purple-500 text-purple-500 hover:text-purple-600" : ""} h-9 flex-grow sm:flex-grow-0`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  {activeFilters.status || activeFilters.category ?
                    `Filters (${[activeFilters.status, activeFilters.category].filter(Boolean).length})` :
                    "Filter"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDateRangeDialogOpen(true)}
                  className={`${customDateRange ? "border-blue-500 text-blue-500 hover:text-blue-600" : ""} h-9 flex-grow sm:flex-grow-0`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {customDateRange ? "Date Range Active" : "Date Range"}
                </Button>
              </div>
              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger className="w-auto h-9 flex-grow-0">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-1">
                    <path d="M3 7H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M6 12H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M10 17H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
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
              <TabsList className="mb-4 w-full overflow-x-auto flex no-scrollbar">
                <TabsTrigger value="all" className="flex-1 whitespace-nowrap">All</TabsTrigger>
                <TabsTrigger value="transit" className="flex-1 whitespace-nowrap">In Transit</TabsTrigger>
                <TabsTrigger value="delivered" className="flex-1 whitespace-nowrap">Delivered</TabsTrigger>
                <TabsTrigger value="canceled" className="flex-1 whitespace-nowrap">Canceled</TabsTrigger>
              </TabsList>

              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em]" role="status">
                    <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
                  </div>
                  <div className="mt-2">Loading shipments...</div>
                </div>
              ) : filteredShipments.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <p className="mt-2 text-gray-500">No shipments found</p>
                </div>
              ) : (
                <>
                  {/* Table view for tablet/desktop */}
                  <div className="hidden sm:block">
                    <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                      <Table className="min-w-full">
                        <TableHeader>
                          <TableRow>
                            <TableHead className="uppercase text-xs font-medium text-gray-500 whitespace-nowrap">Order ID</TableHead>
                            <TableHead className="uppercase text-xs font-medium text-gray-500 whitespace-nowrap">Date</TableHead>
                            <TableHead className="uppercase text-xs font-medium text-gray-500 whitespace-nowrap">From</TableHead>
                            <TableHead className="uppercase text-xs font-medium text-gray-500 whitespace-nowrap">To</TableHead>
                            <TableHead className="uppercase text-xs font-medium text-gray-500 whitespace-nowrap">Status</TableHead>
                            <TableHead className="text-right uppercase text-xs font-medium text-gray-500 whitespace-nowrap">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredShipments.map(order => (
                            <TableRow
                              key={order.id || order.orderId}
                              className="cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-all"
                              onClick={() => handleOpenDetails(order)}
                            >
                              <TableCell className="font-medium whitespace-nowrap">{order.orderId || order.id}</TableCell>
                              <TableCell className="whitespace-nowrap">{formatDate(order.timestamp || order.created)}</TableCell>
                              <TableCell className="max-w-[120px] md:max-w-[180px] truncate">{order.origin || "N/A"}</TableCell>
                              <TableCell className="max-w-[120px] md:max-w-[180px] truncate">{order.destination || "N/A"}</TableCell>
                              <TableCell>
                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusClass(order.status)}`}>
                                  {order.status}
                                </span>
                              </TableCell>
                              <TableCell className="text-right whitespace-nowrap">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="hover:bg-gray-50 active:bg-gray-100"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveOrderId(order.orderId || order.id);
                                    handleOpenDetails(order, "tracking");
                                  }}
                                >
                                  <span className="flex items-center">
                                    <svg className="w-3.5 h-3.5 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
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
                  
                  <style>{`
                    .no-scrollbar::-webkit-scrollbar {
                      display: none;
                    }
                    .no-scrollbar {
                      -ms-overflow-style: none;  /* IE and Edge */
                      scrollbar-width: none;  /* Firefox */
                    }
                  `}</style>
                  
                  {/* Card view for mobile */}
                  <div className="block sm:hidden">
                    <div className="space-y-3">
                      {filteredShipments.map(order => (
                        <div 
                          key={order.id || order.orderId} 
                          className="p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md active:bg-gray-50 transition-all cursor-pointer"
                          onClick={() => handleOpenDetails(order)}
                        >
                          <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <div className="font-semibold text-base">#{order.orderId || order.id}</div>
                            </div>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusClass(order.status)}`}>
                              {order.status}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                            <div>
                              <div className="text-gray-500 text-xs uppercase font-medium mb-0.5">Date</div>
                              <div className="line-clamp-1 font-medium">{formatDate(order.timestamp || order.created, true)}</div>
                            </div>
                            <div>
                              <div className="text-gray-500 text-xs uppercase font-medium mb-0.5">From</div>
                              <div className="line-clamp-1">{truncateText(order.origin, 18) || "N/A"}</div>
                            </div>
                            <div>
                              <div className="text-gray-500 text-xs uppercase font-medium mb-0.5">To</div>
                              <div className="line-clamp-1">{truncateText(order.destination, 18) || "N/A"}</div>
                            </div>
                          </div>
                          
                          <div className="flex justify-end items-center mt-2">
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="shadow-sm hover:shadow hover:bg-gray-50 active:bg-gray-100 transition-all h-8"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveOrderId(order.orderId || order.id);
                                  handleOpenDetails(order, "tracking");
                                }}
                              >
                                <span className="flex items-center justify-center">
                                  <svg className="w-3.5 h-3.5 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                  </svg>
                                  Track
                                </span>
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="hover:bg-gray-50 active:bg-gray-100 transition-all h-8"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenDetails(order, "details");
                                }}
                              >
                                <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className={`${isMobile ? 'w-[95vw] max-w-[95vw] p-4' : 'min-w-3xl'} max-h-[90vh] overflow-y-auto`}>
          <DialogHeader className={isMobile ? 'mb-3 space-y-1' : ''}>
            <DialogTitle className={isMobile ? 'text-xl' : ''}>Shipment Details</DialogTitle>
            <DialogDescription className={isMobile ? 'text-sm' : ''}>
              Complete information about this shipment
            </DialogDescription>
          </DialogHeader>
          {selectedShipment && (
            <ShipmentDetails
              shipment={{ ...selectedShipment, initialTab: undefined }}
              initialTab={selectedShipment.initialTab}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={priceCalculatorOpen} onOpenChange={setPriceCalculatorOpen}>
        <DialogContent className={`${isMobile ? 'w-[95vw] max-w-[95vw] p-4' : 'max-w-md'}`}>
          <DialogHeader className={isMobile ? 'mb-2 space-y-1' : ''}>
            <DialogTitle className={isMobile ? 'text-xl' : ''}>Calculate Shipping Price</DialogTitle>
            <DialogDescription className={isMobile ? 'text-sm' : ''}>
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
