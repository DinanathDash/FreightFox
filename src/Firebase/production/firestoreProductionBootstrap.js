// Production Firestore Bootstrap 
// This file patches Firestore in production environments without affecting development

// Import firestore dynamically without top-level await
const applyProductionPatches = () => {
  // Only run this code in production
  if (import.meta.env.PROD) {
    console.log("[FreightFox] Initializing production Firestore patches");
    
    // Dynamically patch Firestore imports in production
    import('firebase/firestore')
      .then(originalModule => {
        // Store the original getFirestore function
        const originalGetFirestore = originalModule.getFirestore;
        
        // Override getFirestore to use our production-optimized settings
        originalModule.getFirestore = function(app) {
          const { initializeFirestore } = originalModule;
          
          try {
            // Use optimized settings for production with updated connection parameters
            return initializeFirestore(app, {
              experimentalForceLongPolling: true,
              experimentalAutoDetectLongPolling: true,  // Enable auto-detection
              cacheSizeBytes: 50 * 1024 * 1024,
              ignoreUndefinedProperties: true
            });
          } catch (error) {
            console.warn("[FreightFox] Failed to initialize production Firestore, using default", error);
            // Fall back to original function if optimization fails
            return originalGetFirestore(app);
          }
        };
        
        console.log("[FreightFox] Production Firestore patches applied");
      })
      .catch(error => {
        console.error("[FreightFox] Failed to apply production Firestore patches", error);
      });
  }
};

// Execute immediately
applyProductionPatches();
