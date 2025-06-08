import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import { useAuth } from '../../Context/AuthContext';
import { toast } from "sonner";
import { Button } from "../ui/button";

function DashboardLayout({ children }) {
  const { currentUser, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);
  const location = useLocation();

  // Get the page title based on the current route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return 'Dashboard';
    if (path.includes('/shipments')) return 'Shipments';
    if (path.includes('/orders')) return 'Orders';
    if (path.includes('/messages')) return 'Messages';
    if (path.includes('/customers')) return 'Customers';
    if (path.includes('/help')) return 'Help';
    if (path.includes('/support')) return 'Support';
    if (path.includes('/settings')) return 'Settings';
    return 'Dashboard';
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      toast.error("Failed to log out");
    }
  };

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm p-4 flex justify-between items-center z-5">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-gray-800">{getPageTitle()}</h1>
          </div>

          <div className="flex items-center space-x-4">
            <button className="text-gray-500 hover:text-gray-700">
              <svg width="25" height="25" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 6.43994V9.76994" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" />
                <path d="M12.02 2C8.34002 2 5.36002 4.98 5.36002 8.66V10.76C5.36002 11.44 5.08002 12.46 4.73002 13.04L3.46002 15.16C2.68002 16.47 3.22002 17.93 4.66002 18.41C9.44002 20 14.61 20 19.39 18.41C20.74 17.96 21.32 16.38 20.59 15.16L19.32 13.04C18.97 12.46 18.69 11.43 18.69 10.76V8.66C18.68 5 15.68 2 12.02 2Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" />
                <path d="M15.33 18.82C15.33 20.65 13.83 22.15 12 22.15C11.09 22.15 10.25 21.77 9.65004 21.17C9.05004 20.57 8.67004 19.73 8.67004 18.82" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" />
              </svg>
            </button>

            <div className="relative" ref={profileMenuRef}>
              <div
                className="flex items-center space-x-3 cursor-pointer"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden border-2 border-indigo-100">
                  {currentUser?.photoURL ? (
                    <>
                      {console.log("Photo URL:", currentUser.photoURL)}
                      <img
                        src={currentUser.photoURL}
                        alt="Profile"
                        className="h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          console.error("Image failed to load:", e);
                          e.target.onerror = null;
                          e.target.src = "/user.svg";
                        }}
                      />
                    </>
                  ) : (
                    <img
                      src="/user.svg"
                      alt="Profile"
                      className="h-6 w-6 object-cover"
                    />
                  )}
                </div>
              </div>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20">
                  <Button
                    variant="ghost"
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={handleLogout}
                  >
                    Sign out
                  </Button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
