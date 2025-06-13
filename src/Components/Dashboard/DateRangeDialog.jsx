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
  const [isMobile, setIsMobile] = useState(false);
  
  // Detect mobile screens
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);
  
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
      
      onDateRangeChange({ 
        startDate: startDate, 
        endDate: endDate 
      });
      onOpenChange(false);
    } else {
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
      <DialogContent className={`${isMobile ? 'max-w-[95vw] p-3' : 'sm:max-w-[400px] p-4'}`}>
        <DialogHeader className="pb-1">
          <DialogTitle>Select Date Range</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center -mb-16 sm:-mb-0">
          <Calendar
            mode="range"
            defaultMonth={date?.from || new Date()}
            selected={date}
            onSelect={setDate}
            numberOfMonths={1}
            className={`mx-auto ${isMobile ? 'w-full p-1' : ''}`}
            disabled={(date) => date > new Date(2100, 0, 1) || date < new Date(1900, 0, 1)}
            showOutsideDays={!isMobile}
            fixedWeeks
          />
        </div>
        
        <div className="border-t pt-4 w-full px-0">
          <div className="flex w-full mx-0">
            <div className="pl-0 w-1/2">
              <p className="text-sm text-muted-foreground">Start date</p>
              <p className="text-lg font-medium">
                {date?.from ? format(date.from, "MMM d, yyyy") : "Pick a date"}
              </p>
            </div>
            <div className="pr-0 w-1/2 flex flex-col items-end">
              <p className="text-sm text-muted-foreground">End date</p>
              <p className="text-lg font-medium">
                {date?.to ? format(date.to, "MMM d, yyyy") : "Pick a date"}
              </p>
            </div>
          </div>
        </div>
        
        <DialogFooter className={`flex ${isMobile ? 'flex-col space-y-2' : 'justify-between'} pt-2`}>
          <Button 
            variant="outline" 
            className={isMobile ? 'w-full h-8' : ''}
            onClick={() => {
              onDateRangeChange(null); // Clear the date filter
              onOpenChange(false);
              toast.success("Date filter cleared");
            }}>
            Reset
          </Button>
          <div className={`${isMobile ? 'flex w-full justify-between' : 'space-x-2'}`}>
            <Button 
              variant="outline"
              className={isMobile ? 'flex-1 mr-2 h-8' : ''}
              onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              className={isMobile ? 'flex-1 h-8' : ''}
              onClick={handleApply}>
              Apply
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DateRangeDialog;
