import { seedData } from './seedData.js';

// Run this script to seed data
seedData()
  .then(result => {
    console.log('Seeding result:', result);
    if (typeof process !== 'undefined' && process.exit) {
      process.exit(0);
    }
  })
  .catch(error => {
    console.error('Seeding failed:', error);
    if (typeof process !== 'undefined' && process.exit) {
      process.exit(1);
    }
  });
