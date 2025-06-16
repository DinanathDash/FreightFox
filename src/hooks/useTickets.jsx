import { useState, useEffect } from 'react';
import { useAuth } from '../Context/AuthContext';
import { getTicketsByUserId, createSupportTicket, addTicketReply } from '../Firebase/shared/services';
import { toast } from "sonner";

// Helper function to handle Firebase index errors gracefully
const handleFirebaseIndexError = (error) => {
  // Check if it's an index error
  if (error.message && error.message.includes('index')) {
    // Extract the URL from the error message
    const urlMatch = error.message.match(/https:\/\/console\.firebase\.google\.com[^\s]*/);
    if (urlMatch && urlMatch[0]) {
      const indexUrl = urlMatch[0];
      console.error('Firebase requires an index. Create it here:', indexUrl);
      
      // Show a more user-friendly message with instructions - using plain text
      toast.error(
        "Database index needs to be created. Please share this error with the administrator.",
        { duration: 10000 }
      );
      
      return true; // Handled
    }
  }
  return false; // Not handled
};

export function useTickets() {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { currentUser } = useAuth();
  
  const addTicket = async (ticket) => {
    try {
      // Make sure we have a current user
      if (!currentUser) {
        throw new Error("You must be logged in to create a support ticket");
      }
      
      const ticketToCreate = {
        ...ticket,
        userId: currentUser.uid,
        userName: currentUser.displayName || '',
        userEmail: currentUser.email || '',
        status: "pending",
      };
      
      // Create the ticket in Firebase
      const newTicket = await createSupportTicket(ticketToCreate);
      
      // Update local state with the new ticket
      setTickets(prevTickets => [newTicket, ...prevTickets]);
      return newTicket;
    } catch (error) {
      console.error("Error adding ticket:", error);
      // Handle Firebase index error
      if (handleFirebaseIndexError(error)) {
        // Index error was handled, no need to re-throw
        return;
      }
      throw error;
    }
  };
  
  const addReply = async (ticketId, replyData) => {
    try {
      if (!currentUser) {
        throw new Error("You must be logged in to reply to a support ticket");
      }
      
      // Add user information to the reply
      const reply = {
        ...replyData,
        userId: currentUser.uid,
        userName: currentUser.displayName || currentUser.email || 'User',
      };
      
      // Add the reply to the ticket in Firebase
      await addTicketReply(ticketId, reply);
      
      // Update local state to reflect the new reply
      setTickets(prevTickets => 
        prevTickets.map(ticket => {
          if (ticket.id === ticketId) {
            const replies = ticket.replies || [];
            // Use the same approach as in services.js: JavaScript Date object for timestamp
            const currentDate = new Date();
            return {
              ...ticket,
              replies: [...replies, { ...reply, timestamp: currentDate }],
              lastUpdated: currentDate,
              status: 'open'
            };
          }
          return ticket;
        })
      );
    } catch (error) {
      console.error("Error adding reply:", error);
      throw error;
    }
  };
  
  useEffect(() => {
    // Fetch tickets from Firebase
    const fetchTickets = async () => {
      setIsLoading(true);
      try {
        // Only fetch tickets if we have a logged-in user
        if (currentUser) {
          const ticketsData = await getTicketsByUserId(currentUser.uid);
          setTickets(ticketsData);
        } else {
          setTickets([]);
        }
      } catch (error) {
        console.error("Error fetching tickets:", error);
        
        // Special handling for Firebase index errors
        if (!handleFirebaseIndexError(error)) {
          // For other errors, show a generic message
          toast.error("Failed to load support tickets");
        }
        
        // Provide empty array as fallback
        setTickets([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTickets();
  }, [currentUser]);
  
  const getTicketById = (ticketId) => {
    return tickets.find(ticket => ticket.id === ticketId);
  };
  
  const searchTickets = (query) => {
    if (!query) return tickets;
    
    const lowerCaseQuery = query.toLowerCase();
    return tickets.filter(ticket => 
      ticket.id.toLowerCase().includes(lowerCaseQuery) ||
      ticket.subject.toLowerCase().includes(lowerCaseQuery)
    );
  };

  return {
    tickets,
    isLoading,
    addTicket,
    addReply,
    getTicketById,
    searchTickets
  };
}
