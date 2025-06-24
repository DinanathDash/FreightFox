// Connection check helper for Firebase, especially in production environments
// Import conditionally to ensure we use the right Firebase instance
// Use dynamic imports for Firestore functions to ensure compatibility

let db;

// Function to get the right db instance
async function getDb() {
  if (!db) {
    // Try to get the db from the production config if we're in production
    if (import.meta.env.PROD) {
      try {
        const prodConfig = await import('../production/productionConfig.js');
        db = prodConfig.db;
      } catch (e) {
        // Fall back to shared config
        const sharedConfig = await import('./sharedConfig.js');
        db = sharedConfig.db;
      }
    } else {
      // In development, always use the shared config
      const sharedConfig = await import('./sharedConfig.js');
      db = sharedConfig.db;
    }
  }
  return db;
}

/**
 * Tests the Firestore connection by making a simple query
 * Useful to check if the connection is working, especially in production
 */
export async function testFirestoreConnection() {
  try {
    console.log('[FreightFox] Testing Firestore connection...');
    
    // Dynamically import Firestore functions to avoid bundling issues
    const { collection, query, limit, getDocs } = await import('firebase/firestore');
    
    // Get the right db instance
    const db = await getDb();
    
    // Try to fetch a single document from the Users collection
    const q = query(collection(db, 'Users'), limit(1));
    
    // Await the query execution
    const querySnapshot = await getDocs(q);
    
    // If we get here without an error, the connection is working
    console.log(`[FreightFox] Firestore connection successful. Got ${querySnapshot.size} document(s).`);
    
    return {
      success: true,
      message: 'Firestore connection established successfully',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('[FreightFox] Firestore connection test failed:', error);
    
    return {
      success: false,
      error: {
        code: error.code || 'unknown',
        message: error.message,
        details: error.toString()
      },
      timestamp: new Date().toISOString()
    };
  }
}

// Function to check connection and retry with alternative settings if needed
export async function ensureFirestoreConnection(maxRetries = 3) {
  let retryCount = 0;
  
  while (retryCount < maxRetries) {
    const result = await testFirestoreConnection();
    
    if (result.success) {
      return result;
    }
    
    console.warn(`[FreightFox] Connection attempt ${retryCount + 1} failed, retrying...`);
    retryCount++;
    
    // On the last retry, attempt with alternative settings
    if (retryCount === maxRetries - 1) {
      try {
        // Try to dynamically apply alternative settings
        console.log('[FreightFox] Applying alternative connection settings...');
        
        // This will only work in browsers
        if (typeof window !== 'undefined') {
          // Create a temporary connection to test
          const { initializeFirestore } = await import('firebase/firestore');
          
          // Get the app instance
          let app;
          if (import.meta.env.PROD) {
            const prodConfig = await import('../production/productionConfig.js');
            app = prodConfig.app;
          } else {
            const sharedConfig = await import('./sharedConfig.js');
            app = sharedConfig.app;
          }
          
          // Create a connection with different settings
          const tempDb = initializeFirestore(app, {
            experimentalForceLongPolling: true,
            experimentalAutoDetectLongPolling: false, // Keep this false to ensure consistency
            cacheSizeBytes: 1048576 * 10, // Smaller cache
          });
          
          // Test with this temp connection
          const q = query(collection(tempDb, 'Users'), limit(1));
          await getDocs(q);
          
          console.log('[FreightFox] Alternative settings working, suggest updating config');
        }
      } catch (e) {
        console.error('[FreightFox] Alternative settings also failed:', e);
      }
    }
    
    // Add a small delay before retrying
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  return {
    success: false,
    error: {
      code: 'max_retries_exceeded',
      message: `Failed to connect after ${maxRetries} attempts`
    },
    timestamp: new Date().toISOString()
  };
}

// Export connection helper functions
export default { testFirestoreConnection, ensureFirestoreConnection };
