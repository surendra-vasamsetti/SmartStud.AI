import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { 
  Target, 
  BookOpen, 
  BarChart2, 
  Star, 
  Trophy, 
  ThumbsUp, 
  Library, 
  Bot, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Lightbulb, 
  RefreshCw,
  Check
} from "lucide-react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Layout from "../components/Layout";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { saveQuizResult } from "../utils/quizTracking";

/* ---------------- GEMINI SETUP ---------------- */

// ✅ Validate API key before initializing
if (!import.meta.env.VITE_GEMINI_API_KEY) {
  alert("Gemini API key not found. Please set VITE_GEMINI_API_KEY in your .env file.");
}

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
});

const levelConfig = {
  beginner: { questions: 10, difficulty: "easy" },
  intermediate: { questions: 15, difficulty: "medium" },
  advanced: { questions: 20, difficulty: "hard" },
};

// ✅ ADDED: Robust JSON extraction & repair function
function extractJSON(text) {
  try {
    // 1. Find the outer array brackets
    const start = text.indexOf('[');
    const end = text.lastIndexOf(']') + 1;
    
    if (start !== -1 && end !== -1 && end > start) {
      let jsonStr = text.substring(start, end);
      
      // 2. Remove actual control characters (newlines, tabs, etc.) that are NOT escaped
      // JSON.parse fails on literal newlines inside strings. 
      // We replace them with spaces. Structural whitespace doesn't matter to JSON.parse.
      jsonStr = jsonStr.replace(/[\u0000-\u001F]+/g, " "); 
      
      // 3. Repair common JSON structural errors
      // Fix missing commas between objects: } { -> }, {
      jsonStr = jsonStr.replace(/}\s*{/g, '}, {');
      
      // Fix missing commas after properties: "value" "key" -> "value", "key"
      jsonStr = jsonStr.replace(/"\s*"/g, '", "');
      
      return jsonStr.trim();
    }
  } catch (e) {
    console.error("JSON Extraction Error:", e);
  }
  return text;
}

export default function Quizzes() {
  /* ---------------- SIDEBAR ---------------- */
  // Removed manual sidebar state
  
  const { username, email } = useCurrentUser();
  const navigate = useNavigate();
  
  /* ---------------- AUTO QUIZ INIT ---------------- */
  const [searchParams] = useSearchParams();
  const autoInitialized = useRef(false);

  useEffect(() => {
    const auto = searchParams.get('auto');
    const paramTopic = searchParams.get('topic');
    const paramLevel = searchParams.get('level');

    if (auto === 'true' && paramTopic && !autoInitialized.current) {
      console.log("🚀 Auto-starting quiz for:", paramTopic, paramLevel);
      autoInitialized.current = true;
      setTopic(paramTopic);
      if (paramLevel) setLevel(paramLevel.toLowerCase());
      
      // Chain the generation process
      // We need to wait for state to update, or pass args directly
      generateSyllabus(paramTopic, paramLevel?.toLowerCase());
    }
  }, [searchParams]);

  // Removed toggleSidebar and resize listener

  /* ---------------- QUIZ STATES ---------------- */
  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState("beginner");
  const [syllabus, setSyllabus] = useState("");
  const [quiz, setQuiz] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [currentQ, setCurrentQ] = useState(0);
  
  /* ---------------- TIME TRACKING ---------------- */
  const [questionTimes, setQuestionTimes] = useState({}); // Time spent per question
  const [quizStartTime, setQuizStartTime] = useState(null); // Quiz start timestamp
  const [currentQuestionStartTime, setCurrentQuestionStartTime] = useState(null);
  const [totalQuizTime, setTotalQuizTime] = useState(0); // Total duration in seconds
  const [aiSuggestions, setAiSuggestions] = useState(""); // AI-generated feedback
  const [saving, setSaving] = useState(false); // Save status
  const [saved, setSaved] = useState(false); // Save success

  /* ---------------- SYLLABUS ---------------- */
  const generateSyllabus = async (overrideTopic = null, overrideLevel = null) => {
    // If called as an event handler, overrideTopic will be the event object
    const topicToUse = typeof overrideTopic === 'string' ? overrideTopic : topic;
    const levelToUse = typeof overrideLevel === 'string' ? overrideLevel : level;

    if (!topicToUse || !topicToUse.trim()) return;

    setLoading(true);
    setQuiz([]);
    setResult(null);
    setCurrentQ(0);

    try {
      const prompt = `Create a ${levelToUse}-level syllabus for learning "${topicToUse}" using short bullet points.`;
      
      const result = await model.generateContent(prompt);
      const text = result.response.text();

      if (!text || text.trim() === "") {
        throw new Error("Gemini returned an empty syllabus. Try a different topic.");
      }

      setSyllabus(text);
      setStep(2);
      
      // If auto-mode (passed args), chain the quiz generation
      if (typeof overrideTopic === 'string') {
        setTimeout(() => generateQuiz(text, levelToUse), 1000); 
      }

    } catch (err) {
      console.error("Syllabus generation error:", err);
      alert("Failed to generate syllabus: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- QUIZ ---------------- */
  const generateQuiz = async (overrideSyllabus = null, overrideLevel = null) => {
    const activeSyllabus = overrideSyllabus || syllabus;
    const activeLevel = overrideLevel || level;

    if (!activeSyllabus) return;

    setLoading(true);

    // Safeguard: Ensure activeLevel exists in config, otherwise default to 'beginner'
    const config = levelConfig[activeLevel] || levelConfig['beginner'];
    const { questions, difficulty } = config;

    try {
      const prompt = `
            Based on the syllabus below, generate EXACTLY ${questions} MCQ questions.
            
            Difficulty: ${difficulty}

            ${activeSyllabus}

            Each question must include:
            - question
            - options (A, B, C, D)
            - correctAnswer (A/B/C/D)
            - explanation

            Output ONLY the raw JSON array. 
            
            Example Format:
            [
              {
                "question": "What is 2+2?",
                "options": { "A": "1", "B": "3", "C": "4", "D": "5" },
                "correctAnswer": "C",
                "explanation": "Because math."
              },
              {
                "question": "Next question...",
                "options": { "A": "Yes", "B": "No", "C": "Maybe", "D": "So" },
                "correctAnswer": "A",
                "explanation": "Explanation here."
              }
            ]

            Ensure valid RFC8259 JSON:
            - ALL property names must be in DOUBLE QUOTES.
            - ALL string values must be in DOUBLE QUOTES.
            - NO trailing commas.
            - SEPARATE objects with commas.
            - IMPORTANT: Escape all special characters inside strings (especially newlines should be \n).
            `;

      const result = await model.generateContent(prompt);
      let raw = result.response.text();
      
      console.log('📝 Raw Gemini Quiz Response:', raw);

      if (!raw || raw.trim() === "") {
        throw new Error("Gemini returned an empty quiz response. This might be due to content filters or an API issue.");
      }

      // ✅ ENHANCED: Use extractJSON for robust parsing
      raw = extractJSON(raw).trim();
      
      // Cleanup common LLM JSON errors
      raw = raw.replace(/,\s*]/g, ']'); // Remove trailing commas in arrays
      raw = raw.replace(/,\s*}/g, '}'); // Remove trailing commas in objects
      
      console.log('🧹 Cleaned Quiz Response:', raw);

      const parsed = JSON.parse(raw);

      if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new Error("Invalid quiz format received. Expected an array of questions.");
      }

      setQuiz(parsed);
      setStep(3);
      // Initialize timing
      setQuizStartTime(Date.now());
      setCurrentQuestionStartTime(Date.now());
      setQuestionTimes({});
      setTotalQuizTime(0);
    } catch (err) {
      console.error("Quiz generation error:", err);
      console.error("Raw response:", err?.response || "No response");
      alert("Quiz generation failed: " + (err.message || "Try again or check your API key."));
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- SUBMIT ---------------- */
  const submitQuiz = async () => {
    // Calculate final question time
    const finalTime = Date.now() - currentQuestionStartTime;
    const updatedTimes = { ...questionTimes, [currentQ]: finalTime };
    setQuestionTimes(updatedTimes);
    
    // Calculate total quiz time
    const totalTime = Math.round((Date.now() - quizStartTime) / 1000); // in seconds
    setTotalQuizTime(totalTime);

    let score = 0;
    const analysis = quiz.map((q, i) => {
      const correct = answers[i] === q.correctAnswer;
      const userAnswer = answers[i] || "Not answered";
      const timeSpent = Math.round((updatedTimes[i] || 0) / 1000); // Convert to seconds
      if (correct) score++;
      return { 
        ...q, 
        isCorrect: correct, 
        userAnswer,
        timeSpent 
      };
    });

    // Generate AI suggestions
    setLoading(true);
    const suggestions = await generateAISuggestions(analysis, score, quiz.length, topic);
    setAiSuggestions(suggestions);
    setLoading(false);

    // Save quiz result to Firestore for adaptive learning
    await saveQuizToFirestore(analysis, score, totalTime);

    setResult({ score, total: quiz.length, analysis, totalTime });
    setStep(4);
  };

  /* ---------------- SAVE TO FIRESTORE ---------------- */
  const saveQuizToFirestore = async (analysis, score, totalTime) => {
    const uid = sessionStorage.getItem('uid');
    if (!uid) return;

    setSaving(true);
    try {
      const incorrectQuestions = analysis
        .filter(q => !q.isCorrect)
        .map(q => ({
          question: q.question,
          topic: topic, // Use quiz topic
          userAnswer: q.userAnswer,
          correctAnswer: q.correctAnswer
        }));

      const quizResultData = {
        subject: topic,
        topics: [topic], // Single topic for this quiz type
        score: Math.round((score / quiz.length) * 100),
        totalQuestions: quiz.length,
        correctAnswers: score,
        incorrectQuestions: incorrectQuestions,
        timeSpent: totalTime,
        difficulty: level // Use selected difficulty level
      };

      await saveQuizResult(uid, quizResultData);
      setSaved(true);
      console.log('Quiz result saved to Firestore!');
    } catch (error) {
      console.error('Error saving quiz result:', error);
    } finally {
      setSaving(false);
    }
  };
  
  /* ---------------- AI SUGGESTIONS ---------------- */
  const generateAISuggestions = async (analysis, score, total, topic) => {
    try {
      const incorrectQuestions = analysis.filter(q => !q.isCorrect);
      const weakAreas = incorrectQuestions.map(q => q.question).join(", ");
      const percentage = Math.round((score / total) * 100);
      
      const prompt = `
You are a helpful learning coach. A student just completed a quiz on "${topic}" with the following results:
- Score: ${score}/${total} (${percentage}%)
- Incorrect questions: ${incorrectQuestions.length}
${weakAreas ? `- Struggled with: ${weakAreas}` : ""}

Provide:
1. A brief encouraging message (1-2 sentences)
2. Key areas to focus on for improvement (if any)
3. 2-3 specific study suggestions
4. Recommended difficulty level for next quiz

Keep it concise, positive, and actionable. Maximum 150 words.
`;
      
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (err) {
      console.error("AI suggestions error:", err);
      return "Great effort! Keep practicing to improve your understanding.";
    }
  };
  
  /* ---------------- QUESTION NAVIGATION ---------------- */
  const handleNextQuestion = () => {
    // Save time for current question
    const timeSpent = Date.now() - currentQuestionStartTime;
    setQuestionTimes(prev => ({ ...prev, [currentQ]: timeSpent }));
    
    // Move to next question or submit
    if (currentQ + 1 === quiz.length) {
      submitQuiz();
    } else {
      setCurrentQ(currentQ + 1);
      setCurrentQuestionStartTime(Date.now());
    }
  };

  const percent = result ? Math.round((result.score / result.total) * 100) : 0;

  /* ---------------- UI ---------------- */
  return (
    <Layout>
      <div className="flex justify-center px-4 pt-4 pb-6 sm:pt-8 sm:pb-10">
          {/* STEP 1 */}
          {step === 1 && (
            <div className="w-full max-w-xl bg-white p-6 sm:p-8 rounded-3xl shadow-soft">
              <h2 className="text-2xl font-bold text-soft-text text-center mb-6 flex items-center justify-center gap-2">
                <Target className="w-8 h-8 text-soft-primary" /> Select Topic & Level
              </h2>

              <input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Eg: React, Java, Aptitude"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 mb-6 focus:ring-2 focus:ring-soft-primary/20 focus:outline-none transition-all"
              />

              <div className="flex gap-3 mb-8">
                {["beginner", "intermediate", "advanced"].map((l) => (
                  <button
                    key={l}
                    onClick={() => setLevel(l)}
                    className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                      level === l
                        ? "bg-soft-primary text-white shadow-md"
                        : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {l.charAt(0).toUpperCase() + l.slice(1)}
                  </button>
                ))}
              </div>

              <button
                onClick={() => generateSyllabus()}
                disabled={loading || !topic.trim()}
                className="w-full bg-soft-primary text-white py-4 rounded-xl font-semibold shadow-soft-hover hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:hover:scale-100"
              >
                {loading ? "Generating Syllabus..." : "Generate Syllabus"}
              </button>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="w-full max-w-xl bg-white p-6 sm:p-8 rounded-3xl shadow-soft max-h-[70vh] overflow-y-auto custom-scrollbar">
              <h2 className="text-xl font-bold mb-6 text-center flex items-center justify-center gap-2 text-soft-text">
                <BookOpen className="w-6 h-6 text-blue-500" /> Learning Roadmap
              </h2>

              <div className="space-y-4 mb-8">
                {syllabus.split("\n").map((line, i) => (
                  <div
                    key={i}
                    className="flex gap-4 p-4 rounded-xl bg-soft-bg border border-soft-primary/5 hover:bg-white hover:shadow-sm transition-all"
                  >
                    <span className="w-8 h-8 bg-soft-primary text-white text-sm font-bold flex items-center justify-center rounded-lg flex-shrink-0">
                      {i + 1}
                    </span>
                    <p className="text-gray-700 leading-relaxed">{line}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={generateQuiz}
                disabled={loading}
                className="w-full bg-soft-text text-white py-4 rounded-xl font-semibold shadow-lg hover:bg-gray-900 transition-colors disabled:opacity-50"
              >
                {loading ? "Preparing Quiz..." : "Start Quiz →"}
              </button>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && quiz.length > 0 && (
            <div className="w-full max-w-xl bg-white p-5 sm:p-8 rounded-2xl sm:rounded-3xl shadow-soft">
              <div className="flex justify-between mb-4 text-[10px] sm:text-sm font-medium text-gray-500">
                <span>Question {currentQ + 1} of {quiz.length}</span>
                <span>
                   Difficulty: {level}
                </span>
              </div>

              <div className="h-1.5 sm:h-2 bg-gray-100 rounded-full mb-6 sm:mb-8 overflow-hidden">
                <div
                  className="h-full bg-soft-primary rounded-full transition-all duration-300 ease-out"
                  style={{
                    width: `${((currentQ + 1) / quiz.length) * 100}%`,
                  }}
                />
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-6 sm:mb-8 leading-snug">
                {quiz[currentQ].question}
              </h3>

              <div className="space-y-2.5 sm:space-y-3">
                {Object.entries(quiz[currentQ].options).map(([k, v]) => (
                  <button
                    key={k}
                    onClick={() =>
                      setAnswers({ ...answers, [currentQ]: k })
                    }
                    className={`w-full text-left px-4 sm:px-6 py-3 sm:py-4 rounded-xl border-2 transition-all text-sm sm:text-base ${
                      answers[currentQ] === k
                        ? "bg-soft-primary/5 border-soft-primary text-soft-primary font-medium"
                        : "bg-white border-transparent hover:bg-gray-50 hover:border-gray-200 text-gray-700"
                    }`}
                  >
                    <span className="inline-block w-6 sm:w-8 font-bold text-xs sm:text-base">{k}.</span> {v}
                  </button>
                ))}
              </div>

              <button
                onClick={handleNextQuestion}
                disabled={loading}
                className="w-full mt-6 sm:mt-8 bg-black text-white py-3.5 sm:py-4 rounded-xl font-semibold shadow-lg hover:bg-gray-800 transition-all disabled:opacity-50 text-sm sm:text-base"
              >
                {loading ? "Submitting..." : (currentQ + 1 === quiz.length ? "Finish Quiz" : "Next Question →")}
              </button>
            </div>
          )}

          {/* STEP 4 - ENHANCED RESULTS */}
          {step === 4 && result && (
            <div className="w-full max-w-5xl space-y-6 sm:space-y-8">
              {/* Summary Card */}
              <div className="bg-white p-6 sm:p-10 rounded-2xl sm:rounded-3xl shadow-soft text-center">
                 <div className="inline-flex items-center justify-center p-3 sm:p-4 bg-soft-primary/10 rounded-full mb-4 sm:mb-6">
                    {percent === 100 ? <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-yellow-500" /> : percent >= 70 ? <Star className="w-10 h-10 sm:w-12 sm:h-12 text-soft-primary" /> : <BarChart2 className="w-10 h-10 sm:w-12 sm:h-12 text-soft-primary" />}
                 </div>
                 
                 <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                    {percent === 100 ? "Perfect Score!" : percent >= 70 ? "Great Job!" : "Keep Learning!"}
                 </h2>
                 <p className="text-sm sm:text-base text-gray-500 mb-6 sm:mb-8">You scored {percent}% on {topic}</p>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8 max-w-3xl mx-auto">
                  <div className="bg-green-50 p-4 sm:p-6 rounded-xl sm:rounded-2xl">
                    <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-1">{result.score}</div>
                    <div className="text-[10px] sm:text-sm font-medium text-green-800 uppercase tracking-wider">Correct</div>
                  </div>
                  <div className="bg-red-50 p-4 sm:p-6 rounded-xl sm:rounded-2xl">
                    <div className="text-2xl sm:text-3xl font-bold text-red-600 mb-1">{result.total - result.score}</div>
                    <div className="text-[10px] sm:text-sm font-medium text-red-800 uppercase tracking-wider">Incorrect</div>
                  </div>
                  <div className="bg-blue-50 p-4 sm:p-6 rounded-xl sm:rounded-2xl">
                    <div className="text-xl sm:text-3xl font-bold text-blue-600 mb-1 leading-tight sm:leading-normal">{Math.floor(result.totalTime / 60)}m {(result.totalTime % 60)}s</div>
                    <div className="text-[10px] sm:text-sm font-medium text-blue-800 uppercase tracking-wider">Time Taken</div>
                  </div>
                  <div className="bg-purple-50 p-4 sm:p-6 rounded-xl sm:rounded-2xl">
                    <div className="text-2xl sm:text-3xl font-bold text-purple-600 mb-1">{Math.round(result.totalTime / result.total)}s</div>
                    <div className="text-[10px] sm:text-sm font-medium text-purple-800 uppercase tracking-wider">Avg / Q</div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 max-w-3xl mx-auto">
                  <div className="bg-green-50 p-6 rounded-2xl">
                    <div className="text-3xl font-bold text-green-600 mb-1">{result.score}</div>
                    <div className="text-sm font-medium text-green-800">Correct</div>
                  </div>
                  <div className="bg-red-50 p-6 rounded-2xl">
                    <div className="text-3xl font-bold text-red-600 mb-1">{result.total - result.score}</div>
                    <div className="text-sm font-medium text-red-800">Incorrect</div>
                  </div>
                  <div className="bg-blue-50 p-6 rounded-2xl">
                    <div className="text-3xl font-bold text-blue-600 mb-1">{Math.floor(result.totalTime / 60)}m {(result.totalTime % 60)}s</div>
                    <div className="text-sm font-medium text-blue-800">Time Taken</div>
                  </div>
                  <div className="bg-purple-50 p-6 rounded-2xl">
                    <div className="text-3xl font-bold text-purple-600 mb-1">{Math.round(result.totalTime / result.total)}s</div>
                    <div className="text-sm font-medium text-purple-800">Avg / Question</div>
                  </div>
                </div>

                {/* Save Status */}
                <div className="flex justify-center">
                  {saving && (
                    <span className="px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-500 animate-pulse">
                      Saving results...
                    </span>
                  )}
                  {saved && (
                    <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center gap-2">
                      <Check size={16} /> Result Saved
                    </span>
                  )}
                </div>
              </div>

              {/* AI Suggestions */}
              {aiSuggestions && (
                <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-6 sm:p-10 rounded-2xl sm:rounded-3xl shadow-soft text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                  <div className="relative z-10">
                     <h3 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-3">
                       <Bot className="w-6 h-6" /> AI Learning Coach
                     </h3>
                     <div className="text-indigo-50 leading-relaxed whitespace-pre-line text-sm sm:text-lg">
                       {aiSuggestions}
                     </div>
                  </div>
                </div>
              )}

              {/* Detailed Question Analysis */}
              <div className="space-y-4 sm:space-y-6">
                 <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 px-2">Detailed Analysis</h3>
                  {result.analysis.map((q, i) => (
                    <div 
                      key={i} 
                      className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                    >
                      <div className="flex gap-3 sm:gap-4">
                        <div className={`mt-1 flex-shrink-0 ${q.isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                           {q.isCorrect ? <CheckCircle size={20} className="sm:w-6 sm:h-6" /> : <XCircle size={20} className="sm:w-6 sm:h-6" />}
                        </div>
                        <div className="flex-1">
                           <h4 className="font-semibold text-base sm:text-lg text-gray-800 mb-3 sm:mb-4">{q.question}</h4>
                           
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-4">
                              <div className={`p-3 rounded-xl border ${q.isCorrect ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                                 <span className="text-[10px] font-semibold uppercase tracking-wider opacity-70 block mb-1">Your Answer</span>
                                 <span className="text-sm font-medium">{q.userAnswer}</span>
                              </div>
                              {!q.isCorrect && (
                                <div className="p-3 rounded-xl border bg-green-50 border-green-100">
                                   <span className="text-[10px] font-semibold uppercase tracking-wider opacity-70 block mb-1">Correct Answer</span>
                                   <span className="text-sm font-medium text-green-700">{q.correctAnswer}</span>
                                </div>
                              )}
                           </div>

                           <div className="bg-gray-50 p-3 sm:p-4 rounded-xl text-gray-600 text-[13px] sm:text-sm leading-relaxed">
                              <strong className="text-gray-900 block mb-1 flex items-center gap-2">
                                <Lightbulb size={14} className="text-yellow-500 sm:w-4 sm:h-4" /> Explanation
                              </strong>
                              {q.explanation}
                           </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 pb-12">
                <button
                  onClick={() => {
                      setStep(1);
                      setQuiz([]);
                      setAnswers({});
                      setResult(null);
                      setCurrentQ(0);
                      setQuestionTimes({});
                      setTotalQuizTime(0);
                      setAiSuggestions("");
                  }}
                  className="flex-1 bg-white border-2 border-gray-200 text-gray-700 py-3.5 sm:py-4 rounded-xl font-bold hover:bg-gray-50 transition-colors text-sm sm:text-base"
                >
                  Back to Topics
                </button>
                 <button
                    onClick={() => navigate('/ai-companion', { 
                      state: { 
                        quizContext: {
                          topic: topic,
                          level: level,
                          score: result.score,
                          total: result.total,
                          weakAreas: result.analysis.filter(q => !q.isCorrect).map(q => q.question)
                        }
                      } 
                    })}
                    className="flex-1 bg-soft-primary text-white py-3.5 sm:py-4 rounded-xl font-bold shadow-soft-hover hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    <Bot size={18} className="sm:w-5 sm:h-5" /> Discuss with AI
                  </button>
              </div>
            </div>
          )}
        </div>
    </Layout>
  );
}