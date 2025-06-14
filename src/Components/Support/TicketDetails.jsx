import React, { useState } from 'react';
import { format } from 'date-fns';
import { Button } from "../../Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../Components/ui/card";
import { Textarea } from "../../Components/ui/textarea";

function TicketDetails({ ticket, onClose, onAddReply, inDialog = true }) {
  const [replyMessage, setReplyMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const formatDate = (date) => {
    if (!date) return 'N/A';
    
    try {
      // Handle Firestore Timestamp objects
      if (date && typeof date === 'object' && date.seconds) {
        // Convert Firestore Timestamp to milliseconds
        return format(new Date(date.seconds * 1000), 'MMM d, yyyy h:mm a');
      } 
      // Handle regular Date objects
      else if (date instanceof Date) {
        return format(date, 'MMM d, yyyy h:mm a');
      }
      // Handle ISO string or valid date strings
      else if (typeof date === 'string' && !isNaN(new Date(date).getTime())) {
        return format(new Date(date), 'MMM d, yyyy h:mm a');
      }
      // Handle numeric timestamp (milliseconds since epoch)
      else if (typeof date === 'number') {
        return format(new Date(date), 'MMM d, yyyy h:mm a');
      }
      // If none of the above worked, return a fallback
      return 'Date unavailable';
    } catch (error) {
      console.error("Error formatting date:", error, "Value type:", typeof date, "Value:", date);
      return 'Date unavailable';
    }
  };
  
  const getStatusBadgeClass = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    
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
  
  const getPriorityBadgeClass = (priority) => {
    if (!priority) return 'bg-gray-100 text-gray-800';
    
    switch (priority.toLowerCase()) {
      case 'low':
        return 'bg-gray-100 text-gray-800';
      case 'medium':
        return 'bg-blue-100 text-blue-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'urgent':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const handleSubmitReply = async () => {
    if (!replyMessage.trim()) return;
    
    setIsSubmitting(true);
    try {
      // Create a reply object, the timestamp will be set in the addTicketReply function
      const reply = {
        message: replyMessage,
        sender: 'user'
      };
      
      await onAddReply(ticket.id, reply);
      setReplyMessage('');
    } catch (error) {
      console.error("Error submitting reply:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // If ticket is not available
  if (!ticket) {
    if (inDialog) {
      return (
        <div className="text-center p-3 sm:p-6">
          <p className="text-sm sm:text-base">Ticket not found or still loading...</p>
          <Button onClick={onClose} className="mt-3 sm:mt-4 text-sm">Back to tickets</Button>
        </div>
      );
    } else {
      return (
        <Card>
          <CardContent className="p-3 sm:p-6 text-center">
            <p className="text-sm sm:text-base">Ticket not found or still loading...</p>
            <Button onClick={onClose} className="mt-3 sm:mt-4 text-sm">Back to tickets</Button>
          </CardContent>
        </Card>
      );
    }
  }
  
  // Content for the ticket details
  const TicketContent = () => (
    <>
      <div className={`border-b pb-3 sm:pb-4 px-4 sm:px-6 py-3 sm:py-4 ${inDialog ? '' : 'mb-0'}`}>
        <div className="flex justify-between items-start sm:items-center">
          <div className="pr-8">
            <span className="text-xs sm:text-sm text-gray-500 mb-1 block">#{ticket.id}</span>
            <h2 className="text-base sm:text-xl font-semibold break-words">{ticket.subject}</h2>
          </div>
          <Button variant="ghost" onClick={onClose} className="ml-auto -mt-1 h-8 w-8 sm:h-10 sm:w-10 p-0">
            <svg width="18" height="18" className="sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Button>
        </div>
        <div className="flex flex-wrap gap-1 sm:gap-2 mt-2">
          <span className={`inline-block px-2 py-0.5 sm:py-1 text-xs rounded-full ${getStatusBadgeClass(ticket.status || '')}`}>
            {ticket.status ? ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1) : 'Unknown'}
          </span>
          <span className={`inline-block px-2 py-0.5 sm:py-1 text-xs rounded-full ${getPriorityBadgeClass(ticket.priority || '')}`}>
            {ticket.priority ? ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1) : 'Normal'} Priority
          </span>
          <span className="inline-block px-2 py-0.5 sm:py-1 text-xs rounded-full bg-gray-100 text-gray-800">
            {ticket.category ? ticket.category.charAt(0).toUpperCase() + ticket.category.slice(1).replace('-', ' ') : 'Other'}
          </span>
        </div>
        <div className="text-xs sm:text-sm text-gray-500 mt-2">
          <span className="block sm:inline">Created: {formatDate(ticket.createdAt || ticket.timestamp || ticket.created)}</span> 
          <span className="hidden sm:inline"> • </span>
          <span className="block sm:inline">Last updated: {formatDate(ticket.lastUpdated || ticket.updatedAt || ticket.createdAt || ticket.timestamp)}</span>
        </div>
      </div>
      
      <div className="p-0">
        <div className="p-3 sm:p-4 bg-gray-50 border-b">
          <h3 className="font-semibold text-sm sm:text-base mb-0 sm:mb-2">Conversation</h3>
        </div>
        
        <div className="divide-y max-h-[40vh] sm:max-h-[50vh] overflow-y-auto px-3 sm:px-4">
          {/* Initial ticket message */}
          <div className="py-3 sm:py-4">
            <div className="flex items-center mb-1 sm:mb-2">
              <div className="bg-blue-100 rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-blue-700 mr-2 sm:mr-3">
                {ticket.userName ? ticket.userName.charAt(0).toUpperCase() : 'Y'}
              </div>
              <div>
                <p className="font-medium text-sm sm:text-base">{ticket.userName || 'You'}</p>
                <span className="text-xs text-gray-500">{formatDate(ticket.createdAt || ticket.timestamp || ticket.created)}</span>
              </div>
            </div>
            <div className="pl-8 sm:pl-11">
              <p className="text-xs sm:text-sm text-gray-700">{ticket.message || 'No initial message provided.'}</p>
            </div>
          </div>
          
          {/* Replies */}
          {ticket.replies && ticket.replies.length > 0 && ticket.replies.map((reply, index) => (
            <div key={reply.id || `reply-${index}`} className="py-3 sm:py-4">
              <div className="flex items-center mb-1 sm:mb-2">
                {reply.sender === 'support' ? (
                  <div className="bg-green-100 rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-green-700 mr-2 sm:mr-3">
                    S
                  </div>
                ) : (
                  <div className="bg-blue-100 rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-blue-700 mr-2 sm:mr-3">
                    {ticket.userName ? ticket.userName.charAt(0).toUpperCase() : 'Y'}
                  </div>
                )}
                <div>
                  <p className="font-medium text-sm sm:text-base">
                    {reply.sender === 'support' ? 'Support Agent' : (ticket.userName || 'You')}
                  </p>
                  <span className="text-xs text-gray-500">{formatDate(reply.timestamp)}</span>
                </div>
              </div>
              <div className="pl-8 sm:pl-11">
                <p className="text-xs sm:text-sm text-gray-700">{reply.message}</p>
              </div>
            </div>
          ))}
        </div>
        
        {/* Reply form */}
        <div className="p-3 sm:p-4 border-t">
          <h4 className="font-medium text-sm sm:text-base mb-2">Add a reply</h4>
          <Textarea 
            placeholder="Type your message here..." 
            className="min-h-[80px] sm:min-h-[100px] mb-3 text-sm"
            value={replyMessage}
            onChange={(e) => setReplyMessage(e.target.value)}
          />
          <div className="flex justify-end">
            <Button 
              onClick={handleSubmitReply} 
              disabled={!replyMessage.trim() || isSubmitting}
              className="text-xs sm:text-sm"
            >
              {isSubmitting ? 'Sending...' : 'Send Reply'}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
  
  // Render with or without Card wrapper based on inDialog prop
  return inDialog ? (
    <div className="w-full bg-white">
      <TicketContent />
    </div>
  ) : (
    <Card className="w-full">
      <CardHeader className="p-0">
        <TicketContent />
      </CardHeader>
    </Card>
  );
}

export default TicketDetails;
