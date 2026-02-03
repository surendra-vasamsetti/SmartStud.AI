import { collection, addDoc, query, orderBy, limit, getDocs, where, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Save quiz result to Firestore
 * @param {string} uid - User ID
 * @param {object} quizData - Quiz result data
 * @returns {Promise<string>} - Document ID of saved quiz
 */
export async function saveQuizResult(uid, quizData) {
  try {
    const quizResult = {
      subject: quizData.subject || 'General',
      topics: quizData.topics || [],
      score: quizData.score || 0,
      totalQuestions: quizData.totalQuestions || 0,
      correctAnswers: quizData.correctAnswers || 0,
      incorrectQuestions: quizData.incorrectQuestions || [],
      timeSpent: quizData.timeSpent || 0,
      difficulty: quizData.difficulty || 'medium',
      timestamp: Timestamp.now()
    };

    const docRef = await addDoc(
      collection(db, 'users', uid, 'quizResults'),
      quizResult
    );

    console.log('Quiz result saved:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error saving quiz result:', error);
    throw error;
  }
}

/**
 * Get quiz history for a user
 * @param {string} uid - User ID
 * @param {number} limitCount - Number of quizzes to fetch
 * @returns {Promise<Array>} - Array of quiz results
 */
export async function getQuizHistory(uid, limitCount = 10) {
  try {
    const q = query(
      collection(db, 'users', uid, 'quizResults'),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const quizzes = [];

    querySnapshot.forEach((doc) => {
      quizzes.push({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate()
      });
    });

    return quizzes;
  } catch (error) {
    console.error('Error fetching quiz history:', error);
    return [];
  }
}

/**
 * Get quiz statistics by subject
 * @param {string} uid - User ID
 * @param {string} subject - Subject name
 * @returns {Promise<object>} - Quiz stats
 */
export async function getQuizStatsBySubject(uid, subject) {
  try {
    const q = query(
      collection(db, 'users', uid, 'quizResults'),
      where('subject', '==', subject),
      orderBy('timestamp', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const quizzes = [];

    querySnapshot.forEach((doc) => {
      quizzes.push(doc.data());
    });

    if (quizzes.length === 0) {
      return {
        totalQuizzes: 0,
        averageScore: 0,
        totalTimeSpent: 0,
        bestScore: 0,
        worstScore: 0
      };
    }

    const scores = quizzes.map(q => q.score);
    const totalTimeSpent = quizzes.reduce((sum, q) => sum + (q.timeSpent || 0), 0);

    return {
      totalQuizzes: quizzes.length,
      averageScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      totalTimeSpent,
      bestScore: Math.max(...scores),
      worstScore: Math.min(...scores),
      recentScores: scores.slice(0, 5)
    };
  } catch (error) {
    console.error('Error fetching quiz stats:', error);
    return {
      totalQuizzes: 0,
      averageScore: 0,
      totalTimeSpent: 0,
      bestScore: 0,
      worstScore: 0
    };
  }
}

/**
 * Get all quiz results for performance analysis
 * @param {string} uid - User ID
 * @returns {Promise<Array>} - All quiz results
 */
export async function getAllQuizResults(uid) {
  try {
    const q = query(
      collection(db, 'users', uid, 'quizResults'),
      orderBy('timestamp', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const quizzes = [];

    querySnapshot.forEach((doc) => {
      quizzes.push({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate()
      });
    });

    return quizzes;
  } catch (error) {
    console.error('Error fetching all quiz results:', error);
    return [];
  }
}
