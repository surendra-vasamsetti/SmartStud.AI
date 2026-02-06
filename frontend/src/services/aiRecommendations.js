import { GoogleGenerativeAI } from "@google/generative-ai";

export async function generateRecommendations(userData) {
  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  try {
    const { weakAreas, strongAreas, avgScore, totalQuizzes, recentScores } = userData;

    // Build prompt
    const prompt = `
You are an adaptive learning AI tutor for Smartstud.Ai, a personalized learning platform.

Analyze this student's quiz performance and provide 3 specific, actionable study recommendations:

**Weak Areas** (topics with <60% accuracy):
${weakAreas && weakAreas.length > 0 
  ? weakAreas.map(w => `- ${w.topic}: ${w.accuracy}% accuracy (${w.attemptsCount} attempts)`).join('\n')
  : '- No weak areas detected'}

**Strong Areas** (topics with >80% accuracy):
${strongAreas && strongAreas.length > 0
  ? strongAreas.map(s => `- ${s.topic}: ${s.averageScore}% average`).join('\n')
  : '- No strong areas yet'}

**Performance Stats**:
- Recent Quiz Scores: ${recentScores && recentScores.length > 0 ? recentScores.join('%, ') + '%' : 'No quizzes yet'}
- Average Score: ${avgScore || 0}%
- Total Quizzes Taken: ${totalQuizzes || 0}

**Instructions**:
1. Provide exactly 3 recommendations
2. Each recommendation should be 1-2 sentences maximum
3. Focus primarily on improving weak areas
4. Be specific and actionable (e.g., "Review X topic", "Practice Y exercises")
5. Be encouraging and motivational
6. Format as a numbered list (1., 2., 3.)

Generate the recommendations now:
`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    // Parse recommendations
    const recommendations = parseRecommendations(response);

    return recommendations;
  } catch (error) {
    console.error('Error generating AI recommendations:', error);
    
    // Fallback recommendations
    return [
      "Keep practicing! Consistency is key to mastering new concepts.",
      "Review your weak areas and try taking focused quizzes on those topics.",
      "Great progress so far! Continue your learning streak to build momentum."
    ];
  }
}

/**
 * Parse AI response into array of recommendations
 * @param {string} response - AI generated text
 * @returns {Array} - Array of recommendation strings
 */
function parseRecommendations(response) {
  // Try to extract numbered list
  const lines = response.split('\n').filter(line => line.trim());
  const recommendations = [];

  for (const line of lines) {
    // Match patterns like "1.", "1)", "1 -", etc.
    const match = line.match(/^(\d+)[.)]\s*(.+)$/);
    if (match && recommendations.length < 3) {
      recommendations.push(match[2].trim());
    }
  }

  // If parsing failed, return first 3 non-empty lines
  if (recommendations.length === 0) {
    return lines.slice(0, 3);
  }

  // Ensure we have exactly 3 recommendations
  while (recommendations.length < 3) {
    recommendations.push("Continue your learning journey with consistent practice!");
  }

  return recommendations.slice(0, 3);
}

/**
 * Format recommendations for display
 * @param {Array} recommendations - Array of recommendation strings
 * @returns {Array} - Formatted recommendations with icons
 */
export function formatRecommendations(recommendations) {
  const icons = ['🎯', '📚', '💡'];
  
  return recommendations.map((rec, index) => ({
    id: index + 1,
    text: rec,
    icon: icons[index] || '✨'
  }));
}
