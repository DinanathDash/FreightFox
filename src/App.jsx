import './App.css'
import { AuthProvider } from './Context/AuthContext'
import AppRouter from './Routes/AppRouter'

function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  )
}

export default App
