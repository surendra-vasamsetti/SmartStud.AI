import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * POST /api/companion/chat
 * Generate AI response for companion chat
 */
router.post('/chat', async (req, res) => {
  try {
    const { userMessage, userName, context } = req.body;

    if (!userMessage) {
      return res.status(400).json({ error: 'User message is required' });
    }

    console.log('🤖 AI Companion request:', { userMessage, userName });

    // Build context-rich prompt
    const prompt = buildChatPrompt(userMessage, userName || 'there', context || {});

    // Generate response using Gemini
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        maxOutputTokens: 1000,
      }
    });

    const result = await model.generateContent(prompt);
    const aiResponse = result.response.text();

    console.log('✅ AI response generated, length:', aiResponse.length);

    res.json({ 
      response: aiResponse,
      success: true 
    });

  } catch (error) {
    console.error('❌ Error in AI Companion chat:', error);
    res.status(500).json({ 
      error: 'Failed to generate AI response',
      message: error.message 
    });
  }
});

/**
 * Build a context-rich prompt for the AI
 */
function buildChatPrompt(message, userName, context) {
  const { 
    memory = {}, 
    recentMessages = [], 
    quizzes = [] 
  } = context;

  // Format conversation history
  const conversationContext = recentMessages
    .slice(-5)
    .map(m => `${m.role === 'user' ? 'Student' : 'You'}: ${m.content}`)
    .join('\n');

  // Format recent performance
  const recentPerformance = quizzes.length > 0
    ? quizzes.slice(0, 5).map(q => `- ${q.subject}: ${q.score}% (${q.topics?.join(', ') || 'general'})`).join('\n')
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
4. Adjust explanation depth based on their level (${memory.currentLevel || 'beginner'})
5. Use their preferred explanation style (${memory.preferredExplanationStyle || 'balanced'})
6. Celebrate their wins (${memory.studyStreak || 0} day streak!)
7. Acknowledge challenges they're facing
8. Provide actionable, specific guidance
9. Use emojis sparingly for warmth
10. Keep responses concise but complete

SPECIAL INSTRUCTION FOR QUIZZES:
If the user explicitly asks to take a quiz, test, or exam on a specific topic, YOU MUST RETURN A JSON OBJECT instead of normal text.
Format:
\`\`\`json
{
  "type": "ACTION",
  "action": "LAUNCH_QUIZ",
  "params": {
    "topic": "extracted topic",
    "level": "beginner (default if not specified)"
  },
  "message": "I'm starting a [level] [topic] quiz for you now. Get ready!"
}
\`\`\`
Rule: If the user does not specify a difficulty level, DEFAULT TO "beginner".
Do not add any other text outside this JSON block if triggering a quiz.

Respond as a caring, expert tutor who knows this student well:`;
}

export default router;

