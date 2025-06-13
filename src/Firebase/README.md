# Firebase Integration

This directory contains all Firebase-related functionality for FreightFox, including authentication, database operations, and admin tools.

## Directory Structure

- **`sharedConfig.js`**: Central configuration for Firebase that works in both browser and Node.js environments
- **`authTools.js`**: Authentication utilities for command line and programmatic use
- **`enforceAuthIdStrategy.js`**: Utilities to ensure consistent user ID management
- **`services.js`**: Core Firebase service functions used by the app
- **`tools/`**: Command line scripts and utilities for Firebase operations
  - See [Tools README](tools/README.md) for details on the available scripts

## Common Operations

### User Authentication

For user authentication, use the functions in `authTools.js` or the React context in `../Context/AuthContext.jsx`.

### Database Operations

For database operations, use the functions in `services.js` which provide a clean API for common operations.

### User ID Management

When working with user data, always use the Firebase Auth UID as the document ID in Firestore. Use the functions in `enforceAuthIdStrategy.js` to ensure consistent user ID management:

- `storeUserWithAuthId(user, additionalData)`: Creates or updates a user document using the Firebase Auth UID
- `getUserDocRef(userId)`: Gets a document reference to a user document using the correct ID pattern

For detailed guidance, see our [Firebase User Management Best Practices](docs/FirebaseUserManagement.md) guide.

### Data Fixes

When encountering data issues, use the command line tools in the `tools/` directory to diagnose and fix problems.

## Data Models

### Users

Users are stored in the `Users` collection with the document ID matching their Firebase Authentication UID.

### Orders

Orders are stored in the `Orders` collection and reference users via the `userId` field.

## Common Issues and Solutions

### User ID Mismatches

If users are experiencing authentication issues, it might be due to a mismatch between Firebase Auth UIDs and Firestore document IDs. Use these tools to help:

```bash
# Check for ID mismatches
npm run check-id-strategy

# Fix mismatches automatically
npm run fix-users
```

### Duplicate User Records

Some users may have duplicate records in the database. Use the fix-duplicates tool to merge these records:

```bash
npm run fix-duplicates
```
