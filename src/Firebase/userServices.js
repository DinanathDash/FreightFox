import { db } from './sharedConfig';
import { doc, updateDoc, deleteDoc, collection, query, where, getDocs, writeBatch } from 'firebase/firestore';

/**
 * Update user profile in Firestore
 * @param {string} userId - The user ID to update
 * @param {Object} profileData - Profile data to update
 */
export async function updateUserProfile(userId, profileData) {
  try {
    const userRef = doc(db, 'Users', userId);
    await updateDoc(userRef, profileData);
    return { success: true };
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

/**
 * Delete a user account and all related data
 * @param {string} userId - The user ID to delete
 */
export async function deleteUserAccount(userId) {
  try {
    // Create a batch
    const batch = writeBatch(db);
    
    // Delete user's orders
    const ordersQuery = query(collection(db, 'Orders'), where('userId', '==', userId));
    const ordersSnapshot = await getDocs(ordersQuery);
    
    ordersSnapshot.forEach((orderDoc) => {
      batch.delete(orderDoc.ref);
    });
    
    // Delete user's tickets if any
    const ticketsQuery = query(collection(db, 'Tickets'), where('userId', '==', userId));
    const ticketsSnapshot = await getDocs(ticketsQuery);
    
    ticketsSnapshot.forEach((ticketDoc) => {
      batch.delete(ticketDoc.ref);
    });
    
    // Commit the batch
    await batch.commit();
    
    // Delete the user document itself
    await deleteDoc(doc(db, 'Users', userId));
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting user account:', error);
    throw error;
  }
}
