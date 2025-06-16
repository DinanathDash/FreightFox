import { useState, useEffect } from 'react';
import DashboardLayout from '../../Components/Dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from "../../Components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../Components/ui/table";
import { Button } from "../../Components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../Components/ui/select";
import SimpleTracker from '../../Components/Shipment/SimpleTracker.jsx';
import { getAllOrders, getDashboardStats, getOrdersByDateRange } from '../../Firebase/shared/services.js';
import { getTotalShipmentsChartData, getDeliveredShipmentsChartData, getWeeklyChangeStats } from '../../Firebase/development/statsService.js';
import DateRangeDialog from '../../Components/Dashboard/DateRangeDialog';
import FiltersDialog from '../../Components/Dashboard/FiltersDialog';
import StatsCard from './StatsCard';

function DashboardPage() {
  const [activeFilter, setActiveFilter] = useState("12 months");
  const [activeOrderId, setActiveOrderId] = useState("");
  const [shipments, setShipments] = useState([]);
  const [filteredShipments, setFilteredShipments] = useState([]);
  const [stats, setStats] = useState({
    totalShipments: 0,
    totalOrders: 0,
    revenue: 0,
    delivered: 0
  });
  const [chartData, setChartData] = useState({
    totalShipments: [],
    delivered: []
  });
  const [weeklyChange, setWeeklyChange] = useState({
    totalChange: 0,
    deliveredChange: 0
  });
  const [loading, setLoading] = useState(true);
  const [dateRangeDialogOpen, setDateRangeDialogOpen] = useState(false);
  const [filtersDialogOpen, setFiltersDialogOpen] = useState(false);
  const [customDateRange, setCustomDateRange] = useState(null);
  const [activeFilters, setActiveFilters] = useState({ status: null, category: null });
  const [shippingListFilter, setShippingListFilter] = useState("all"); // 'all', '7d', 'custom'
  const [sortOrder, setSortOrder] = useState("latest"); // 'latest', 'oldest', 'status'

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
        setFilteredShipments(orders);

        // Get dashboard statistics
        const dashboardStats = await getDashboardStats(activeFilter);
        setStats(dashboardStats);

        // Fetch chart data for both stats cards
        const [totalShipmentsData, deliveredShipmentsData, changeStats] = await Promise.all([
          getTotalShipmentsChartData(7),
          getDeliveredShipmentsChartData(7),
          getWeeklyChangeStats()
        ]);

        setChartData({
          totalShipments: totalShipmentsData,
          delivered: deliveredShipmentsData
        });

        setWeeklyChange(changeStats);

        // Set active order ID for tracking
        if (orders.length > 0) {
          setActiveOrderId(orders[0].orderId || orders[0].id);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeFilter]);

  // Handle custom date range filtering
  useEffect(() => {
    const applyDateRangeFilter = async () => {
      if (!customDateRange) return;

      setLoading(true);
      try {
        const { startDate, endDate } = customDateRange;
        // Get orders for the specified date range
        const orders = await getOrdersByDateRange(null, startDate, endDate);
        setShipments(orders);
        setFilteredShipments(orders);

        // Calculate statistics for this date range
        const stats = {
          totalShipments: orders.length,
          totalOrders: orders.length,
          revenue: orders.reduce((sum, order) => sum + (order.cost?.totalAmount || 0), 0),
          delivered: orders.filter(order => order.status === 'Delivered').length
        };
        setStats(stats);

        // Fetch updated chart data too
        const [totalShipmentsData, deliveredShipmentsData, changeStats] = await Promise.all([
          getTotalShipmentsChartData(7),
          getDeliveredShipmentsChartData(7),
          getWeeklyChangeStats()
        ]);

        setChartData({
          totalShipments: totalShipmentsData,
          delivered: deliveredShipmentsData
        });

        setWeeklyChange(changeStats);

      } catch (error) {
        console.error("Error fetching orders by date range:", error);
      } finally {
        setLoading(false);
      }
    };

    if (customDateRange) {
      applyDateRangeFilter();
    }
  }, [customDateRange]);

  // Apply filters to shipping list
  useEffect(() => {
    if (!shipments.length) return;

    let filtered = [...shipments];

    // Apply shipping list filter (7d)
    if (shippingListFilter === '7d') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      filtered = filtered.filter(shipment => {
        const createdAt = shipment.createdAt?.toDate?.() ||
          (shipment.createdAt instanceof Date ? shipment.createdAt : new Date());
        return createdAt >= sevenDaysAgo;
      });
    }

    // Apply additional filters (status, category)
    if (activeFilters.status?.length) {
      filtered = filtered.filter(shipment =>
        activeFilters.status.includes(shipment.status)
      );
    }

    if (activeFilters.category?.length) {
      filtered = filtered.filter(shipment => {
        const category = shipment.packageDetails?.category || shipment.category;
        return activeFilters.category.includes(category);
      });
    }

    // Apply sorting
    switch (sortOrder) {
      case 'oldest':
        filtered.sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
          const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
          return dateA - dateB;
        });
        break;
      case 'status':
        filtered.sort((a, b) => {
          const statusOrder = { 'Delivered': 1, 'Shipping': 2, 'Processing': 3, 'Pending': 4, 'Cancelled': 5 };
          return (statusOrder[a.status] || 99) - (statusOrder[b.status] || 99);
        });
        break;
      case 'latest':
      default:
        filtered.sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
          const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
          return dateB - dateA;
        });
    }

    setFilteredShipments(filtered);
  }, [shipments, shippingListFilter, activeFilters, sortOrder]);

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

  // Handler for date range dialog
  const handleDateRangeApply = (dateRange) => {
    // dateRange is already in the format { startDate, endDate }
    setCustomDateRange(dateRange);
    // Reset the active filter since we're now using a custom date range
    setActiveFilter(null);
  };

  // Handler for filters dialog
  const handleFiltersApply = (filters) => {
    setActiveFilters(filters);
  };

  // Handler for Last 7d button
  const handleLast7dClick = () => {
    setShippingListFilter(shippingListFilter === '7d' ? 'all' : '7d');
  };

  // Handler for sort order
  const handleSortOrderChange = (order) => {
    setSortOrder(order);
  };

  return (
    <DashboardLayout>
      {/* Header with Welcome message and filter controls */}
      <div className="flex flex-col space-y-3 px-2 sm:px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          {/* Filter selection grid for better mobile layout */}
          <div className="w-full md:w-auto pb-2 md:pb-0">
            <div className="grid grid-cols-2 sm:flex sm:flex-row gap-2 sm:gap-3">
              {filterOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => setActiveFilter(option)}
                  className={`px-3 py-1.5 text-sm text-center whitespace-nowrap ${activeFilter === option
                    ? "bg-blue-50 text-blue-800 border-blue-100"
                    : "bg-white text-gray-700 border-gray-100"
                    } border rounded-md`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
          <div className='flex items-center space-x-2 w-full md:w-auto justify-between sm:justify-end'>
            <Button
              variant="outline"
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1 text-xs sm:text-sm sm:gap-2"
              onClick={() => setDateRangeDialogOpen(true)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
                <path d="M8 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M16 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M3 10H21" stroke="currentColor" strokeWidth="2" />
              </svg>
              <span className="hidden sm:inline">Select Dates</span>
              <span className="sm:hidden">Dates</span>
            </Button>
            <Button
              variant="outline"
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1 text-xs sm:text-sm sm:gap-2"
              onClick={() => setFiltersDialogOpen(true)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 7H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M6 12H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M10 17H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Filters
            </Button>
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {/* Stats Cards with Charts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-4 mt-2">
            {/* Total Shipments */}
            <StatsCard
              title="Total Shipments"
              value={loading ? "..." : stats.totalShipments.toLocaleString()}
              change={weeklyChange.totalChange}
              chartData={chartData.totalShipments}
              type="line"
              color="blue"
              icon={
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 6V8.42C22 10 21 11 19.42 11H16V4.01C16 2.9 16.91 2 18.02 2C19.11 2.01 20.11 2.45 20.83 3.17C21.55 3.9 22 4.9 22 6Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M2 7V21C2 21.83 2.94 22.3 3.6 21.8L5.31 20.52C5.71 20.22 6.27 20.26 6.63 20.62L8.29 22.29C8.68 22.68 9.32 22.68 9.71 22.29L11.39 20.61C11.74 20.26 12.3 20.22 12.69 20.52L14.4 21.8C15.06 22.29 16 21.82 16 21V4C16 2.9 16.9 2 18 2H7H6C3 2 2 3.79 2 6V7Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              }
            />

            {/* Delivered */}
            <StatsCard
              title="Delivered"
              value={loading ? "..." : stats.delivered.toLocaleString()}
              change={weeklyChange.deliveredChange}
              chartData={chartData.delivered}
              type="bar"
              color="green"
              icon={
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2.5 13.24V11.51C2.5 9.44001 4.18999 7.75 6.25999 7.75H17.74C19.81 7.75 21.5 9.44001 21.5 11.51V12.95H19.48C18.92 12.95 18.41 13.17 18.04 13.55C17.62 13.96 17.38 14.55 17.44 15.18C17.53 16.26 18.52 17.05 19.6 17.05H21.5V18.24C21.5 20.31 19.81 22 17.74 22H12.26" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M2.5 12.41V7.84004C2.5 6.65004 3.23 5.59 4.34 5.17L12.28 2.17C13.52 1.7 14.85 2.62003 14.85 3.95003V7.75002" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M22.5588 13.9702V16.0302C22.5588 16.5802 22.1188 17.0302 21.5588 17.0502H19.5988C18.5188 17.0502 17.5288 16.2602 17.4388 15.1802C17.3788 14.5502 17.6188 13.9602 18.0388 13.5502C18.4088 13.1702 18.9188 12.9502 19.4788 12.9502H21.5588C22.1188 12.9702 22.5588 13.4202 22.5588 13.9702Z" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M7 12H14" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              }
            />
          </div>
          {/* Tracking Progress */}
          <div className="grid grid-cols-1 gap-4 mt-2">
            {/* Use our SimpleTracker component with tracking data */}
            <SimpleTracker
              orders={filteredShipments}
              activeTrackingId={activeOrderId}
              setActiveTrackingId={setActiveOrderId}
            />
          </div>
        </div>

        {/* Shipping List Section */}
        <div className="grid grid-cols-1 gap-4 mt-2">
          {/* Shipping List (full width) */}
          <div className="col-span-full">
            <Card>
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2">
                <CardTitle>Shipping List</CardTitle>
                <div className="flex space-x-2 w-full sm:w-auto justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    className={`flex items-center gap-1 text-xs h-9 ${shippingListFilter === '7d' ? 'bg-blue-50 text-blue-800 border-blue-200' : ''}`}
                    onClick={handleLast7dClick}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
                      <path d="M8 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <path d="M16 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <path d="M3 10H21" stroke="currentColor" strokeWidth="2" />
                    </svg>
                    Last 7d
                  </Button>
                  <Select value={sortOrder} onValueChange={handleSortOrderChange}>
                    <SelectTrigger className="h-8 text-xs border bg-white">
                      <div className="flex items-center gap-1">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M3 7H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          <path d="M6 12H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          <path d="M10 17H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        <span className="truncate max-w-[100px]">Sort: {sortOrder === 'latest' ? 'Latest' : sortOrder === 'oldest' ? 'Oldest' : 'Status'}</span>
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="latest">Latest</SelectItem>
                      <SelectItem value="oldest">Oldest</SelectItem>
                      <SelectItem value="status">Status</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {/* Table view for tablet and desktop */}
                <div className="hidden sm:block">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-gray-50">
                        <TableRow>
                          <TableHead className="uppercase text-xs font-medium text-gray-500">ORDER ID</TableHead>
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
                        ) : filteredShipments.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-4">No orders found</TableCell>
                          </TableRow>
                        ) : (
                          filteredShipments.map((shipment, index) => (
                            <TableRow key={index} className="hover:bg-gray-50">
                              <TableCell className="font-medium text-sm whitespace-nowrap">{`#${shipment.orderId || shipment.id}`}</TableCell>
                              <TableCell className="text-sm">
                                <div className="line-clamp-1">{shipment.packageDetails?.category || shipment.category}</div>
                                {shipment.packageDetails &&
                                  <div className="text-xs text-gray-500">
                                    {shipment.packageDetails.size} • {shipment.packageDetails.weight} kg
                                  </div>
                                }
                              </TableCell>
                              <TableCell className="text-sm">
                                <div className="line-clamp-1">
                                  {shipment.shipping?.estimatedArrivalDate ?
                                    shipment.shipping.arrivalDateString :
                                    shipment.arrival}
                                </div>
                                {shipment.shipping &&
                                  <div className="text-xs text-gray-500">
                                    {shipment.shipping.estimatedDeliveryDays} days
                                  </div>
                                }
                              </TableCell>
                              <TableCell className="text-sm">
                                <div className="line-clamp-1">
                                  {shipment.route ||
                                    (shipment.shipping &&
                                      `${shipment.shipping.source.city} → ${shipment.shipping.destination.city}`)}
                                </div>
                                {shipment.shipping &&
                                  <div className="text-xs text-gray-500">
                                    {shipment.shipping.distance} km
                                  </div>
                                }
                              </TableCell>
                              <TableCell>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${shipment.status === 'Delivered' ? 'bg-green-100 text-green-800' :
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
                  </div>
                </div>

                {/* Card view for mobile */}
                <div className="block sm:hidden">
                  {loading ? (
                    <div className="text-center py-4">Loading...</div>
                  ) : filteredShipments.length === 0 ? (
                    <div className="text-center py-4">No orders found</div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {filteredShipments.map((shipment, index) => (
                        <div key={index} className="p-4 hover:bg-gray-50">
                          <div className="flex justify-between items-start mb-2">
                            <div className="font-medium text-base">{`#${shipment.orderId || shipment.id}`}</div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${shipment.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                                shipment.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                                  shipment.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                                    shipment.status === 'Processing' ? 'bg-purple-100 text-purple-800' :
                                      'bg-blue-100 text-blue-800'
                              }`}>
                              {shipment.status}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-y-2 gap-x-2 text-sm">
                            <div>
                              <div className="text-gray-500 text-xs uppercase font-medium">Category</div>
                              <div className="font-medium">{shipment.packageDetails?.category || shipment.category}</div>
                              {shipment.packageDetails && (
                                <div className="text-xs text-gray-500">
                                  {shipment.packageDetails.size} • {shipment.packageDetails.weight} kg
                                </div>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="text-gray-500 text-xs uppercase font-medium">Arrival</div>
                              <div className="font-medium">
                                {shipment.shipping?.estimatedArrivalDate ?
                                  shipment.shipping.arrivalDateString :
                                  shipment.arrival}
                              </div>
                              {shipment.shipping && (
                                <div className="text-xs text-gray-500">
                                  {shipment.shipping.estimatedDeliveryDays} days
                                </div>
                              )}
                            </div>
                            <div className="col-span-2 mt-1">
                              <div className="text-gray-500 text-xs uppercase font-medium">Route</div>
                              <div className="font-medium">
                                {shipment.route ||
                                  (shipment.shipping &&
                                    `${shipment.shipping.source.city} → ${shipment.shipping.destination.city}`)}
                              </div>
                              {shipment.shipping && (
                                <div className="text-xs text-gray-500">
                                  {shipment.shipping.distance} km
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Date Range Dialog */}
      <DateRangeDialog
        open={dateRangeDialogOpen}
        onOpenChange={setDateRangeDialogOpen}
        onDateRangeChange={handleDateRangeApply}
      />

      {/* Filters Dialog */}
      <FiltersDialog
        open={filtersDialogOpen}
        onOpenChange={setFiltersDialogOpen}
        onFiltersChange={handleFiltersApply}
        currentFilters={{}}
      />
    </DashboardLayout>
  );
}

export default DashboardPage;
