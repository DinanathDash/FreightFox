#!/usr/bin/env node
/**
 * Command line script to fix duplicate users in Firebase
 */

import 'dotenv/config';
import { 
  findDuplicateUsers, 
  mergeDuplicateUsers,
  closeFixTools
} from '../userFixTools.js';
import { loginToFirebase, closePrompt } from '../authTools.js';

async function fixDuplicateUsers() {
  try {
    // Ensure we're authenticated
    const loggedIn = await loginToFirebase();
    if (!loggedIn) {
      console.log('You need to be logged in to fix duplicate users');
      closePrompt();
      return;
    }
    
    // Find duplicates
    const duplicatesByEmail = await findDuplicateUsers();
    
    // Fix duplicate users one by one
    await mergeDuplicateUsers(duplicatesByEmail);
    
    console.log('Duplicate user fix process completed');
    closePrompt();
    closeFixTools();
  } catch (error) {
    console.error('Error fixing duplicate users:', error);
    closePrompt();
    closeFixTools();
  }
}

// Execute the script
fixDuplicateUsers();
