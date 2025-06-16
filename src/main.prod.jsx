// This file is a production-optimized version of main.jsx
// It contains the necessary fixes for Firestore connection issues
// While keeping development code completely untouched

// Import the production Firestore optimizations first
import './Firebase/production/enableProductionOptimizations.js';

// Then import everything else normally, exactly like main.jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Log that we're using the production-optimized entry point
console.log('[FreightFox] Using production-optimized application entry point');

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
