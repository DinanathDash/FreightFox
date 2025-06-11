# Firebase User Management Best Practices

This document outlines the best practices for handling user management in our Firebase-based application, especially focusing on the proper use of Firebase Authentication UIDs.

## The Problem & Solution

### Problem

Previously, we were creating Firestore user documents with:
- **Local UIDs**: Generated as `user_${random}` in some files
- **Auto-generated IDs**: Using `addDoc()` which creates random document IDs
- **Firebase Auth UIDs**: The correct approach, but not consistently implemented

This caused ID mismatches between Firebase Authentication and Firestore, leading to issues like:
- "User with ID KQ8cAlq1yiVXDvGFGY88P0AcOPv1 not found" errors
- Authentication sessions not being recognized
- Duplicate user records

### Solution

We've implemented a comprehensive solution:
1. **Auth UID Enforcement**: Always use Firebase Auth UIDs as document IDs
2. **Utility Functions**: Created enforceAuthIdStrategy.js to provide consistent user management
3. **Script Tools**: Added tools to detect and fix mismatches
4. **Documentation**: Created this guide for consistent implementation

## Best Practices

### 1. User Creation and Updates

When creating or updating users:

✅ **DO**:
- Use `storeUserWithAuthId(user, additionalData)` from enforceAuthIdStrategy.js
- Always use the Firebase Auth UID as the document ID
- Include the `uid` field in the user document data (same as the document ID)

❌ **DON'T**:
- Generate your own user IDs (`user_${random}`)
- Use `addDoc()` which creates random document IDs
- Create user documents without the uid field

### 2. User References

When referencing users:

✅ **DO**:
- Use `getUserDocRef(userId)` from enforceAuthIdStrategy.js to get document references
- Always pass the Firebase Auth UID to functions that need a user ID
- Use the `uid` field when querying for users

❌ **DON'T**:
- Use locally generated IDs to reference users
- Mix different ID formats across the application

### 3. Orders and Related Documents

When creating orders or other documents that reference users:

✅ **DO**:
- Store the Firebase Auth UID in the `userId` field
- Ensure consistency by getting the ID from the authenticated user object

❌ **DON'T**:
- Create references to documents with locally generated IDs
- Use email as the primary way to identify users (use it as a secondary identifier only)

## Implementation Guide

### Creating New Users

```javascript
import { storeUserWithAuthId } from '../Firebase/enforceAuthIdStrategy.js';

// After Firebase Auth user creation
const user = userCredential.user;
const additionalData = {
  name: displayName,
  phone: phoneNumber,
  // other fields
};

// This will create a document with the user's UID as the document ID
await storeUserWithAuthId(user, additionalData);
```

### Updating User Data

```javascript
import { storeUserWithAuthId } from '../Firebase/enforceAuthIdStrategy.js';
import { auth } from '../Firebase/sharedConfig.js';

const user = auth.currentUser;
const updates = {
  address: newAddress,
  phone: newPhone
};

// This will update the user document while preserving the correct ID structure
await storeUserWithAuthId(user, updates);
```

### Getting User Data

```javascript
import { getUserDocRef } from '../Firebase/enforceAuthIdStrategy.js';

// Get a reference to the user document
const userRef = getUserDocRef(userId);
const userSnap = await getDoc(userRef);
```

## Verifying Implementation

You can verify that the user ID strategy is correctly implemented by running:

```bash
npm run check-id-strategy
```

This command will:
1. Check for any remaining mismatches
2. Provide guidance on fixing them
3. Confirm that the implementation is correct

## Conclusion

By following these best practices, we ensure that:
1. Users have a consistent experience
2. Authentication works correctly
3. We avoid the ID mismatch errors that were occurring before
