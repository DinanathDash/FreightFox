import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";

const FiltersDialog = ({ open, onOpenChange, onFiltersChange, currentFilters = {} }) => {
  const [statusFilters, setStatusFilters] = useState({
    Pending: false,
    Processing: false,
    Shipped: false,
    "In Transit": false,
    "Out for Delivery": false,
    Delivered: false,
    Cancelled: false,
  });

  const [categoryFilters, setCategoryFilters] = useState({
    Electronics: false,
    Clothing: false,
    Furniture: false,
    Books: false,
    Other: false,
  });

  // Update state when currentFilters change
  useEffect(() => {
    if (currentFilters.status) {
      setStatusFilters(prev => ({
        ...Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: false }), {}),
        [currentFilters.status]: true
      }));
    }
    
    if (currentFilters.category) {
      setCategoryFilters(prev => ({
        ...Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: false }), {}),
        [currentFilters.category]: true
      }));
    }
  }, [currentFilters]);

  const handleStatusChange = (status) => {
    setStatusFilters((prev) => {
      // Create a new object with all values set to false
      const newState = Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: false }), {});
      // Only set the clicked status to its toggled value
      return { ...newState, [status]: !prev[status] };
    });
  };

  const handleCategoryChange = (category) => {
    setCategoryFilters((prev) => {
      // Create a new object with all values set to false
      const newState = Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: false }), {});
      // Only set the clicked category to its toggled value
      return { ...newState, [category]: !prev[category] };
    });
  };

  const handleApply = () => {
    // Get the first selected status and category
    const selectedStatus = Object.entries(statusFilters)
      .find(([_, isChecked]) => isChecked)?.[0] || null;

    const selectedCategory = Object.entries(categoryFilters)
      .find(([_, isChecked]) => isChecked)?.[0] || null;

    onFiltersChange({
      status: selectedStatus,
      category: selectedCategory
    });
    
    onOpenChange(false);
  };

  const handleReset = () => {
    setStatusFilters({
      Pending: false,
      Processing: false,
      Shipped: false,
      "In Transit": false,
      "Out for Delivery": false,
      Delivered: false,
      Cancelled: false,
    });
    
    setCategoryFilters({
      Electronics: false,
      Clothing: false,
      Furniture: false,
      Books: false,
      Other: false,
    });
    
    onFiltersChange({ status: null, category: null });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Filter Shipments</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <h3 className="font-medium text-sm">Status</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(statusFilters).map((status) => (
                <div key={status} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`status-${status}`} 
                    checked={statusFilters[status]}
                    onCheckedChange={() => handleStatusChange(status)}
                  />
                  <label
                    htmlFor={`status-${status}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {status}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-medium text-sm">Category</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(categoryFilters).map((category) => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`category-${category}`} 
                    checked={categoryFilters[category]}
                    onCheckedChange={() => handleCategoryChange(category)}
                  />
                  <label
                    htmlFor={`category-${category}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {category}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={handleReset}>Reset</Button>
          <div className="space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleApply}>Apply</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FiltersDialog;
