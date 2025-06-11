#!/usr/bin/env node
/**
 * Command line script to generate test orders
 */

import 'dotenv/config';
import { generateOrdersForAllUsers } from '../orderGenerator.js';

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
