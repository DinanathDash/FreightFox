#!/usr/bin/env node
/**
 * Command line script to fix user ID mismatches in Firebase
 */

import 'dotenv/config';
import { 
  detectUserIdMismatches,
  fixUserIdMismatches,
  closeFixTools
} from '../userFixTools.js';
import { loginToFirebase, closePrompt } from '../authTools.js';

async function fixUsers() {
  try {
    // Ensure we're authenticated
    const loggedIn = await loginToFirebase();
    if (!loggedIn) {
      console.log('You need to be logged in to fix user IDs');
      closePrompt();
      return;
    }
    
    // Detect mismatches
    const mismatchedUsers = await detectUserIdMismatches();
    
    // Fix mismatched users
    if (mismatchedUsers.length > 0) {
      await fixUserIdMismatches(mismatchedUsers);
    } else {
      console.log('No user ID mismatches detected');
    }
    
    console.log('User ID fix process completed');
    closePrompt();
    closeFixTools();
  } catch (error) {
    console.error('Error fixing user IDs:', error);
    closePrompt();
    closeFixTools();
  }
}

// Execute the script
fixUsers();
