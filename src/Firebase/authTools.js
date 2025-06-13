/**
 * Firebase Auth helper utilities for command line tools
 */

import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import readline from 'readline';
import { app } from './sharedConfig.js';

// Get the auth instance from the Firebase app
const auth = getAuth(app);

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Close the readline interface
 */
export function closePrompt() {
  if (rl && rl.close) {
    rl.close();
  }
}

/**
 * Function to prompt user for input
 * @param {string} question - The question to ask the user
 * @returns {Promise<string>} - The user's answer
 */
export function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

/**
 * Function to check if user is currently logged in
 * @returns {Promise<object|null>} - The current user or null if not logged in
 */
export function checkAuthStatus() {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
}

/**
 * Login to Firebase with email and password
 * @returns {Promise<boolean>} - Whether login was successful
 */
export async function loginToFirebase() {
  try {
    console.log('Firebase Authentication Login\n');
    
    // Check if already logged in
    const currentUser = await checkAuthStatus();
    
    if (currentUser) {
      console.log(`You are already logged in as ${currentUser.email}`);
      const logout = await prompt('Do you want to logout and login as a different user? (y/n): ');
      
      if (logout.toLowerCase() === 'y') {
        await auth.signOut();
        console.log('Logged out successfully');
      } else {
        console.log('Keeping current session');
        return true;
      }
    }
    
    // Get login credentials
    const email = await prompt('Enter your email: ');
    const password = await prompt('Enter your password: ');
    
    console.log('Logging in...');
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log(`Logged in successfully as ${userCredential.user.email}`);
      return true;
    } catch (error) {
      console.error('Login failed:', error.message);
      return false;
    }
  } catch (error) {
    console.error('Error during login process:', error);
    return false;
  }
}

/**
 * Close the readline interface
 */
export function closePrompt() {
  rl.close();
}

// Execute as command line script
if (import.meta.url === `file://${process.argv[1]}`) {
  loginToFirebase().finally(() => {
    closePrompt();
  });
}
