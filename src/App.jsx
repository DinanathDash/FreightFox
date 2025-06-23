import './App.css'
import { AuthProvider } from './Context/AuthContext'
import AppRouter from './Routes/AppRouter'
import { Toaster } from 'sonner'
import { useEffect } from 'react'

// Only in production, check connection
const isProd = import.meta.env.PROD;

function App() {
  useEffect(() => {
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
    <AuthProvider>
      <AppRouter />
      <Toaster />
    </AuthProvider>
  )
}

export default App
