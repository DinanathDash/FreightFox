import './App.css'
import { AuthProvider } from './Context/AuthContext'
import AppRouter from './Routes/AppRouter'
import { Toaster } from 'sonner'

function App() {
  return (
    <AuthProvider>
      <AppRouter />
      <Toaster />
    </AuthProvider>
  )
}

export default App
