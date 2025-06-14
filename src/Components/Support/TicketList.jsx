import React from 'react';
import { format, formatDistanceToNow } from 'date-fns';

function TicketList({ tickets, isLoading, onSelectTicket, newTicketNumber = null }) {
  const formatDate = (date) => {
    if (!date) return 'No date';
    try {
      // Handle Firestore Timestamp objects
      if (date && typeof date === 'object' && date.seconds) {
        // Convert Firestore Timestamp to milliseconds
        return format(new Date(date.seconds * 1000), 'MMM d, yyyy');
      } 
      // Handle Date objects or valid date strings
      else if (date instanceof Date || !isNaN(new Date(date).getTime())) {
        return format(new Date(date), 'MMM d, yyyy');
      }
      // Return placeholder for invalid dates
      return 'Invalid date';
    } catch (error) {
      console.error("Error formatting date:", error, "Value:", date);
      return 'Invalid date';
    }
  };

  const formatTimeAgo = (date) => {
    if (!date) return 'N/A';
    try {
      // Handle Firestore Timestamp objects
      if (date && typeof date === 'object' && date.seconds) {
        // Convert Firestore Timestamp to milliseconds
        return formatDistanceToNow(new Date(date.seconds * 1000), { addSuffix: true });
      }
      // Handle Date objects or valid date strings
      else if (date instanceof Date || !isNaN(new Date(date).getTime())) {
        return formatDistanceToNow(new Date(date), { addSuffix: true });
      }
      // Return placeholder for invalid dates
      return 'Recently';
    } catch (error) {
      console.error("Error formatting relative time:", error, "Value:", date);
      return 'Recently';
    }
  };

  const getStatusBadgeClass = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800'; // Handle undefined/null status
    
    switch (status.toLowerCase()) {
      case 'open':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-4 border-t-blue-500 border-r-blue-500 border-b-transparent border-l-transparent mb-4"></div>
        <p className="text-sm sm:text-base text-gray-600">Loading your tickets...</p>
      </div>
    );
  }

  if (tickets.length === 0 && !newTicketNumber) {
    return (
      <div className="p-4 sm:p-6 text-center">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto text-gray-400 mb-3 sm:w-48 sm:h-48">
          <path d="M8 2V5" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M16 2V5" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M3.5 9.09H20.5" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 3.5 8 3.5H16C19.5 3.5 21 5.5 21 8.5Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <h3 className="text-base sm:text-lg font-medium mb-1 sm:mb-2">No tickets found</h3>
        <p className="text-sm sm:text-base text-gray-500">
          You haven't submitted any support tickets yet.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y">
      {newTicketNumber && (
        <div className="p-3 sm:p-4 border-b hover:bg-gray-50 cursor-pointer" onClick={() => onSelectTicket(newTicketNumber)}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
            <div>
              <span className="text-xs sm:text-sm text-gray-500">#{newTicketNumber}</span>
              <h4 className="text-sm sm:text-base font-medium">Recent submission</h4>
              <span className={`inline-block px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 mt-1`}>
                Pending
              </span>
            </div>
            <div className="mt-2 sm:mt-0 text-xs sm:text-sm text-gray-500">
              Created just now
            </div>
          </div>
        </div>
      )}

      {tickets.map((ticket) => (
        <div 
          key={ticket.id} 
          className="p-3 sm:p-4 hover:bg-gray-50 cursor-pointer"
          onClick={() => onSelectTicket(ticket.id)}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
            <div className="flex-grow">
              <span className="text-xs sm:text-sm text-gray-500">#{ticket.id}</span>
              <h4 className="text-sm sm:text-base font-medium truncate max-w-[250px] sm:max-w-md">{ticket.subject || 'Untitled Ticket'}</h4>
              <div className="flex flex-wrap gap-1 sm:gap-2 mt-1">
                <span className={`inline-block px-2 py-0.5 sm:py-1 text-xs rounded-full ${getStatusBadgeClass(ticket.status)}`}>
                  {ticket.status ? ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1) : 'Unknown'}
                </span>
                {ticket.priority && typeof ticket.priority === 'string' && (
                  <span className="inline-block px-2 py-0.5 sm:py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                    {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                  </span>
                )}
                {(!ticket.priority || typeof ticket.priority !== 'string') && (
                  <span className="inline-block px-2 py-0.5 sm:py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                    Normal
                  </span>
                )}
              </div>
            </div>
            <div className="mt-2 sm:mt-0 text-left sm:text-right flex flex-row sm:flex-col justify-between sm:justify-normal sm:min-w-[120px]">
              <div className="text-xs sm:text-sm text-gray-700">{formatDate(ticket.createdAt)}</div>
              <div className="text-xs text-gray-500">
                {ticket.lastUpdated ? `Updated ${formatTimeAgo(ticket.lastUpdated)}` : 'No updates yet'}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default TicketList;
