# Firebase Tools

This directory contains utility scripts and tools for managing Firebase authentication and database operations for FreightFox.

## Available Tools

### Authentication Tools (`authTools.js`)
- Firebase authentication utilities
- Command-line login helpers
- Authentication status checking

### User Management Tools (`userTools.js`)
- User data verification utilities
- Diagnostic tools for finding user data issues
- Consistency checks for user accounts

### User Fix Tools (`userFixTools.js`)
- Tools for fixing Firebase Auth and Firestore synchronization issues
- User ID mismatch correction
- Duplicate user handling
- Order reference updating

## Command Line Scripts

Run these scripts using npm commands from the project root directory:

| Script | Command | Description |
|--------|---------|-------------|
| Login to Firebase | `npm run login` | Authenticate with Firebase for admin operations |
| Check Users | `npm run check-users` | Analyze user data for potential issues |
| Check ID Strategy | `npm run check-id-strategy` | Verify that all users have Firebase Auth UIDs as document IDs |
| Fix User IDs | `npm run fix-users` | Fix user ID mismatches between Auth and Firestore |
| Fix Duplicate Users | `npm run fix-duplicates` | Merge and fix duplicate user accounts |
| Fix Order References | `npm run fix-orders` | Update order documents with correct user references |
| Generate Test Orders | `npm run generate-orders` | Generate test orders for all users |

### Shell Scripts

The following scripts can be run directly from the command line:

```bash
# Generate test orders with improved user interface
./src/Firebase/tools/generate-orders.sh
```

## Common Issues Fixed

1. **User ID Mismatches**: Fixes cases where local UIDs don't match Firebase Auth UIDs
2. **Duplicate Users**: Merges multiple user records with the same email
3. **Order References**: Updates order documents to reference the correct user IDs
