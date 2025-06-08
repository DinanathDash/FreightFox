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
import { Calendar } from "../ui/calendar"; // Import the Calendar component
import { format } from "date-fns"; // Make sure date-fns is installed

const DateRangeDialog = ({ open, onClose, onApply }) => {
  const [date, setDate] = useState({
    from: new Date(),
    to: new Date(),
  });

  const handleApply = () => {
    if (date && date.from) {
      onApply(date.from, date.to || date.from);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Select Date Range</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col space-y-2 p-2">
            <div className="grid gap-2">
              <div className="flex flex-col space-y-1.5">
                <div className="flex justify-center">
                  <Calendar
                    mode="range"
                    defaultMonth={date?.from || new Date()}
                    selected={date}
                    onSelect={(newDate) => setDate(newDate || { from: new Date(), to: new Date() })}
                    numberOfMonths={1}
                    className="rounded-md border shadow"
                  />
                </div>
              </div>
            </div>
            {date && date.from && (
              <div className="flex items-center justify-center gap-2 text-sm">
                <div className="py-1 px-2 rounded bg-blue-50 text-blue-800">
                  {format(date.from, "PPP")}
                </div>
                <span>to</span>
                <div className="py-1 px-2 rounded bg-blue-50 text-blue-800">
                  {date.to ? format(date.to, "PPP") : format(date.from, "PPP")}
                </div>
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleApply}>Apply</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DateRangeDialog;
