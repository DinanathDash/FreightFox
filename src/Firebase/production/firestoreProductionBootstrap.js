// Production Firestore Bootstrap 
// This file patches Firestore in production environments without affecting development

// Only run this code in production
if (import.meta.env.PROD) {
  try {
    console.log("[FreightFox] Initializing production Firestore patches");
    
    // Dynamically patch Firestore imports in production
    // This approach ensures we don't modify any development code
    const originalModule = await import('firebase/firestore');
    
    // Store the original getFirestore function
    const originalGetFirestore = originalModule.getFirestore;
    
    // Override getFirestore to use our production-optimized settings
    originalModule.getFirestore = function(app) {
      const { initializeFirestore } = originalModule;
      
      try {
        // Use optimized settings for production
        return initializeFirestore(app, {
          experimentalForceLongPolling: true,
          experimentalAutoDetectLongPolling: false,
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
  } catch (error) {
    console.error("[FreightFox] Failed to apply production Firestore patches", error);
  }
}
