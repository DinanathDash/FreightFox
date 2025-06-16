// Import this file at the top of your entry point (main.jsx)
// This enables production-specific Firestore optimizations

// In production only, apply the Firestore optimizations
if (import.meta.env.PROD) {
  // We use a dynamic import to avoid breaking development builds
  import('./firestoreProductionBootstrap.js')
    .then(() => console.log('[FreightFox] Production Firestore optimizations enabled'))
    .catch(err => console.warn('[FreightFox] Production optimizations failed to load', err));
}

// No exports - simply importing this file is enough
