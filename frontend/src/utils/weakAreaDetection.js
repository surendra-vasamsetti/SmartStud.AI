/**
 * Detect weak areas based on quiz performance
 * @param {Array} quizResults - Array of quiz result objects
 * @returns {Array} - Array of weak areas with accuracy and severity
 */
export function detectWeakAreas(quizResults) {
  if (!quizResults || quizResults.length === 0) {
    return [];
  }

  const topicStats = {};

  // Analyze each quiz
  quizResults.forEach(quiz => {
    // Track incorrect answers by topic
    if (quiz.incorrectQuestions && Array.isArray(quiz.incorrectQuestions)) {
      quiz.incorrectQuestions.forEach(q => {
        const topic = q.topic || 'Unknown';
        if (!topicStats[topic]) {
          topicStats[topic] = { correct: 0, incorrect: 0, total: 0 };
        }
        topicStats[topic].incorrect++;
        topicStats[topic].total++;
      });
    }

    // Track correct answers by topic
    // Estimate correct topics from overall score
    if (quiz.topics && Array.isArray(quiz.topics)) {
      const correctCount = quiz.correctAnswers || 0;
      const questionsPerTopic = Math.ceil(quiz.totalQuestions / quiz.topics.length);
      
      quiz.topics.forEach(topic => {
        if (!topicStats[topic]) {
          topicStats[topic] = { correct: 0, incorrect: 0, total: 0 };
        }
        // Rough estimation: distribute correct answers across topics
        const estimatedCorrect = Math.floor(correctCount / quiz.topics.length);
        topicStats[topic].correct += estimatedCorrect;
        topicStats[topic].total += questionsPerTopic;
      });
    }
  });

  // Calculate accuracy and identify weak areas
  const weakAreas = [];
  
  Object.entries(topicStats).forEach(([topic, stats]) => {
    if (stats.total === 0) return;
    
    const accuracy = Math.round((stats.correct / stats.total) * 100);
    
    // Weak area threshold: < 60%
    if (accuracy < 60) {
      weakAreas.push({
        topic,
        accuracy,
        attemptsCount: stats.total,
        correctCount: stats.correct,
        incorrectCount: stats.incorrect,
        severity: accuracy < 40 ? 'critical' : 'moderate'
      });
    }
  });

  // Sort by accuracy (worst first)
  return weakAreas.sort((a, b) => a.accuracy - b.accuracy);
}

/**
 * Get mastered topics (>80% accuracy)
 * @param {Array} quizResults - Array of quiz result objects
 * @returns {Array} - Array of mastered topics
 */
export function getMasteredTopics(quizResults) {
  if (!quizResults || quizResults.length === 0) {
    return [];
  }

  const topicStats = {};

  quizResults.forEach(quiz => {
    if (quiz.topics && Array.isArray(quiz.topics)) {
      quiz.topics.forEach(topic => {
        if (!topicStats[topic]) {
          topicStats[topic] = { scores: [] };
        }
        topicStats[topic].scores.push(quiz.score);
      });
    }
  });

  const masteredTopics = [];
  
  Object.entries(topicStats).forEach(([topic, stats]) => {
    const avgScore = stats.scores.reduce((a, b) => a + b, 0) / stats.scores.length;
    
    if (avgScore >= 80) {
      masteredTopics.push({
        topic,
        averageScore: Math.round(avgScore),
        attemptsCount: stats.scores.length
      });
    }
  });

  return masteredTopics.sort((a, b) => b.averageScore - a.averageScore);
}

/**
 * Get accuracy for a specific topic
 * @param {Array} quizResults - Array of quiz result objects
 * @param {string} targetTopic - Topic to analyze
 * @returns {object} - Topic accuracy stats
 */
export function getTopicAccuracy(quizResults, targetTopic) {
  if (!quizResults || quizResults.length === 0) {
    return { accuracy: 0, attemptsCount: 0 };
  }

  let correct = 0;
  let total = 0;

  quizResults.forEach(quiz => {
    if (quiz.incorrectQuestions && Array.isArray(quiz.incorrectQuestions)) {
      quiz.incorrectQuestions.forEach(q => {
        if (q.topic === targetTopic) {
          total++;
        }
      });
    }

    if (quiz.topics && quiz.topics.includes(targetTopic)) {
      const questionsForTopic = Math.ceil(quiz.totalQuestions / quiz.topics.length);
      const correctForTopic = Math.floor(quiz.correctAnswers / quiz.topics.length);
      correct += correctForTopic;
      total += questionsForTopic;
    }
  });

  const accuracy = total === 0 ? 0 : Math.round((correct / total) * 100);

  return {
    accuracy,
    attemptsCount: total,
    correctCount: correct,
    incorrectCount: total - correct
  };
}

/**
 * Get overall performance summary
 * @param {Array} quizResults - Array of quiz result objects
 * @returns {object} - Performance summary
 */
export function getPerformanceSummary(quizResults) {
  if (!quizResults || quizResults.length === 0) {
    return {
      totalQuizzes: 0,
      averageScore: 0,
      totalTimeSpent: 0,
      weakAreasCount: 0,
      masteredTopicsCount: 0,
      recentScores: []
    };
  }

  const scores = quizResults.map(q => q.score || 0);
  const totalTimeSpent = quizResults.reduce((sum, q) => sum + (q.timeSpent || 0), 0);
  const weakAreas = detectWeakAreas(quizResults);
  const masteredTopics = getMasteredTopics(quizResults);

  return {
    totalQuizzes: quizResults.length,
    averageScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
    totalTimeSpent,
    weakAreasCount: weakAreas.length,
    masteredTopicsCount: masteredTopics.length,
    recentScores: scores.slice(0, 10),
    bestScore: Math.max(...scores),
    worstScore: Math.min(...scores)
  };
}
