import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Sparkles, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const GenerationContext = createContext();
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Simple Toast Notification Component
const GenerationToast = ({ message, onClose }) => (
  <motion.div
    initial={{ opacity: 0, y: 50, x: -50 }}
    animate={{ opacity: 1, y: 0, x: 0 }}
    exit={{ opacity: 0, scale: 0.9 }}
    className="fixed bottom-6 right-6 bg-white rounded-xl shadow-2xl p-4 flex items-center gap-4 z-[10000] border border-purple-100 max-w-sm"
  >
    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 flex-shrink-0">
       <CheckCircle size={24} />
    </div>
    <div className="flex-1">
        <h4 className="font-bold text-gray-800 text-sm">Content Generated!</h4>
        <p className="text-xs text-gray-500">{message}</p>
    </div>
    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">×</button>
  </motion.div>
);

export function GenerationProvider({ children }) {
  const [activeGenerations, setActiveGenerations] = useState({}); // { courseId: { progress: 0, status: 'generating' } }
  const [toast, setToast] = useState(null);

  const startGeneration = useCallback(async (courseId) => {
      // 1. Initial State
      setActiveGenerations(prev => ({
          ...prev,
          [courseId]: { progress: 0, status: 'starting' }
      }));

      // 2. Trigger API
      try {
          const response = await fetch(`${API_URL}/api/courses/generate-content`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ courseId })
          });
          
          if (!response.ok) throw new Error("Failed to start");
          
          setActiveGenerations(prev => ({
              ...prev,
              [courseId]: { progress: 5, status: 'generating' }
          }));

      } catch (error) {
          console.error("Generation start error", error);
          setActiveGenerations(prev => {
              const newState = { ...prev };
              delete newState[courseId];
              return newState;
          });
          return;
      }
  }, []);

  const stopGeneration = useCallback((courseId) => {
      setActiveGenerations(prev => {
          const newState = { ...prev };
          delete newState[courseId];
          return newState;
      });
  }, []);

  // Polling Logic
  useEffect(() => {
      const activeIds = Object.keys(activeGenerations);
      if (activeIds.length === 0) return;

      const pollInterval = setInterval(async () => {
          for (const courseId of activeIds) {
              try {
                  const res = await fetch(`${API_URL}/api/courses/${courseId}`);
                  const data = await res.json();
                  
                  if (data.success) {
                      const updatedCourse = data.course;
                      
                      // Calculate real progress
                      let totalTopics = 0;
                      let completedTopics = 0;
                      
                      updatedCourse.chapters.forEach(ch => {
                          ch.topics.forEach(t => {
                              totalTopics++;
                              if (t.content && t.content.length > 50) completedTopics++;
                          });
                      });
                      
                      const progress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
                      console.log(`[GenerationContext] Polling ${courseId}: ${progress}% (Status: ${updatedCourse.status})`);

                      // Check completion
                      if (updatedCourse.status === 'published' || progress >= 100) {
                          console.log(`[GenerationContext] COMPLETE! Showing toast.`);
                          // Complete!
                          setActiveGenerations(prev => {
                              const newState = { ...prev };
                              delete newState[courseId];
                              return newState;
                          });

                          // Show Toast
                          setToast({
                             message: `"${updatedCourse.title}" is ready for you to learn.`,
                             id: Date.now()
                          });
                          
                          // Auto hide toast
                          setTimeout(() => setToast(null), 5000);

                      } else {
                          // Update Progress
                          setActiveGenerations(prev => ({
                              ...prev,
                              [courseId]: { progress, status: 'generating' }
                          }));
                      }
                  }
              } catch (err) {
                  console.error("Polling error for", courseId, err);
              }
          }
      }, 3000); // Check every 3 seconds

      return () => clearInterval(pollInterval);
  }, [activeGenerations]);

  return (
    <GenerationContext.Provider value={{ activeGenerations, startGeneration, stopGeneration }}>
      {children}
      <AnimatePresence>
        {toast && <GenerationToast message={toast.message} onClose={() => setToast(null)} />}
      </AnimatePresence>
    </GenerationContext.Provider>
  );
}

export function useGeneration() {
  return useContext(GenerationContext);
}
