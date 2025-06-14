import { useState, useEffect } from 'react';
import { useAuth } from '../../Context/AuthContext';
import DashboardLayout from '../../Components/Dashboard/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../../Components/ui/card';
import ProfileSettings from './ProfileSettings';
import AccountSettings from './AccountSettings';

function SettingsPage() {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>;
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto p-3 md:p-6 max-w-5xl">
        <div className="space-y-6 md:space-y-8">
          {/* Profile Settings Section */}
          <section>
            <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-3 md:mb-4 flex items-center">
              <svg className="w-4 h-4 md:w-5 md:h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M20.5899 22C20.5899 18.13 16.7399 15 11.9999 15C7.25991 15 3.40991 18.13 3.40991 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Profile Settings
            </h2>
            <ProfileSettings />
          </section>
          
          {/* Account Settings Section */}
          <section>
            <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-3 md:mb-4 flex items-center">
              <svg className="w-4 h-4 md:w-5 md:h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 9.11V14.88C3 17 3 17 5 18.35L10.5 21.53C11.33 22.01 12.68 22.01 13.5 21.53L19 18.35C21 17 21 17 21 14.89V9.11C21 7 21 7 19 5.65L13.5 2.47C12.68 1.99 11.33 1.99 10.5 2.47L5 5.65C3 7 3 7 3 9.11Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Account Settings
            </h2>
            <AccountSettings />
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default SettingsPage;
