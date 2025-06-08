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
import { Calendar } from "../ui/calendar"; // Import the Calendar component
import { format, addDays } from "date-fns"; // Make sure date-fns is installed
import { toast } from "sonner";

const DateRangeDialog = ({ open, onOpenChange, onDateRangeChange }) => {
  const [date, setDate] = useState({
    from: new Date(),
    to: addDays(new Date(), 7), // Default to a week range
  });
  
  // Reset date selection when dialog opens
  useEffect(() => {
    if (open) {
      const today = new Date();
      setDate({
        from: today,
        to: addDays(today, 7)
      });
    }
  }, [open]);

  const handleApply = () => {
    if (date && date.from) {
      // Ensure we have both start and end dates
      if (!date.to) {
        // If only start date is selected, use it as both start and end
        const startDate = new Date(date.from);
        startDate.setHours(0, 0, 0, 0);
        
        const endDate = new Date(date.from);
        endDate.setHours(23, 59, 59, 999);
        
        console.log("Applying single-day date range:", {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        });
        
        onDateRangeChange({ 
          startDate: startDate, 
          endDate: endDate 
        });
        onOpenChange(false);
        return;
      }
      
      // Create copies of dates and set time to beginning/end of day for proper filtering
      const startDate = new Date(date.from);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(date.to);
      endDate.setHours(23, 59, 59, 999);
      
      console.log("Applying date range:", {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });
      
      onDateRangeChange({ 
        startDate: startDate, 
        endDate: endDate 
      });
      onOpenChange(false);
    } else {
      console.warn("No start date selected");
      // Use current date as fallback
      const currentDate = new Date();
      const startDate = new Date(currentDate);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(currentDate);
      endDate.setHours(23, 59, 59, 999);
      
      onDateRangeChange({ 
        startDate: startDate, 
        endDate: endDate 
      });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Select Date Range</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center py-2">
          <Calendar
            mode="range"
            defaultMonth={date?.from || new Date()}
            selected={date}
            onSelect={setDate}
            numberOfMonths={1}
            className="mx-auto"
          />
        </div>
        
        <div className="flex justify-between items-center border-t pt-4">
          <div>
            <p className="text-sm text-muted-foreground">Start date</p>
            <p className="text-sm font-medium">
              {date?.from ? format(date.from, "PPP") : "Pick a date"}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">End date</p>
            <p className="text-sm font-medium">
              {date?.to ? format(date.to, "PPP") : "Pick a date"}
            </p>
          </div>
        </div>
        
        <DialogFooter className="flex justify-between pt-4">
          <Button 
            variant="outline" 
            onClick={() => {
              onDateRangeChange(null); // Clear the date filter
              onOpenChange(false);
              toast.success("Date filter cleared");
            }}>
            Reset
          </Button>
          <div className="space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleApply}>Apply</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DateRangeDialog;
