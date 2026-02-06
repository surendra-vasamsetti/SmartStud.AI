import { getStudentMemory } from './agentMemory';
import { getConversationHistory } from './conversationStorage';
import { getAllQuizResults } from '../utils/quizTracking';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { API_URL } from '../api/apiConfig';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

/**
 * Generate AI response with full student context
 */
/**
 * Generate AI response using backend API
 */
export const generateContextualResponse = async (
  userId, 
  conversationId, 
  userMessage,
  userName = 'there'
) => {
  try {
    console.log('generateContextualResponse called with:', { userId, conversationId, userMessage, userName });
    
    // Gather comprehensive context
    console.log('Gathering context...');
    const [memory, recentMessages, quizzes] = await Promise.all([
      getStudentMemory(userId),
      getConversationHistory(userId, conversationId, 10),
      getAllQuizResults(userId)
    ]);

    console.log('Context gathered:', { 
      memoryExists: !!memory, 
      messageCount: recentMessages.length, 
      quizCount: quizzes.length 
    });

    // Call backend API
    console.log('Calling backend API...');
    const response = await fetch(`${API_URL}/api/companion/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userMessage,
        userName,
        context: {
          memory,
          recentMessages: recentMessages.slice(-5),
          quizzes: quizzes.slice(0, 5)
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get AI response');
    }

    const data = await response.json();
    console.log('Backend response received, length:', data.response.length);
    
    return data.response;
  } catch (error) {
    console.error('Error generating contextual response:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    throw error;
  }
};

/**
 * Build a context-rich prompt for the AI
 */
function buildContextualPrompt(message, memory, history, quizzes, userName) {
  // Format conversation history
  const conversationContext = history
    .slice(-5)
    .map(m => `${m.role === 'user' ? 'Student' : 'You'}: ${m.content}`)
    .join('\n');

  // Format recent performance
  const recentPerformance = quizzes.length > 0
    ? quizzes.map(q => `- ${q.subject}: ${q.score}% (${q.topics?.join(', ') || 'general'})`).join('\n')
    : 'No quiz data yet';

  // Format struggling concepts
  const struggles = memory.strugglingConcepts?.length > 0
    ? memory.strugglingConcepts.map(c => `${c.topic} (${c.avgScore}%)`).join(', ')
    : 'None identified yet';

  // Format mastered concepts
  const mastered = memory.masteredConcepts?.length > 0
    ? memory.masteredConcepts.map(c => c.topic).join(', ')
    : 'None yet';

  return `You are an AI Learning Companion - a supportive, knowledgeable tutor helping ${userName} on their learning journey.

STUDENT PROFILE:
- Name: ${userName}
- Learning Level: ${memory.currentLevel || 'beginner'}
- Learning Style: ${memory.learningStyle || 'balanced'}
- Explanation Preference: ${memory.preferredExplanationStyle || 'balanced'}
- Study Streak: ${memory.studyStreak || 0} days
- Total Study Time: ${Math.floor((memory.totalStudyTime || 0) / 3600)} hours
- Primary Goal: ${memory.primaryGoal || 'Not set yet'}

PERFORMANCE CONTEXT:
Struggling with: ${struggles}
Mastered: ${mastered}

RECENT QUIZ PERFORMANCE:
${recentPerformance}

${conversationContext ? `RECENT CONVERSATION:\n${conversationContext}\n` : ''}

CURRENT MESSAGE: ${message}

INSTRUCTIONS:
1. Be warm, encouraging, and supportive
2. Address the student by name occasionally (${userName})
3. Reference their previous conversations and struggles when relevant
4. Adjust explanation depth based on their level (${memory.currentLevel})
5. Use their preferred explanation style (${memory.preferredExplanationStyle})
6. Celebrate their wins (${memory.studyStreak} day streak!)
7. Acknowledge challenges they're facing
8. Provide actionable, specific guidance
9. Use emojis sparingly for warmth
10. Keep responses concise but complete

Respond as a caring, expert tutor who knows this student well:`;
}

/**
 * Generate a welcome message for new conversation
 */
export const generateWelcomeMessage = async (userId, userName) => {
  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
  try {
    const memory = await getStudentMemory(userId);
    const quizzes = await getAllQuizResults(userId);

    const prompt = `You are an AI Learning Companion greeting ${userName}.

Student context:
- Study streak: ${memory.studyStreak} days
- Recent performance: ${quizzes.length} quizzes taken
- Primary goal: ${memory.primaryGoal || 'learning'}

Generate a warm, personalized greeting (2-3 sentences max).
Reference their streak if > 0, or encourage them if new.
Ask what they'd like to work on today.`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Error generating welcome:', error);
    return `Hey ${userName}! 👋 I'm your AI Learning Companion. What would you like to learn today?`;
  }
};

/**
 * Detect student emotion from message
 */
export const detectEmotion = (message) => {
  const frustrated = /(?:confused|stuck|don't understand|frustrated|hard|difficult)/i;
  const excited = /(?:got it|understand|makes sense|cool|awesome|thanks)/i;
  const struggling = /(?:help|can't|unable to|problem|error|bug)/i;

  if (frustrated.test(message)) return 'frustrated';
  if (excited.test(message)) return 'excited';
  if (struggling.test(message)) return 'struggling';
  
  return 'neutral';
};

/**
 * Extract mentioned concepts from message
 */
export const extractConcepts = (message) => {
  const commonConcepts = [
    'array', 'object', 'function', 'loop', 'variable',
    'closure', 'promise', 'async', 'react', 'component',
    'state', 'props', 'hook', 'javascript', 'css', 'html'
  ];

  const mentioned = [];
  const lowerMessage = message.toLowerCase();

  commonConcepts.forEach(concept => {
    if (lowerMessage.includes(concept)) {
      mentioned.push(concept);
    }
  });

  return mentioned;
};
