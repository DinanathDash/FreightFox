import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthForm from './AuthForm';
import LoadingScreen from '../Loading/LoadingScreen';
import { useAuth } from '../../Context/AuthContext';

const AuthWrapper = () => {
  const { currentUser, loading } = useAuth();
  const [showLoading, setShowLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If user is authenticated, show loading screen before redirecting
    if (currentUser && !loading) {
      setShowLoading(true);
      
      // Delay navigation to show the loading animation
      const timer = setTimeout(() => {
        const destination = location.state?.from?.pathname || '/dashboard';
        navigate(destination, { replace: true });
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [currentUser, loading, navigate, location]);

  if (loading) {
    return <LoadingScreen show={true} />;
  }

  return (
    <>
      {showLoading ? <LoadingScreen show={true} /> : <AuthForm />}
    </>
  );
};

export default AuthWrapper;
