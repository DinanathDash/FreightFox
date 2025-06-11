import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import AuthForm from '../Components/Auth/AuthForm';
import DashboardPage from '../Pages/Dashboard/DashboardPage';
import ShipmentPage from '../Pages/Shipment';
import HelpPage from '../Pages/Help';
import SupportPage from '../Pages/Support';
import SettingsPage from '../Pages/Settings';
import SessionTimeout from '../Components/Auth/SessionTimeout';
import SessionExpiryModal from '../Components/Auth/SessionExpiryModal';

function PrivateRoute({ children }) {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" />;
}

function AppRouter() {
  const { currentUser } = useAuth();
  
  return (
    <Router>
      {currentUser && (
        <>
          <SessionTimeout />
          <SessionExpiryModal />
        </>
      )}
      <Routes>
        <Route path="/login" element={<AuthForm />} />
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
      </Routes>
    </Router>
  );
}

export default AppRouter;
