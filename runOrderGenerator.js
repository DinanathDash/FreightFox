#!/usr/bin/env node

/**
 * This script loads the .env file and then runs the order generator
 */

// Import and configure dotenv first
import 'dotenv/config';

// Then import and run the order generator
import { generateOrdersForAllUsers } from './src/Firebase/orderGenerator.js';

console.log("Starting order generation script...");

generateOrdersForAllUsers()
  .then(result => {
    console.log("Order generation completed:", result);
    process.exit(0);
  })
  .catch(error => {
    console.error("Order generation failed:", error);
    process.exit(1);
  });
