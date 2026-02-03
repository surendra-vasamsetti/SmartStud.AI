import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Export all user data as JSON
 * @param {string} userId - User ID
 * @returns {Promise<void>} - Triggers download
 */
export async function exportUserData(userId) {
  try {
    const userData = {};
    
    // Get user profile
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      userData.profile = userDoc.data();
    }
    
    // Get streak data
    const streakDoc = await getDoc(doc(db, 'streaks', userId));
    if (streakDoc.exists()) {
      userData.streaks = streakDoc.data();
    }
    
    // Get chat history (if nested under users)
    try {
      const chatHistoryRef = collection(db, 'users', userId, 'chatHistory');
      const chatSnapshot = await getDocs(chatHistoryRef);
      userData.chatHistory = chatSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (e) {
      console.log('No chat history found');
      userData.chatHistory = [];
    }
    
    // Add metadata
    userData.exportedAt = new Date().toISOString();
    userData.userId = userId;
    
    // Create JSON blob
    const jsonString = JSON.stringify(userData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `smartstud-data-${userId}-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Error exporting data:', error);
    throw new Error('Failed to export data: ' + error.message);
  }
}
