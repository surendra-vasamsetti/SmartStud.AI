import { useState, useEffect } from 'react';
import { 
  getUserConversations,
  getConversationHistory,
  createConversation,
  deleteAllConversations 
} from '../services/conversationStorage';

/**
 * Hook to manage conversation history
 */
export function useConversationHistory(userId) {
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load all conversations
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    loadConversations();
  }, [userId]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const convos = await getUserConversations(userId);
      setConversations(convos);
      setError(null);
    } catch (err) {
      console.error('Error loading conversations:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadConversation = async (conversationId) => {
    try {
      setLoading(true);
      const msgs = await getConversationHistory(userId, conversationId);
      setMessages(msgs);
      setCurrentConversation(conversationId);
      setError(null);
    } catch (err) {
      console.error('Error loading conversation:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const startNewConversation = async (topic = 'General Chat') => {
    try {
      const conversationId = await createConversation(userId, topic);
      setCurrentConversation(conversationId);
      setMessages([]);
      await loadConversations(); // Refresh list
      return conversationId;
    } catch (err) {
      console.error('Error creating conversation:', err);
      setError(err.message);
      return null;
    }
  };

  const refreshConversations = () => {
    loadConversations();
  };

  const refreshMessages = () => {
    if (currentConversation) {
      loadConversation(currentConversation);
    }
  };

  const clearAllHistory = async () => {
    try {
      setLoading(true);
      await deleteAllConversations(userId);
      setConversations([]);
      setMessages([]);
      setCurrentConversation(null);
    } catch (err) {
      console.error('Error clearing history:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    conversations,
    currentConversation,
    messages,
    loading,
    error,
    loadConversation,
    startNewConversation,
    refreshConversations,
    refreshMessages,
    clearAllHistory
  };
}
