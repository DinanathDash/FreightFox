#!/usr/bin/env node
/**
 * Command line script to check user data in Firebase
 */

import 'dotenv/config';
import { checkUsers } from '../userTools.js';

// Run the check and exit when complete
checkUsers().then(() => {
  console.log('User check complete');
  process.exit(0);
}).catch(error => {
  console.error('Error running user check:', error);
  process.exit(1);
});
