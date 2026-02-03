import { useState, useEffect } from 'react';
import { 
  getStudentMemory, 
  updateStudentMemory,
  getStudentInsights 
} from '../services/agentMemory';

/**
 * Hook to access and update student memory
 */
export function useAgentMemory(userId) {
  const [memory, setMemory] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load memory on mount
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    loadMemory();
  }, [userId]);

  const loadMemory = async () => {
    try {
      setLoading(true);
      const data = await getStudentMemory(userId);
      setMemory(data);
      
      const insightsData = await getStudentInsights(userId);
      setInsights(insightsData);
      
      setError(null);
    } catch (err) {
      console.error('Error loading memory:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateMemory = async (updates) => {
    try {
      await updateStudentMemory(userId, updates);
      // Reload to get updated data
      await loadMemory();
    } catch (err) {
      console.error('Error updating memory:', err);
      setError(err.message);
    }
  };

  const refresh = () => {
    loadMemory();
  };

  return {
    memory,
    insights,
    loading,
    error,
    updateMemory,
    refresh
  };
}
