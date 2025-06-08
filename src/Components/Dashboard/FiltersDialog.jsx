import React, { useState } from 'react';
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

const FiltersDialog = ({ open, onClose, onApply }) => {
  const [statusFilters, setStatusFilters] = useState({
    Pending: false,
    Processing: false,
    Shipping: false,
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

  const handleStatusChange = (status) => {
    setStatusFilters((prev) => ({
      ...prev,
      [status]: !prev[status],
    }));
  };

  const handleCategoryChange = (category) => {
    setCategoryFilters((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const handleApply = () => {
    const activeStatusFilters = Object.entries(statusFilters)
      .filter(([_, isChecked]) => isChecked)
      .map(([status]) => status);

    const activeCategoryFilters = Object.entries(categoryFilters)
      .filter(([_, isChecked]) => isChecked)
      .map(([category]) => category);

    onApply({
      status: activeStatusFilters.length > 0 ? activeStatusFilters : null,
      category: activeCategoryFilters.length > 0 ? activeCategoryFilters : null,
    });
    
    onClose();
  };

  const handleReset = () => {
    setStatusFilters({
      Pending: false,
      Processing: false,
      Shipping: false,
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
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Filter Orders</DialogTitle>
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
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleApply}>Apply</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FiltersDialog;
