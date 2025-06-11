#!/usr/bin/env node
/**
 * Command line script to fix order user references in Firebase
 */

import 'dotenv/config';
import { 
  updateOrderUserReferences,
  closeFixTools
} from '../userFixTools.js';
import { loginToFirebase, closePrompt } from '../authTools.js';

async function fixOrders() {
  try {
    // Ensure we're authenticated
    const loggedIn = await loginToFirebase();
    if (!loggedIn) {
      console.log('You need to be logged in to fix order user references');
      closePrompt();
      return;
    }
    
    // Update orders with correct user references
    await updateOrderUserReferences();
    
    console.log('Order user reference update process completed');
    closePrompt();
    closeFixTools();
  } catch (error) {
    console.error('Error fixing order user references:', error);
    closePrompt();
    closeFixTools();
  }
}

// Execute the script
fixOrders();
