import './App.css'
import { AuthProvider } from './Context/AuthContext'
import AppRouter from './Routes/AppRouter'
import { Toaster } from 'sonner'
import { useEffect } from 'react'
import { setupGlobalErrorHandlers } from './lib/errorUtils'
import { BrowserRouter as Router } from 'react-router-dom'
import ErrorBoundary from './Components/Error/ErrorBoundary'

// Only in production, check connection
const isProd = import.meta.env.PROD;

function App() {
  useEffect(() => {
    // Setup global error handlers - only in production to avoid issues in dev
    if (isProd) {
      setupGlobalErrorHandlers();
    }
    
    // Only run this in production
    if (isProd) {
      // Dynamically import connection check to avoid bundling issues in dev
      import('./Firebase/shared/connectionCheck.js')
        .then(module => {
          const { ensureFirestoreConnection } = module;
          // Test the connection with retries
          ensureFirestoreConnection()
            .then(result => {
              if (result.success) {
                console.log('[FreightFox] Firebase connection verified successfully');
              } else {
                console.warn('[FreightFox] Firebase connection issues:', result.error);
              }
            });
        })
        .catch(err => console.error('[FreightFox] Error loading connection check:', err));
    }
  }, []);

  return (
    <Router>
      <AuthProvider>
        <ErrorBoundary>
          <AppRouter />
          <Toaster />
        </ErrorBoundary>
      </AuthProvider>
    </Router>
  )
}

export default App
