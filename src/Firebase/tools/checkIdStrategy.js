#!/usr/bin/env node
/**
 * Command line script to check for ID mismatches and prevent future issues
 */

import 'dotenv/config';
import { findUserIdMismatches } from '../enforceAuthIdStrategy.js';
import { loginToFirebase, closePrompt } from '../authTools.js';

async function checkIdStrategy() {
  try {
    // Ensure we're authenticated
    const loggedIn = await loginToFirebase();
    if (!loggedIn) {
      console.log('You need to be logged in to check ID mismatches');
      closePrompt();
      return;
    }
    
    console.log('==============================================');
    console.log('Firebase Auth ID Strategy Check');
    console.log('==============================================');
    console.log('Checking for user ID mismatches between Firebase Auth and Firestore...');
    
    // Find any remaining user ID mismatches
    const mismatchedUsers = await findUserIdMismatches();
    
    if (mismatchedUsers.length > 0) {
      console.log('\n❌ Found user ID mismatches:');
      mismatchedUsers.forEach(user => {
        console.log(`- ${user.email || user.displayName || 'Unknown'}`);
        console.log(`  Document ID: ${user.id}`);
        console.log(`  Firebase Auth UID: ${user.uid}`);
        console.log('  Run "npm run fix-users" to fix these mismatches');
      });
      
      console.log(`\n${mismatchedUsers.length} users need fixing.`);
    } else {
      console.log('\n✅ No user ID mismatches found! All users are using Firebase Auth UIDs.');
    }
    
    console.log('\nReminders for proper Firebase Auth ID usage:');
    console.log('1. Always use the user.uid from Firebase Auth as the document ID in Firestore');
    console.log('2. Include the uid field in the user document for consistency');
    console.log('3. Use the enforceAuthIdStrategy.js utilities to create or update users');
    
    console.log('\n==============================================');
    closePrompt();
  } catch (error) {
    console.error('Error checking ID strategy:', error);
    closePrompt();
  }
}

// Execute the script
checkIdStrategy();
