import { useState, useEffect } from 'react';
import { useAuth } from '../../Context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import Logo from '../../assets/Logo.svg';
import Logo1 from '../../assets/logo1.svg';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import LoadingScreen from '../Loading/LoadingScreen';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from '../ui/dialog';

function Sidebar() {
  // Initialize state from localStorage or default to true if not found
  const [isExpanded, setIsExpanded] = useState(() => {
    const savedState = localStorage.getItem('sidebarExpanded');
    return savedState !== null ? JSON.parse(savedState) : true;
  });
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  // Save to localStorage whenever isExpanded changes
  useEffect(() => {
    localStorage.setItem('sidebarExpanded', JSON.stringify(isExpanded));
  }, [isExpanded]);

  // Detect screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768); // Mobile breakpoint
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024); // Tablet breakpoint
      
      // Auto-collapse sidebar on tablet, but respect user preference if already set in localStorage
      if (window.innerWidth < 1024 && window.innerWidth >= 768) {
        const savedState = localStorage.getItem('sidebarExpanded');
        if (savedState === null) {
          // Only set to false if user hasn't explicitly set a preference
          setIsExpanded(false);
        }
      } else if (window.innerWidth >= 1024 && localStorage.getItem('sidebarExpanded') === null) {
        // Only set to true if user hasn't explicitly set a preference
        setIsExpanded(true);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  const openLogoutDialog = () => {
    setShowLogoutDialog(true);
  };

  const handleLogout = async () => {
    try {
      setShowLogoutDialog(false);
      setIsLoggingOut(true);

      // Add a slight delay before logging out to show the loading screen
      setTimeout(async () => {
        await logout();
        // No need to reset isLoggingOut as the component will unmount
      }, 2000);
    } catch (error) {
      setIsLoggingOut(false);
      toast.error("Failed to log out");
    }
  };

  const mainNavItems = [
    {
      label: 'Dashboard',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 10H7C9 10 10 9 10 7V5C10 3 9 2 7 2H5C3 2 2 3 2 5V7C2 9 3 10 5 10Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M17 10H19C21 10 22 9 22 7V5C22 3 21 2 19 2H17C15 2 14 3 14 5V7C14 9 15 10 17 10Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M17 22H19C21 22 22 21 22 19V17C22 15 21 14 19 14H17C15 14 14 15 14 17V19C14 21 15 22 17 22Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M5 22H7C9 22 10 21 10 19V17C10 15 9 14 7 14H5C3 14 2 15 2 17V19C2 21 3 22 5 22Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      path: '/dashboard'
    },
    {
      label: 'Shipments',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M22 6V8.42C22 10 21 11 19.42 11H16V4.01C16 2.9 16.91 2 18.02 2C19.11 2.01 20.11 2.45 20.83 3.17C21.55 3.9 22 4.9 22 6Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M2 7V21C2 21.83 2.93998 22.3 3.59998 21.8L5.31 20.52C5.71 20.22 6.27 20.26 6.63 20.62L8.28998 22.29C8.67998 22.68 9.32002 22.68 9.71002 22.29L11.39 20.61C11.74 20.26 12.3 20.22 12.69 20.52L14.4 21.8C15.06 22.29 16 21.82 16 21V4C16 2.9 16.9 2 18 2H7H6C3 2 2 3.79 2 6V7Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9 13.01H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9 9.01001H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M5.99561 13H6.00459" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M5.99561 9H6.00459" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      path: '/shipments'
    },
    {
      label: 'Payments',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M2 10H22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M7 15H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12 15H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      path: '/payments'
    }
  ];

  const managementNavItems = [
    {
      label: 'Help',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9.09003 9.00002C9.32513 8.33169 9.78918 7.76813 10.4 7.40915C11.0108 7.05018 11.7289 6.91896 12.4272 7.03873C13.1255 7.15851 13.7588 7.52154 14.2151 8.06354C14.6713 8.60553 14.9211 9.29153 14.92 10C14.92 12 11.92 13 11.92 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12 17H12.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      path: '/help'
    },
    {
      label: 'Support',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20.5 10.19H17.61C15.24 10.19 13.31 8.26 13.31 5.89V3C13.31 2.45 12.86 2 12.31 2H8.07C4.99 2 2.5 4 2.5 7.57V16.43C2.5 20 4.99 22 8.07 22H15.93C19.01 22 21.5 20 21.5 16.43V11.19C21.5 10.64 21.05 10.19 20.5 10.19Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M13.31 2V5.89C13.31 8.26 15.24 10.19 17.61 10.19H20.5L13.31 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M7.5 13H13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M7.5 17H11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      path: '/support'
    },
    {
      label: 'Settings',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 9.11V14.88C3 17 3 17 5 18.35L10.5 21.53C11.33 22.01 12.68 22.01 13.5 21.53L19 18.35C21 17 21 17 21 14.89V9.11C21 7 21 7 19 5.65L13.5 2.47C12.68 1.99 11.33 1.99 10.5 2.47L5 5.65C3 7 3 7 3 9.11Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      path: '/settings'
    },
    {
      label: 'Sign Out',
      onClick: openLogoutDialog,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8.90002 7.56001C9.21002 3.96001 11.06 2.49001 15.11 2.49001H15.24C19.71 2.49001 21.5 4.28001 21.5 8.75001V15.27C21.5 19.74 19.71 21.53 15.24 21.53H15.11C11.09 21.53 9.24002 20.08 8.91002 16.54" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M15 12H3.62" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M5.85 8.65002L2.5 12L5.85 15.35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    }
  ];

  return (
    <>
      {isLoggingOut && <LoadingScreen show={true} />}
      
      {/* Desktop and Tablet Sidebar */}
      {!isMobile && (
        <div className="relative h-screen z-10 hidden md:block">
          <div className={`bg-white h-full shadow-md transition-all duration-300 flex flex-col ${isExpanded ? 'w-54' : 'w-20'}`}>
            <div className="p-4 flex justify-center items-center">
              {isExpanded ? (
                <div className="flex items-center">
                  <img src={Logo} alt="ShipEase Logo" className="h-10 w-auto" />
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <img src={Logo1} alt="ShipEase Icon" className="h-10 w-10" />
                </div>
              )}
            </div>

            <div className='border-t'></div>
            <div className={`px-4 py-2 mt-4 ${isExpanded ? 'text-left' : 'text-center'}`}>
              {isExpanded && <p className="text-xs font-medium text-gray-400 mb-2">Main Menu</p>}
            </div>

            <nav className="flex-1">
              {mainNavItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.label}
                    to={item.path}
                    className={`flex items-center px-4 py-3 ${isExpanded ? 'justify-start' : 'justify-center'} 
                    ${isActive ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    <div className={`${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                      {item.icon}
                    </div>
                    {isExpanded && <span className="ml-3 font-medium">{item.label}</span>}
                  </Link>
                );
              })}
            </nav>

            <div className={`mt-4 px-4 py-2 ${isExpanded ? 'text-left' : 'text-center'}`}>
              {isExpanded && <p className="text-xs font-medium text-gray-400 mb-2">Management</p>}
            </div>

            <nav className="mb-auto">
              {managementNavItems.map((item) => {
                const isActive = item.path && location.pathname === item.path;

                // Render as button if it has onClick handler
                if (item.onClick) {
                  return (
                    <button
                      key={item.label}
                      onClick={item.onClick}
                      className={`flex items-center w-full px-4 py-3 ${isExpanded ? 'justify-start' : 'justify-center'} 
                      text-gray-600 hover:bg-gray-50`}
                    >
                      <div className="text-gray-500">
                        {item.icon}
                      </div>
                      {isExpanded && <span className="ml-3 font-medium">{item.label}</span>}
                    </button>
                  );
                }

                // Render as Link for navigation items
                return (
                  <Link
                    key={item.label}
                    to={item.path}
                    className={`flex items-center px-4 py-3 ${isExpanded ? 'justify-start' : 'justify-center'} 
                    ${isActive ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    <div className={`${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                      {item.icon}
                    </div>
                    {isExpanded && <span className="ml-3 font-medium">{item.label}</span>}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Floating collapse button - only for tablet and desktop */}
          {!isMobile && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="absolute -right-3 top-15 bg-white shadow-md rounded-full p-1.5 hover:bg-gray-50 transform transition-transform z-50"
              aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3.5 w-3.5 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                style={{ transform: `rotate(${isExpanded ? 0 : 180}deg)` }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <>
          {/* Mobile Bottom Navigation */}
          <div style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 50,
            backgroundColor: 'white',
            borderTopLeftRadius: '1rem',
            borderTopRightRadius: '1rem',
            boxShadow: '0 -2px 5px -1px rgba(0, 0, 0, 0.08)',
            padding: '0.4rem 0.25rem',
            paddingBottom: 'calc(0.4rem + env(safe-area-inset-bottom))'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '0.1rem'
            }}>
              {mainNavItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.label}
                    to={item.path}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0.3rem 0',
                      textDecoration: 'none',
                      color: isActive ? '#2563eb' : '#4b5563'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      background: isActive ? 'rgba(37, 99, 235, 0.1)' : 'transparent',
                      padding: '0.3rem',
                      borderRadius: '0.5rem',
                      marginBottom: '0.15rem'
                    }}>
                      <div style={{ color: isActive ? '#2563eb' : '#4b5563' }}>
                        {item.icon}
                      </div>
                    </div>
                    <span style={{ 
                      fontSize: '0.7rem',
                      fontWeight: isActive ? '600' : '500',
                      textAlign: 'center'
                    }}>{item.label}</span>
                  </Link>
                );
              })}
              
              {/* More button for management items */}
              <button 
                onClick={() => {
                  const menu = document.getElementById('mobile-management-menu');
                  const overlay = document.getElementById('mobile-menu-overlay');
                  if (menu.style.display === 'block') {
                    menu.style.display = 'none';
                    overlay.style.display = 'none';
                    document.body.style.overflow = 'auto';
                  } else {
                    menu.style.display = 'block';
                    overlay.style.display = 'block';
                    document.body.style.overflow = 'hidden';
                  }
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0.3rem 0',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#4b5563'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: '0.3rem',
                  borderRadius: '0.5rem',
                  marginBottom: '0.15rem'
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 10C6.10457 10 7 9.10457 7 8C7 6.89543 6.10457 6 5 6C3.89543 6 3 6.89543 3 8C3 9.10457 3.89543 10 5 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M19 10C20.1046 10 21 9.10457 21 8C21 6.89543 20.1046 6 19 6C17.8954 6 17 6.89543 17 8C17 9.10457 17.8954 10 19 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 10C13.1046 10 14 9.10457 14 8C14 6.89543 13.1046 6 12 6C10.8954 6 10 6.89543 10 8C10 9.10457 10.8954 10 12 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M5 18C6.10457 18 7 17.1046 7 16C7 14.8954 6.10457 14 5 14C3.89543 14 3 14.8954 3 16C3 17.1046 3.89543 18 5 18Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M19 18C20.1046 18 21 17.1046 21 16C21 14.8954 20.1046 14 19 14C17.8954 14 17 14.8954 17 16C17 17.1046 17.8954 18 19 18Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 18C13.1046 18 14 17.1046 14 16C14 14.8954 13.1046 14 12 14C10.8954 14 10 14.8954 10 16C10 17.1046 10.8954 18 12 18Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span style={{ 
                  fontSize: '0.7rem', 
                  fontWeight: '500',
                  textAlign: 'center'
                }}>More</span>
              </button>
            </div>
          </div>
          
          {/* Overlay for mobile menu */}
          <div 
            id="mobile-menu-overlay" 
            style={{
              display: 'none',
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 49
            }}
            onClick={() => {
              document.getElementById('mobile-management-menu').style.display = 'none';
              document.getElementById('mobile-menu-overlay').style.display = 'none';
              document.body.style.overflow = 'auto';
            }}
          ></div>
          
          {/* Mobile management menu (initially hidden) */}
          <div 
            id="mobile-management-menu" 
            style={{
              display: 'none',
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: 'white',
              borderTopLeftRadius: '1rem',
              borderTopRightRadius: '1rem',
              boxShadow: '0 -5px 10px -3px rgba(0, 0, 0, 0.08), 0 -2px 4px -1px rgba(0, 0, 0, 0.04)',
              padding: '1rem',
              paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))',
              zIndex: 50,
              maxHeight: '70vh',
              overflowY: 'auto'
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: '0.5rem'
            }}>
              <div style={{
                width: '2rem',
                height: '0.2rem',
                backgroundColor: '#d1d5db',
                borderRadius: '9999px'
              }}></div>
            </div>
            <h3 style={{
              margin: '0 0 0.75rem 0',
              fontWeight: '600',
              fontSize: '1rem'
            }}>Options</h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '0.5rem'
            }}>
              {managementNavItems.map((item) => {
                if (item.onClick) {
                  return (
                    <button
                      key={item.label}
                      onClick={() => {
                        document.getElementById('mobile-management-menu').style.display = 'none';
                        document.getElementById('mobile-menu-overlay').style.display = 'none';
                        document.body.style.overflow = 'auto';
                        item.onClick();
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0.5rem',
                        backgroundColor: 'transparent',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.5rem',
                        color: '#4b5563',
                        textAlign: 'left',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{
                        marginRight: '0.75rem',
                        color: '#6b7280'
                      }}>
                        {item.icon}
                      </div>
                      <span style={{
                        fontWeight: '500'
                      }}>{item.label}</span>
                    </button>
                  );
                }
                
                const isActive = item.path && location.pathname === item.path;
                return (
                  <Link
                    key={item.label}
                    to={item.path}
                    onClick={() => {
                      document.getElementById('mobile-management-menu').style.display = 'none';
                      document.getElementById('mobile-menu-overlay').style.display = 'none';
                      document.body.style.overflow = 'auto';
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0.5rem',
                      backgroundColor: isActive ? 'rgba(37, 99, 235, 0.05)' : 'transparent',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      color: isActive ? '#2563eb' : '#4b5563',
                      textDecoration: 'none',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{
                      marginRight: '0.75rem',
                      color: isActive ? '#2563eb' : '#6b7280'
                    }}>
                      {item.icon}
                    </div>
                    <span style={{
                      fontWeight: '500'
                    }}>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Logout Confirmation Dialog */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Sign Out</DialogTitle>
            <DialogDescription>
              Are you sure you want to sign out? Your session will be terminated.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="default" onClick={handleLogout}>
              Sign Out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default Sidebar;
