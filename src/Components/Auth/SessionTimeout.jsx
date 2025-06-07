import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../Context/AuthContext';
import { toast } from "sonner";

// Warning will appear 2 minutes before session expiry
const WARNING_THRESHOLD = 2 * 60 * 1000;

export function SessionTimeout() {
  const { currentUser, sessionExpiry, resetSessionTimer, logout, isSessionActive } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);

  // Calculate and format time remaining
  const formatTimeRemaining = useCallback(() => {
    if (!sessionExpiry) return '';
    
    const remaining = Math.max(0, sessionExpiry - Date.now());
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }, [sessionExpiry]);

  // Check if we should show the warning
  useEffect(() => {
    if (!currentUser || !sessionExpiry || !isSessionActive) {
      setShowWarning(false);
      return;
    }

    const checkSessionStatus = () => {
      const now = Date.now();
      const timeRemaining = sessionExpiry - now;
      
      // If session is expiring soon, show warning
      if (timeRemaining <= WARNING_THRESHOLD) {
        setShowWarning(true);
        setTimeLeft(formatTimeRemaining());
      } else {
        setShowWarning(false);
      }
    };

    const timer = setInterval(checkSessionStatus, 1000);
    checkSessionStatus(); // Initial check
    
    return () => clearInterval(timer);
  }, [currentUser, sessionExpiry, isSessionActive, formatTimeRemaining]);

  // Show a toast when warning appears
  useEffect(() => {
    if (showWarning) {
      toast.warning(
        `Your session will expire in ${timeLeft}. Click to extend.`,
        {
          duration: Infinity,
          onDismiss: resetSessionTimer,
          action: {
            label: "Extend Session",
            onClick: resetSessionTimer,
          }
        }
      );
    }
  }, [showWarning, timeLeft, resetSessionTimer]);

  return null; // This component doesn't render anything directly
}

export default SessionTimeout;
