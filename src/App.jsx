import './App.css'
import { AuthProvider } from './Context/AuthContext'
import AppRouter from './Routes/AppRouter'
import LiveChat from './Components/Support/LiveChat'
import { Toaster } from 'sonner'

function App() {
  return (
    <AuthProvider>
      <AppRouter />
      <LiveChat />
      <Toaster />
    </AuthProvider>
  )
}

export default App
