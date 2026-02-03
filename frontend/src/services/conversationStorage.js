import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  doc,
  getDoc,
  getDocs,
  query, 
  orderBy, 
  limit,
  updateDoc,
  setDoc,
  deleteDoc,
  writeBatch,
  Timestamp,
  where
} from 'firebase/firestore';

// ... (existing helper functions)

/**
 * Delete a conversation
 */
export const deleteConversation = async (userId, conversationId) => {
  try {
    const conversationRef = doc(db, 'users', userId, 'conversations', conversationId);
    await deleteDoc(conversationRef);
  } catch (error) {
    console.error('Error deleting conversation:', error);
    throw error;
  }
};

/**
 * Delete ALL conversations for a user
 */
export const deleteAllConversations = async (userId) => {
  if (!userId) return;

  try {
    const conversationsRef = collection(db, 'users', userId, 'conversations');
    const snapshot = await getDocs(conversationsRef);
    
    if (snapshot.empty) return;

    // Batch delete (limit 500 per batch)
    const batch = writeBatch(db);
    
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    console.log(`Deleted ${snapshot.docs.length} conversations`);
  } catch (error) {
    console.error('Error clearing history:', error);
    throw error;
  }
};

/**
 * Save a message to a conversation
 */
export const saveMessage = async (userId, conversationId, message) => {
  if (!userId || !conversationId) {
    console.error("saveMessage called with missing IDs", { userId, conversationId });
    throw new Error("Missing user ID or conversation ID");
  }

  try {
    const messagesRef = collection(
      db, 
      'users', 
      userId, 
      'conversations', 
      conversationId, 
      'messages'
    );
    
    // ... rest of function ...
    
    const messageData = {
      role: message.role, // 'user' | 'assistant' | 'system'
      content: message.content,
      timestamp: Timestamp.now(),
      metadata: message.metadata || {}
    };
    
    const docRef = await addDoc(messagesRef, messageData);
    
    // Update conversation's last message time
    await updateConversationMetadata(userId, conversationId);
    
    return docRef.id;
  } catch (error) {
    console.error('Error saving message:', error);
    throw error;
  }
};

/**
 * Get conversation history
 */
export const getConversationHistory = async (userId, conversationId, messageLimit = 50) => {
  if (!userId || !conversationId) return [];

  try {
    const messagesRef = collection(
      db, 
      'users', 
      userId, 
      'conversations', 
      conversationId, 
      'messages'
    );
    
    // ... rest of function
    const q = query(
      messagesRef, 
      orderBy('timestamp', 'desc'), 
      limit(messageLimit)
    );
    
    const snapshot = await getDocs(q);
    
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Return in chronological order (oldest first)
    return messages.reverse();
  } catch (error) {
    console.error('Error getting conversation history:', error);
    return [];
  }
};

/**
 * Get all conversations for a user
 */
export const getUserConversations = async (userId) => {
  if (!userId) return [];

  try {
    const conversationsRef = collection(db, 'users', userId, 'conversations');
    const q = query(conversationsRef, orderBy('lastMessageAt', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting conversations:', error);
    return [];
  }
};

/**
 * Create a new conversation
 */
export const createConversation = async (userId, topic = 'General Chat') => {
  if (!userId) {
     console.error("createConversation called with missing userId");
     throw new Error("Missing user ID");
  }

  try {
    const conversationsRef = collection(db, 'users', userId, 'conversations');
    
    const conversationData = {
      title: topic,
      topic: topic,
      startedAt: Timestamp.now(),
      lastMessageAt: Timestamp.now(),
      messageCount: 0,
      summary: null
    };
    
    const docRef = await addDoc(conversationsRef, conversationData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating conversation:', error);
    throw error;
  }
};

/**
 * Update conversation metadata
 */
const updateConversationMetadata = async (userId, conversationId) => {
  try {
    const conversationRef = doc(db, 'users', userId, 'conversations', conversationId);
    const conversationSnap = await getDoc(conversationRef);
    
    if (conversationSnap.exists()) {
      const currentCount = conversationSnap.data().messageCount || 0;
      await updateDoc(conversationRef, {
        lastMessageAt: Timestamp.now(),
        messageCount: currentCount + 1
      });
    }
  } catch (error) {
    console.error('Error updating conversation metadata:', error);
  }
};

/**
 * Get conversation by ID
 */
export const getConversation = async (userId, conversationId) => {
  try {
    const conversationRef = doc(db, 'users', userId, 'conversations', conversationId);
    const snapshot = await getDoc(conversationRef);
    
    if (snapshot.exists()) {
      return {
        id: snapshot.id,
        ...snapshot.data()
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting conversation:', error);
    return null;
  }
};

/**
 * Update conversation title
 */
export const updateConversationTitle = async (userId, conversationId, title) => {
  try {
    const conversationRef = doc(db, 'users', userId, 'conversations', conversationId);
    await updateDoc(conversationRef, { title });
  } catch (error) {
    console.error('Error updating conversation title:', error);
    throw error;
  }
};

/**
 * Generate conversation summary using AI
 */
export const generateConversationSummary = async (messages) => {
  try {
    // Get first and last few messages for context
    const contextMessages = [
      ...messages.slice(0, 3),
      ...messages.slice(-3)
    ];
    
    const conversationText = contextMessages
      .map(m => `${m.role}: ${m.content}`)
      .join('\n');
    
    // In a real implementation, you'd call Gemini API here
    // For now, return a simple summary
    const topics = extractTopics(contextMessages);
    return `Discussed: ${topics.join(', ')}`;
  } catch (error) {
    console.error('Error generating summary:', error);
    return 'Chat conversation';
  }
};

/**
 * Extract topics from messages (simple keyword extraction)
 */
function extractTopics(messages) {
  const keywords = new Set();
  const commonWords = new Set(['the', 'a', 'an', 'how', 'what', 'why', 'when', 'where', 'is', 'are', 'can', 'do', 'does']);
  
  messages.forEach(msg => {
    if (msg.role === 'user') {
      const words = msg.content.toLowerCase().split(/\s+/);
      words.forEach(word => {
        const cleaned = word.replace(/[^a-z]/g, '');
        if (cleaned.length > 4 && !commonWords.has(cleaned)) {
          keywords.add(cleaned);
        }
      });
    }
  });
  
  return Array.from(keywords).slice(0, 3);
}

/**
 * Delete a conversation
 */

