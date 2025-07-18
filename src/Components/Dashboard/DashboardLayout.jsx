import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import { useAuth } from '../../Context/AuthContext';
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { NotificationsPopover } from './NotificationsPopover';

function DashboardLayout({ children }) {
  const { currentUser } = useAuth();
  const [notificationOpen, setNotificationOpen] = useState(false);
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  // Get the page title based on the current route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return 'Dashboard';
    if (path.includes('/shipments')) return 'Shipments';
    if (path.includes('/payments')) return 'Payments';
    if (path.includes('/help')) return 'Help';
    if (path.includes('/support')) return 'Support';
    if (path.includes('/settings')) return 'Settings';
    return 'Dashboard';
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className={`bg-white shadow-sm ${isMobile ? 'p-3' : 'p-4'} flex justify-between items-center z-5`}>
          <div className="flex items-center space-x-4">
            <h1 className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold text-gray-800`}>{getPageTitle()}</h1>
          </div>

          <div className="flex items-center space-x-3">
            <Popover open={notificationOpen} onOpenChange={setNotificationOpen}>
              <PopoverTrigger asChild>
                <button className="text-gray-500 hover:text-gray-700 relative">
                  <svg width={isMobile ? "22" : "25"} height={isMobile ? "22" : "25"} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 6.43994V9.76994" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" />
                    <path d="M12.02 2C8.34002 2 5.36002 4.98 5.36002 8.66V10.76C5.36002 11.44 5.08002 12.46 4.73002 13.04L3.46002 15.16C2.68002 16.47 3.22002 17.93 4.66002 18.41C9.44002 20 14.61 20 19.39 18.41C20.74 17.96 21.32 16.38 20.59 15.16L19.32 13.04C18.97 12.46 18.69 11.43 18.69 10.76V8.66C18.68 5 15.68 2 12.02 2Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" />
                    <path d="M15.33 18.82C15.33 20.65 13.83 22.15 12 22.15C11.09 22.15 10.25 21.77 9.65004 21.17C9.05004 20.57 8.67004 19.73 8.67004 18.82" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" />
                  </svg>
                  <span className={`absolute -top-1 -right-1 bg-red-500 text-white text-xs ${isMobile ? 'w-3.5 h-3.5' : 'w-4 h-4'} flex items-center justify-center rounded-full`}>2</span>
                </button>
              </PopoverTrigger>
              <PopoverContent className="p-0 w-80 max-w-[calc(100vw-2rem)]" align="end">
                <NotificationsPopover onClose={() => setNotificationOpen(false)} />
              </PopoverContent>
            </Popover>

            <div className="relative">
              <div className="flex items-center space-x-3">
                <div className={`${isMobile ? 'h-8 w-8' : 'h-10 w-10'} rounded-full bg-gray-300 flex items-center justify-center overflow-hidden border-2 border-indigo-100`}>
                  {currentUser?.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt="Profile"
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/user.svg";
                      }}
                    />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-gray-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className={`flex-1 ${isMobile ? 'p-3 mb-20' : 'p-6'} overflow-auto`}>
          {children}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
