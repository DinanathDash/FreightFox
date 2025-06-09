import React, { useState } from 'react';
import { format } from 'date-fns';
import { Button } from "../../Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../Components/ui/card";
import { Textarea } from "../../Components/ui/textarea";

function TicketDetails({ ticket, onClose, onAddReply }) {
  const [replyMessage, setReplyMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const formatDate = (date) => {
    if (!date) return '';
    try {
      return format(new Date(date), 'MMM d, yyyy h:mm a');
    } catch (error) {
      console.error("Error formatting date:", error);
      return '';
    }
  };
  
  const getStatusBadgeClass = (status) => {
    switch (status) {
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
    switch (priority) {
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
      // In a real app, this would send the reply to the API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes: create a reply object
      const reply = {
        id: `reply-${Date.now()}`,
        message: replyMessage,
        sender: 'user',
        timestamp: new Date()
      };
      
      onAddReply(ticket.id, reply);
      setReplyMessage('');
    } catch (error) {
      console.error("Error submitting reply:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // If ticket is not available
  if (!ticket) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p>Ticket not found or still loading...</p>
          <Button onClick={onClose} className="mt-4">Back to tickets</Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="border-b pb-4">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-sm text-gray-500 mb-1 block">#{ticket.id}</span>
            <CardTitle>{ticket.subject}</CardTitle>
          </div>
          <Button variant="ghost" onClick={onClose} className="ml-auto">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(ticket.status)}`}>
            {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
          </span>
          <span className={`inline-block px-2 py-1 text-xs rounded-full ${getPriorityBadgeClass(ticket.priority)}`}>
            {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)} Priority
          </span>
          <span className="inline-block px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
            {ticket.category.charAt(0).toUpperCase() + ticket.category.slice(1).replace('-', ' ')}
          </span>
        </div>
        <div className="text-sm text-gray-500 mt-2">
          Created: {formatDate(ticket.createdAt)} • Last updated: {formatDate(ticket.lastUpdated)}
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="p-4 bg-gray-50 border-b">
          <h3 className="font-semibold mb-2">Conversation</h3>
        </div>
        
        <div className="divide-y max-h-96 overflow-y-auto px-4">
          {/* Initial ticket message */}
          <div className="py-4">
            <div className="flex items-center mb-2">
              <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center text-blue-700 mr-3">
                {ticket.userName ? ticket.userName.charAt(0).toUpperCase() : 'Y'}
              </div>
              <div>
                <p className="font-medium">{ticket.userName || 'You'}</p>
                <span className="text-xs text-gray-500">{formatDate(ticket.createdAt)}</span>
              </div>
            </div>
            <div className="pl-11">
              <p className="text-gray-700">{ticket.message || 'No initial message provided.'}</p>
            </div>
          </div>
          
          {/* Replies */}
          {ticket.replies && ticket.replies.map((reply) => (
            <div key={reply.id} className="py-4">
              <div className="flex items-center mb-2">
                {reply.sender === 'support' ? (
                  <div className="bg-green-100 rounded-full w-8 h-8 flex items-center justify-center text-green-700 mr-3">
                    S
                  </div>
                ) : (
                  <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center text-blue-700 mr-3">
                    {ticket.userName ? ticket.userName.charAt(0).toUpperCase() : 'Y'}
                  </div>
                )}
                <div>
                  <p className="font-medium">
                    {reply.sender === 'support' ? 'Support Agent' : (ticket.userName || 'You')}
                  </p>
                  <span className="text-xs text-gray-500">{formatDate(reply.timestamp)}</span>
                </div>
              </div>
              <div className="pl-11">
                <p className="text-gray-700">{reply.message}</p>
              </div>
            </div>
          ))}
        </div>
        
        {/* Reply form */}
        <div className="p-4 border-t">
          <h4 className="font-medium mb-2">Add a reply</h4>
          <Textarea 
            placeholder="Type your message here..." 
            className="min-h-[100px] mb-3"
            value={replyMessage}
            onChange={(e) => setReplyMessage(e.target.value)}
          />
          <div className="flex justify-end">
            <Button 
              onClick={handleSubmitReply} 
              disabled={!replyMessage.trim() || isSubmitting}
            >
              {isSubmitting ? 'Sending...' : 'Send Reply'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default TicketDetails;
