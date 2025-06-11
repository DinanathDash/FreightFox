#!/usr/bin/env node
/**
 * Command line script for Firebase authentication login
 */

import 'dotenv/config';
import { loginToFirebase, closePrompt } from '../authTools.js';

// Run the login process
loginToFirebase().then(success => {
  if (success) {
    console.log('Login successful!');
    console.log('You can now run Firebase admin operations');
  } else {
    console.log('Login failed or was cancelled');
  }
  closePrompt();
  process.exit(0);
}).catch(error => {
  console.error('Error during login:', error);
  closePrompt();
  process.exit(1);
});
