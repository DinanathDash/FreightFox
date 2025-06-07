import { useState, useEffect } from 'react';
import { useAuth } from '../../Context/AuthContext';
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "../ui/dialog";

// Show modal 2 minutes before expiry
const WARNING_TIME = 2 * 60 * 1000;

const SessionExpiryModal = () => {
  const { currentUser, sessionExpiry, resetSessionTimer, logout, isSessionActive } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState('');

  useEffect(() => {
    if (!currentUser || !isSessionActive || !sessionExpiry) {
      setShowModal(false);
      return;
    }

    let intervalId;
    
    const checkSessionTime = () => {
      const currentTime = Date.now();
      const remainingTime = sessionExpiry - currentTime;
      
      if (remainingTime <= WARNING_TIME) {
        // Format time remaining as MM:SS
        const minutes = Math.floor(remainingTime / 60000);
        const seconds = Math.floor((remainingTime % 60000) / 1000);
        setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`);
        setShowModal(true);
      } else {
        setShowModal(false);
      }
    };
    
    // Check immediately
    checkSessionTime();
    
    // Then check every second
    intervalId = setInterval(checkSessionTime, 1000);
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [currentUser, sessionExpiry, isSessionActive]);

  const handleExtendSession = () => {
    resetSessionTimer();
    setShowModal(false);
  };

  const handleLogout = async () => {
    await logout();
    setShowModal(false);
  };

  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Session Expiring Soon</DialogTitle>
          <DialogDescription>
            Your session will expire in {timeRemaining}. Would you like to extend your session or logout?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex space-x-2 sm:justify-center">
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
          <Button onClick={handleExtendSession}>
            Extend Session
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SessionExpiryModal;
