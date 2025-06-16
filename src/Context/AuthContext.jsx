import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db } from '../Firebase/shared/sharedConfig';
import { storeUserWithAuthId } from '../Firebase/development/enforceAuthIdStrategy.js';

// Session timeout in milliseconds (30 minutes)
const SESSION_TIMEOUT = 30 * 60 * 1000;

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionExpiry, setSessionExpiry] = useState(null);
  const [isSessionActive, setIsSessionActive] = useState(true);
  
  // Timer reference to track user inactivity
  const sessionTimeoutRef = useRef(null);
  
  // Update user profile with photo URL
  const updateUserProfile = async (user, updates) => {
    try {
      await updateProfile(user, updates);
      setCurrentUser({ ...user });
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };
  
  // Function to ensure user exists in Firestore with correct UID
  const syncUserWithFirestore = async (user) => {
    if (!user) return null;
    
    try {
      // Use our enforceAuthIdStrategy to properly store the user with Firebase Auth UID
      const additionalData = {
        // Set additional user properties
        name: user.displayName || (user.email ? user.email.split('@')[0] : ''),
        profilePhoto: user.photoURL || null,
        phone: user.phoneNumber || '',
        lastLogin: serverTimestamp()
      };
      
      // This will create a new user or update an existing one using the Auth UID as document ID
      await storeUserWithAuthId(user, additionalData);
      
      return user;
    } catch (error) {
      console.error("Error syncing user with Firestore:", error);
      return user; // Return user even if sync fails to not break authentication
    }
  };
  
  async function signup(email, password, name) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update profile with the user's name if provided
    if (name) {
      await updateProfile(userCredential.user, {
        displayName: name
      });
    }
    
    // Ensure user exists in Firestore with correct UID
    await syncUserWithFirestore(userCredential.user);
    
    return userCredential;
  }

  async function login(email, password) {
    const result = await signInWithEmailAndPassword(auth, email, password);
    
    // Ensure user exists in Firestore with correct UID
    await syncUserWithFirestore(result.user);
    
    startSessionTimer();
    return result;
  }

  function logout() {
    clearSessionTimer();
    setSessionExpiry(null);
    setIsSessionActive(true);
    return signOut(auth);
  }

  async function googleSignIn() {
    const provider = new GoogleAuthProvider();
    
    // Request additional user profile information
    provider.addScope('profile');
    provider.addScope('email');
    
    const result = await signInWithPopup(auth, provider);
    
    // Sync Google user with Firestore
    await syncUserWithFirestore(result.user);
    
    console.log("Google sign in successful with profile.");
    
    startSessionTimer();
    return result;
  }
  
  // Start or reset the session timer
  const startSessionTimer = useCallback(() => {
    clearSessionTimer();
    
    const expiry = Date.now() + SESSION_TIMEOUT;
    setSessionExpiry(expiry);
    
    sessionTimeoutRef.current = setTimeout(() => {
      setIsSessionActive(false);
      logout();
    }, SESSION_TIMEOUT);
  }, []);
  
  // Clear the session timeout
  const clearSessionTimer = () => {
    if (sessionTimeoutRef.current) {
      clearTimeout(sessionTimeoutRef.current);
    }
  };
  
  // Reset the timer on user activity
  const resetSessionTimer = useCallback(() => {
    if (currentUser && isSessionActive) {
      startSessionTimer();
    }
  }, [currentUser, isSessionActive, startSessionTimer]);
  
  // Update profile picture
  const updateProfilePicture = async (photoURL) => {
    if (!currentUser) return;
    
    await updateUserProfile(currentUser, { photoURL });
  };

  function resetPassword(email) {
    return sendPasswordResetEmail(auth, email);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        startSessionTimer();
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
      clearSessionTimer();
    };
  }, [startSessionTimer]);

  // Set up activity listeners to reset the timer
  useEffect(() => {
    if (!currentUser) return;
    
    // Events to listen for user activity
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    // Throttle function to avoid excessive resets
    let timeoutId = null;
    const throttledResetTimer = () => {
      if (!timeoutId) {
        timeoutId = setTimeout(() => {
          resetSessionTimer();
          timeoutId = null;
        }, 5000); // Throttle to once every 5 seconds
      }
    };
    
    // Add event listeners
    activityEvents.forEach(event => {
      window.addEventListener(event, throttledResetTimer);
    });
    
    // Clean up
    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, throttledResetTimer);
      });
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [currentUser, resetSessionTimer]);

  const value = {
    currentUser,
    signup,
    login,
    logout,
    googleSignIn,
    resetPassword,
    updateProfilePicture,
    isSessionActive,
    sessionExpiry,
    resetSessionTimer
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
