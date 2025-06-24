import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import { useState, useEffect } from 'react';
import AuthWrapper from '../Components/Auth/AuthWrapper';
import DashboardPage from '../Pages/Dashboard/DashboardPage';
import ShipmentPage from '../Pages/Shipment';
import PaymentPage from '../Pages/Payment';
import HelpPage from '../Pages/Help';
import SupportPage from '../Pages/Support';
import SettingsPage from '../Pages/Settings';
import ErrorPage from '../Pages/Error/ErrorPage';
import SessionTimeout from '../Components/Auth/SessionTimeout';
import SessionExpiryModal from '../Components/Auth/SessionExpiryModal';
import LiveChat from '../Components/Support/LiveChat';
import LoadingScreen from '../Components/Loading/LoadingScreen';

function PrivateRoute({ children }) {
  const { currentUser, loading } = useAuth();
  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    if (currentUser && showLoading) {
      // Keep the loading screen visible for a minimum amount of time
      const timer = setTimeout(() => {
        setShowLoading(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    } else if (!currentUser) {
      setShowLoading(false);
    }
  }, [currentUser, showLoading]);

  if (loading) {
    return <LoadingScreen show={true} />;
  }
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  return (
    <>
      {showLoading ? <LoadingScreen show={true} onComplete={() => setShowLoading(false)} /> : null}
      {children}
    </>
  );
}

function AppRouter() {
  const { currentUser, loading } = useAuth();
  
  return (
    <>
      {currentUser && (
        <>
          <SessionTimeout />
          <SessionExpiryModal />
          <LiveChat />
        </>
      )}
      <Routes>
        <Route path="/login" element={<AuthWrapper />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Navigate to="/dashboard" />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/shipments"
          element={
            <PrivateRoute>
              <ShipmentPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/payments"
          element={
            <PrivateRoute>
              <PaymentPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/help"
          element={
            <PrivateRoute>
              <HelpPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/support"
          element={
            <PrivateRoute>
              <SupportPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <SettingsPage />
            </PrivateRoute>
          }
        />
          
        {/* Error routes */}
        <Route path="/404" element={<ErrorPage statusCode={404} />} />
        <Route path="/error" element={<ErrorPage statusCode={500} />} />
        <Route path="*" element={<ErrorPage statusCode={404} />} />
      </Routes>
    </>
  );
}

export default AppRouter;
