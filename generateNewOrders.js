#!/usr/bin/env node

/**
 * This is a command-line script to generate orders with the new from/to structure
 * Run this directly with Node.js:
 * node generateNewOrders.js
 */
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
