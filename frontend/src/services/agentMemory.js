import { db } from '../firebase';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  Timestamp 
} from 'firebase/firestore';

/**
 * Get student's AI agent memory profile
 */
export const getStudentMemory = async (userId) => {
  try {
    const memoryRef = doc(db, 'users', userId, 'agentMemory', 'profile');
    const snapshot = await getDoc(memoryRef);
    
    if (snapshot.exists()) {
      return snapshot.data();
    }
    
    // Initialize new memory profile
    const defaultMemory = {
      // Learning Profile
      learningStyle: null, // will be detected
      pace: 'medium',
      currentLevel: 'beginner',
      preferredExplanationStyle: 'balanced',
      
      // Performance Tracking
      strugglingConcepts: [],
      masteredConcepts: [],
      topicsInProgress: [],
      
      // Behavioral Patterns
      avgStudySessionLength: 0,
      preferredStudyTime: null,
      lastActiveDate: Timestamp.now(),
      studyStreak: 0,
      totalStudyTime: 0,
      totalQuizzesTaken: 0,
      
      // Goals & Motivations
      primaryGoal: null,
      targetCompletionDate: null,
      motivationLevel: 'medium',
      
      // Agent State
      lastCheckIn: null,
      nextScheduledCheckIn: null,
      pendingRecommendations: [],
      conversationContext: null,
      
      // Metadata
      createdAt: Timestamp.now(),
      lastUpdated: Timestamp.now()
    };
    
    await setDoc(memoryRef, defaultMemory);
    return defaultMemory;
  } catch (error) {
    console.error('Error getting student memory:', error);
    throw error;
  }
};

/**
 * Update student memory
 */
export const updateStudentMemory = async (userId, updates) => {
  try {
    const memoryRef = doc(db, 'users', userId, 'agentMemory', 'profile');
    await updateDoc(memoryRef, {
      ...updates,
      lastUpdated: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating student memory:', error);
    throw error;
  }
};

/**
 * Add a struggling concept
 */
export const addStrugglingConcept = async (userId, concept) => {
  try {
    const memory = await getStudentMemory(userId);
    const struggling = memory.strugglingConcepts || [];
    
    // Check if concept already exists
    const existingIndex = struggling.findIndex(c => c.topic === concept.topic);
    
    if (existingIndex >= 0) {
      // Update existing
      struggling[existingIndex] = {
        ...struggling[existingIndex],
        attempts: (struggling[existingIndex].attempts || 0) + 1,
        avgScore: concept.score,
        lastAttempt: Timestamp.now()
      };
    } else {
      // Add new
      struggling.push({
        topic: concept.topic,
        attempts: 1,
        avgScore: concept.score,
        lastAttempt: Timestamp.now()
      });
    }
    
    await updateStudentMemory(userId, { strugglingConcepts: struggling });
  } catch (error) {
    console.error('Error adding struggling concept:', error);
  }
};

/**
 * Add a mastered concept
 */
export const addMasteredConcept = async (userId, topic, score) => {
  try {
    const memory = await getStudentMemory(userId);
    const mastered = memory.masteredConcepts || [];
    
    // Check if not already mastered
    if (!mastered.find(c => c.topic === topic)) {
      mastered.push({
        topic,
        avgScore: score,
        masteredAt: Timestamp.now()
      });
      
      // Remove from struggling concepts if present
      const struggling = memory.strugglingConcepts || [];
      const updatedStruggling = struggling.filter(c => c.topic !== topic);
      
      await updateStudentMemory(userId, { 
        masteredConcepts: mastered,
        strugglingConcepts: updatedStruggling
      });
    }
  } catch (error) {
    console.error('Error adding mastered concept:', error);
  }
};

/**
 * Update study streak
 */
export const updateStudyStreak = async (userId) => {
  try {
    const memory = await getStudentMemory(userId);
    const lastActive = memory.lastActiveDate?.toDate();
    const now = new Date();
    
    if (lastActive) {
      const daysDiff = Math.floor((now - lastActive) / (1000 * 60 * 60 * 24));
      
      let newStreak = memory.studyStreak || 0;
      
      if (daysDiff === 0) {
        // Same day, no change
        return;
      } else if (daysDiff === 1) {
        // Consecutive day, increment
        newStreak += 1;
      } else {
        // Streak broken
        newStreak = 1;
      }
      
      await updateStudentMemory(userId, {
        studyStreak: newStreak,
        lastActiveDate: Timestamp.now()
      });
    } else {
      await updateStudentMemory(userId, {
        studyStreak: 1,
        lastActiveDate: Timestamp.now()
      });
    }
  } catch (error) {
    console.error('Error updating study streak:', error);
  }
};

/**
 * Add study time
 */
export const addStudyTime = async (userId, durationSeconds) => {
  try {
    const memory = await getStudentMemory(userId);
    const totalTime = (memory.totalStudyTime || 0) + durationSeconds;
    
    await updateStudentMemory(userId, {
      totalStudyTime: totalTime
    });
  } catch (error) {
    console.error('Error adding study time:', error);
  }
};

/**
 * Detect learning style from behavior
 * (This is a simplified version - would be more sophisticated in production)
 */
export const detectLearningStyle = async (userId) => {
  try {
    // In a real implementation, this would analyze:
    // - Time spent on videos vs text
    // - Quiz performance after different content types
    // - User preferences from interactions
    
    // For now, return a placeholder
    const styles = ['visual', 'auditory', 'kinesthetic', 'reading'];
    const detectedStyle = styles[Math.floor(Math.random() * styles.length)];
    
    await updateStudentMemory(userId, {
      learningStyle: detectedStyle
    });
    
    return detectedStyle;
  } catch (error) {
    console.error('Error detecting learning style:', error);
    return 'balanced';
  }
};

/**
 * Get student insights (formatted for display)
 */
export const getStudentInsights = async (userId) => {
  try {
    const memory = await getStudentMemory(userId);
    
    return {
      profile: {
        level: memory.currentLevel,
        style: memory.learningStyle || 'Detecting...',
        pace: memory.pace
      },
      progress: {
        studyStreak: memory.studyStreak,
        totalStudyTime: Math.floor(memory.totalStudyTime / 3600), // hours
        quizzesTaken: memory.totalQuizzesTaken
      },
      performance: {
        struggling: memory.strugglingConcepts?.length || 0,
        mastered: memory.masteredConcepts?.length || 0,
        inProgress: memory.topicsInProgress?.length || 0
      },
      goals: {
        primary: memory.primaryGoal || 'Not set',
        motivation: memory.motivationLevel
      }
    };
  } catch (error) {
    console.error('Error getting student insights:', error);
    return null;
  }
};

/**
 * Set student goal
 */
export const setStudentGoal = async (userId, goal, targetDate = null) => {
  try {
    await updateStudentMemory(userId, {
      primaryGoal: goal,
      targetCompletionDate: targetDate ? Timestamp.fromDate(new Date(targetDate)) : null
    });
  } catch (error) {
    console.error('Error setting student goal:', error);
    throw error;
  }
};
