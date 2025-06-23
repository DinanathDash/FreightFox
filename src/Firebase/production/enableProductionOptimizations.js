// Import this file at the top of your entry point (main.prod.jsx)
// This enables production-specific Firestore optimizations

// In production only, apply the Firestore optimizations
if (import.meta.env.PROD) {
  console.log('[FreightFox] Initializing production optimizations...');
  
  // Apply Firestore connection optimizations
  import('./firestoreProductionBootstrap.js')
    .then(() => console.log('[FreightFox] Production Firestore optimizations enabled'))
    .catch(err => console.warn('[FreightFox] Production optimizations failed to load', err));
    
  // Suppress non-critical Firebase console warnings in production
  const originalConsoleWarn = console.warn;
  console.warn = function(...args) {
    // Ignore certain Firebase-related warnings in production
    if (args.length > 0 && 
        typeof args[0] === 'string' && 
        (args[0].includes('@firebase') || 
         args[0].includes('Firebase') ||
         args[0].includes('Firestore'))) {
      // Skip Firebase warnings in production
      return;
    }
    originalConsoleWarn.apply(console, args);
  };
}

// No exports - simply importing this file is enough
