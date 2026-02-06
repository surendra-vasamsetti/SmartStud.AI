import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { 
  Target, 
  BookOpen, 
  BarChart2, 
  Star, 
  Trophy, 
  Library, 
  Bot, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Lightbulb, 
  RefreshCw,
  Check,
  ChevronRight,
  TrendingUp,
  BrainCircuit,
  Award
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Layout from "../components/Layout";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { saveQuizResult } from "../utils/quizTracking";

/* ---------------- GEMINI SETUP ---------------- */
const levelConfig = {
  beginner: { questions: 10, difficulty: "easy", color: "from-green-400 to-emerald-500" },
  intermediate: { questions: 15, difficulty: "medium", color: "from-blue-400 to-indigo-500" },
  advanced: { questions: 20, difficulty: "hard", color: "from-purple-400 to-pink-500" },
};

function extractJSON(text) {
  try {
    // 1. Remove markdown code blocks if present
    let cleaned = text.replace(/```(?:json)?\s*([\s\S]*?)\s*```/g, "$1");
    
    // 2. Find the start and end of the JSON array/object
    const start = cleaned.indexOf('[');
    const end = cleaned.lastIndexOf(']') + 1;
    
    if (start !== -1 && end !== -1 && end > start) {
      let jsonStr = cleaned.substring(start, end);
      
      // 3. Clean up common AI generation artifacts
      jsonStr = jsonStr.replace(/[\u0000-\u001F]+/g, " "); // Remove control characters
      jsonStr = jsonStr.replace(/,\s*([\]}])/g, "$1");      // Remove trailing commas
      
      return jsonStr.trim();
    }
    return cleaned.trim();
  } catch (e) {
    console.error("JSON Extraction Error:", e);
    return text;
  }
}

export default function Quizzes() {
  const { username, email } = useCurrentUser();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const autoInitialized = useRef(false);

  // Gemini Setup
  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
  });

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
  const [questionTimes, setQuestionTimes] = useState({});
  const [quizStartTime, setQuizStartTime] = useState(null);
  const [currentQuestionStartTime, setCurrentQuestionStartTime] = useState(null);
  const [totalQuizTime, setTotalQuizTime] = useState(0);
  const [aiSuggestions, setAiSuggestions] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const auto = searchParams.get('auto');
    const paramTopic = searchParams.get('topic');
    const paramLevel = searchParams.get('level');

    if (auto === 'true' && paramTopic && !autoInitialized.current) {
      autoInitialized.current = true;
      setTopic(paramTopic);
      if (paramLevel) setLevel(paramLevel.toLowerCase());
      generateSyllabus(paramTopic, paramLevel?.toLowerCase());
    }
  }, [searchParams]);

  const generateSyllabus = async (overrideTopic = null, overrideLevel = null) => {
    const topicToUse = typeof overrideTopic === 'string' ? overrideTopic : topic;
    const levelToUse = typeof overrideLevel === 'string' ? overrideLevel : level;
    if (!topicToUse || !topicToUse.trim()) return;

    setLoading(true);
    setQuiz([]);
    setResult(null);
    setCurrentQ(0);

    try {
      const prompt = `Create a ${levelToUse}-level syllabus for learning "${topicToUse}" using short bullet points. Provide exactly 6-8 core subtopics.`;
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      if (!text || text.trim() === "") throw new Error("Empty syllabus response");
      setSyllabus(text);
      setStep(2);
      if (typeof overrideTopic === 'string') {
        setTimeout(() => generateQuiz(text, levelToUse), 1000); 
      }
    } catch (err) {
      alert("Failed to generate syllabus: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const generateQuiz = async (overrideSyllabus = null, overrideLevel = null) => {
    const activeSyllabus = overrideSyllabus || syllabus;
    const activeLevel = overrideLevel || level;
    if (!activeSyllabus) return;

    setLoading(true);
    const config = levelConfig[activeLevel] || levelConfig['beginner'];
    const { questions, difficulty } = config;

    try {
      const prompt = `Generate exactly ${questions} MCQ questions about "${topic}" based on this syllabus: ${activeSyllabus}.
            
            Difficulty: ${difficulty}
            
            Return ONLY a valid JSON array of objects. Each object must have:
            - "question": string
            - "options": object with keys "A", "B", "C", "D"
            - "correctAnswer": string ("A", "B", "C", or "D")
            - "explanation": string
            
            CRITICAL: 
            - Use double quotes for all keys and string values.
            - Ensure no trailing commas.
            - No markdown formatting or extra text.`;

      const result = await model.generateContent(prompt);
      const rawText = result.response.text();
      let raw = extractJSON(rawText);
      
      try {
        const parsed = JSON.parse(raw);
        setQuiz(parsed);
        setStep(3);
        setQuizStartTime(Date.now());
        setCurrentQuestionStartTime(Date.now());
        setQuestionTimes({});
        setTotalQuizTime(0);
      } catch (parseError) {
        console.error("JSON Parse failed. Raw response:", rawText);
        throw new Error("The AI response was not in a valid format. Please try again.");
      }
    } catch (err) {
      alert("Quiz generation failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNextQuestion = () => {
    const timeSpent = Date.now() - currentQuestionStartTime;
    setQuestionTimes(prev => ({ ...prev, [currentQ]: timeSpent }));
    if (currentQ + 1 === quiz.length) {
      submitQuiz();
    } else {
      setCurrentQ(currentQ + 1);
      setCurrentQuestionStartTime(Date.now());
    }
  };

  const submitQuiz = async () => {
    const finalTime = Date.now() - currentQuestionStartTime;
    const updatedTimes = { ...questionTimes, [currentQ]: finalTime };
    const totalTime = Math.round((Date.now() - quizStartTime) / 1000);
    setTotalQuizTime(totalTime);

    let score = 0;
    const analysis = quiz.map((q, i) => {
      const correct = answers[i] === q.correctAnswer;
      if (correct) score++;
      return { ...q, isCorrect: correct, userAnswer: answers[i] || "Not answered", timeSpent: Math.round((updatedTimes[i] || 0) / 1000) };
    });

    setLoading(true);
    const suggestions = await generateAISuggestions(analysis, score, quiz.length, topic);
    setAiSuggestions(suggestions);
    await saveQuizToFirestore(analysis, score, totalTime);
    setResult({ score, total: quiz.length, analysis, totalTime });
    setStep(4);
    setLoading(false);
  };

  const saveQuizToFirestore = async (analysis, score, totalTime) => {
    const uid = sessionStorage.getItem('uid');
    if (!uid) return;
    setSaving(true);
    try {
      const incorrectQuestions = analysis.filter(q => !q.isCorrect).map(q => ({ question: q.question, topic, userAnswer: q.userAnswer, correctAnswer: q.correctAnswer }));
      const quizResultData = { subject: topic, topics: [topic], score: Math.round((score / quiz.length) * 100), totalQuestions: quiz.length, correctAnswers: score, incorrectQuestions, timeSpent: totalTime, difficulty: level };
      await saveQuizResult(uid, quizResultData);
      setSaved(true);
    } catch (error) {
      console.error('Error saving:', error);
    } finally {
      setSaving(false);
    }
  };

  const generateAISuggestions = async (analysis, score, total, topic) => {
    try {
      const incorrectQuestions = analysis.filter(q => !q.isCorrect);
      const prompt = `Student completed a quiz on "${topic}" Score: ${score}/${total}. Struggles: ${incorrectQuestions.map(q => q.question).slice(0, 3).join(", ")}. Provide 3 actionable suggestions.`;
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (err) {
      return "Great effort! Stay consistent.";
    }
  };

  const percent = result ? Math.round((result.score / result.total) * 100) : 0;

  return (
    <Layout>
      <div className="min-h-[calc(100vh-80px)] relative overflow-hidden bg-gray-50/50 flex flex-col pt-6 pb-20 px-4">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
          <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px]" />
        </div>

        <div className="w-full max-w-4xl mx-auto flex-1 flex flex-col">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: TOPIC SELECTION */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.05, y: -10 }}
                className="flex-1 flex flex-col items-center justify-center -mt-6 sm:-mt-12"
              >
                <div className="w-full max-w-xl bg-white/70 backdrop-blur-xl border border-white/40 p-6 sm:p-10 rounded-3xl sm:rounded-[40px] shadow-2xl shadow-purple-500/5">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-soft-primary to-purple-600 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-6 sm:mb-8 shadow-lg shadow-purple-500/20 rotate-3">
                    <BrainCircuit className="w-8 h-8 sm:w-10 sm:h-10 text-white -rotate-3" />
                  </div>
                  
                  <h1 className="text-2xl sm:text-4xl font-black text-soft-text text-center mb-2 tracking-tight">AI Quiz Genius</h1>
                  <p className="text-sm sm:text-base text-gray-500 text-center mb-8 sm:mb-10 font-medium">Test your knowledge with personalized assessments</p>

                  <div className="space-y-4 sm:space-y-6">
                    <div className="group">
                      <label className="block text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest ml-1 mb-2">Topic of Interest</label>
                      <input
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="Ex: Fundamentals of Physics, React..."
                        className="w-full bg-white/50 border-2 border-transparent border-b-gray-100 group-focus-within:border-b-soft-primary px-4 py-3 sm:py-4 text-lg sm:text-xl font-bold text-gray-800 focus:outline-none transition-all placeholder:text-gray-300"
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="block text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Difficulty Level</label>
                      <div className="grid grid-cols-3 gap-2 sm:gap-3">
                        {Object.entries(levelConfig).map(([l, cfg]) => (
                          <button
                            key={l}
                            onClick={() => setLevel(l)}
                            className={`relative px-2 sm:px-4 py-3 sm:py-5 rounded-xl sm:rounded-2xl font-bold transition-all overflow-hidden ${
                              level === l
                                ? "text-white shadow-lg scale-105"
                                : "bg-gray-100/50 text-gray-400 hover:bg-white hover:text-gray-600"
                            }`}
                          >
                            {level === l && (
                              <motion.div layoutId="levelBg" className={`absolute inset-0 bg-gradient-to-br ${cfg.color} -z-10`} />
                            )}
                            <span className="capitalize text-xs sm:text-sm">{l}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => generateSyllabus()}
                      disabled={loading || !topic.trim()}
                      className="w-full bg-soft-text text-white py-4 sm:py-5 rounded-2xl sm:rounded-3xl font-black text-base sm:text-lg shadow-xl shadow-gray-200 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2 mt-2 sm:mt-4"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          Building Roadmap...
                        </>
                      ) : (
                        <>
                          Generate Quiz
                          <ChevronRight className="w-5 h-5" />
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 2: SYLLABUS ROADMAP */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 max-w-2xl mx-auto w-full pt-6 sm:pt-10"
              >
                <div className="bg-white/80 backdrop-blur-xl border border-white p-6 sm:p-12 rounded-3xl sm:rounded-[40px] shadow-2xl">
                  <div className="flex items-center gap-4 mb-8 sm:mb-10">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-100 rounded-xl sm:rounded-2xl flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-gray-800 leading-none mb-1">Learning Roadmap</h2>
                      <p className="text-xs sm:text-sm text-gray-500 font-medium">Mapped for {topic}</p>
                    </div>
                  </div>

                  <div className="space-y-5 sm:space-y-6 mb-10 sm:mb-12 relative">
                    <div className="absolute left-5 sm:left-6 top-8 bottom-8 w-[2px] bg-blue-50" />
                    {syllabus.split("\n").filter(l => l.trim().length > 3).map((line, i) => (
                      <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={i}
                        className="flex gap-4 sm:gap-6 relative"
                      >
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white border border-blue-100 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm z-10">
                          <span className="text-blue-600 font-black text-sm sm:text-base">{i + 1}</span>
                        </div>
                        <div className="pt-2 sm:pt-2.5">
                          <p className="text-sm sm:text-base text-gray-700 font-bold leading-tight">{line.replace(/^[\s-*]+/, '')}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <button onClick={() => setStep(1)} className="order-2 sm:order-1 flex-1 py-4 sm:py-5 rounded-2xl sm:rounded-3xl font-bold text-gray-400 hover:text-gray-600 transition-colors">Go Back</button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={generateQuiz}
                      disabled={loading}
                      className="order-1 sm:order-2 flex-[2] bg-blue-600 text-white py-4 sm:py-5 rounded-2xl sm:rounded-3xl font-black text-base sm:text-lg shadow-xl shadow-blue-200 flex items-center justify-center gap-2"
                    >
                      {loading ? <RefreshCw className="animate-spin" /> : "Start Assessment"}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 3: THE ASSESSMENT */}
            {step === 3 && quiz.length > 0 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-1 flex flex-col items-center justify-center py-4 sm:py-6"
              >
                <div className="w-full max-w-2xl bg-white/90 backdrop-blur-2xl p-6 sm:p-12 rounded-3xl sm:rounded-[48px] shadow-2xl border border-white">
                  <div className="flex justify-between items-end mb-6 sm:mb-8">
                    <div>
                       <span className="text-[10px] sm:text-xs font-black text-purple-600 uppercase tracking-widest block mb-1">In Progress</span>
                       <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Question {currentQ + 1}</h2>
                    </div>
                    <div className="text-right">
                       <span className="text-[10px] sm:text-xs font-bold text-gray-400 block mb-1">Completion</span>
                       <div className="text-xs sm:text-sm font-black text-gray-800">{Math.round(((currentQ + 1) / quiz.length) * 100)}%</div>
                    </div>
                  </div>

                  <div className="h-2 sm:h-3 w-full bg-gray-100 rounded-full mb-8 sm:mb-12 overflow-hidden flex p-0.5 sm:p-1 border border-white">
                    <motion.div
                      className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${((currentQ + 1) / quiz.length) * 100}%` }}
                    />
                  </div>

                  <h3 className="text-lg sm:text-2xl font-bold text-gray-800 mb-8 sm:mb-10 leading-[1.3] min-h-[60px] sm:min-h-[80px]">
                    {quiz[currentQ].question}
                  </h3>

                  <div className="space-y-3 sm:space-y-4 mb-8 sm:mb-10">
                    {Object.entries(quiz[currentQ].options).map(([k, v]) => (
                      <motion.button
                        key={k}
                        whileHover={{ x: 8 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setAnswers({ ...answers, [currentQ]: k })}
                        className={`w-full text-left px-5 sm:px-8 py-4 sm:py-5 rounded-2xl sm:rounded-[28px] border-2 transition-all flex items-center justify-between group ${
                          answers[currentQ] === k
                            ? "bg-soft-primary border-soft-primary text-white shadow-xl shadow-purple-500/20"
                            : "bg-white border-transparent hover:border-gray-100 text-gray-600 hover:text-gray-900 shadow-sm"
                        }`}
                      >
                        <div className="flex items-center gap-3 sm:gap-5">
                          <span className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl sm:rounded-2xl font-black text-sm sm:text-base ${answers[currentQ] === k ? "bg-white/20" : "bg-gray-100 group-hover:bg-gray-200"}`}>{k}</span>
                          <span className="font-bold text-sm sm:text-base">{v}</span>
                        </div>
                        {answers[currentQ] === k && <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />}
                      </motion.button>
                    ))}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleNextQuestion}
                    disabled={!answers[currentQ] || loading}
                    className="w-full bg-black text-white py-4 sm:py-6 rounded-2xl sm:rounded-3xl font-black text-lg sm:text-xl shadow-2xl flex items-center justify-center gap-3 disabled:opacity-30"
                  >
                    {loading ? <RefreshCw className="animate-spin" /> : (currentQ + 1 === quiz.length ? "Submit Exam" : "Save & Continue")}
                    <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* STEP 4: RESULTS DASHBOARD */}
            {step === 4 && result && (
              <motion.div
                key="step4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full max-w-5xl mx-auto space-y-6 sm:space-y-10"
              >
                {/* Result Hero */}
                <div className="relative overflow-hidden bg-white px-6 py-10 sm:px-10 sm:py-16 rounded-[40px] sm:rounded-[60px] shadow-2xl text-center border border-white">
                  <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                     <div className="absolute top-[-20%] left-[-10%] w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] bg-soft-primary rounded-full blur-[100px] sm:blur-[120px]" />
                     <div className="absolute bottom-[-20%] right-[-10%] w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] bg-blue-500 rounded-full blur-[100px] sm:blur-[120px]" />
                  </div>
                  
                  <motion.div 
                    initial={{ scale: 0.8, rotate: -10 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl sm:rounded-[32px] flex items-center justify-center mx-auto mb-6 sm:mb-8 shadow-xl shadow-orange-500/20"
                  >
                    {percent === 100 ? <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-white" /> : <Award className="w-10 h-10 sm:w-12 sm:h-12 text-white" />}
                  </motion.div>
                  
                  <h2 className="text-3xl sm:text-5xl font-black text-gray-900 mb-2 tracking-tight">
                    {percent === 100 ? "Pure Perfection!" : percent >= 70 ? "Brilliant Score!" : "Foundations Built"}
                  </h2>
                  <p className="text-base sm:text-xl text-gray-500 font-medium mb-8 sm:mb-12">Analysis completed for your session on <span className="text-soft-primary font-bold">{topic}</span></p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto relative z-10">
                    {[
                      { label: "Correct", val: `${result.score}/${result.total}`, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
                      { label: "Accuracy", val: `${percent}%`, icon: Target, color: "text-blue-600", bg: "bg-blue-50" },
                      { label: "Duration", val: `${Math.floor(result.totalTime / 60)}m ${result.totalTime % 60}s`, icon: Clock, color: "text-purple-600", bg: "bg-purple-50" },
                      { label: "Level", val: level, icon: TrendingUp, color: "text-pink-600", bg: "bg-pink-50" }
                    ].map((stat, i) => (
                      <div key={i} className={`p-4 sm:p-6 rounded-2xl sm:rounded-[32px] ${stat.bg} flex flex-col items-center justify-center border border-white shadow-sm`}>
                        <stat.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.color} mb-2 sm:mb-3`} />
                        <div className="text-xl sm:text-2xl font-black text-gray-900">{stat.val}</div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI & Detailed Breakdown */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                  <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                    <h3 className="text-xl sm:text-2xl font-extrabold text-gray-800 ml-4 mb-2">Detailed Report</h3>
                    {result.analysis.map((q, i) => (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        key={i} 
                        className="bg-white p-6 sm:p-8 rounded-3xl sm:rounded-[40px] shadow-sm border border-gray-50 flex gap-4 sm:gap-6"
                      >
                        <div className={`mt-1 flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center ${q.isCorrect ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'}`}>
                           {q.isCorrect ? <CheckCircle size={20} className="sm:w-6 sm:h-6" /> : <XCircle size={20} className="sm:w-6 sm:h-6" />}
                        </div>
                        <div className="flex-1">
                           <h4 className="font-bold text-base sm:text-lg text-gray-800 mb-4 sm:mb-6 leading-relaxed">{q.question}</h4>
                           
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
                              <div className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border ${q.isCorrect ? 'bg-green-50/30 border-green-100' : 'bg-red-50/30 border-red-100'}`}>
                                 <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">Student Pick</span>
                                 <span className="text-xs sm:text-sm font-bold">{q.userAnswer}</span>
                              </div>
                              <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl border bg-green-50/30 border-green-100">
                                 <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">Master Answer</span>
                                 <span className="text-xs sm:text-sm font-bold text-green-700">{q.correctAnswer}</span>
                              </div>
                           </div>

                           <div className="bg-gray-50/80 p-5 sm:p-6 rounded-2xl sm:rounded-[28px] text-gray-600 text-xs sm:text-[14px] leading-relaxed relative">
                              <Lightbulb size={20} className="sm:w-6 sm:h-6 absolute -top-2 -right-2 sm:-top-3 sm:-right-3 text-yellow-400 bg-white rounded-full p-1 border shadow-sm" />
                              <strong className="text-gray-900 block mb-2 font-bold uppercase tracking-widest text-[10px]">Strategic Insight</strong>
                              {q.explanation}
                           </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="space-y-6 sm:space-y-8 h-fit lg:sticky lg:top-8">
                    {/* AI Coach Container */}
                    <div className="bg-gradient-to-br from-indigo-700 via-purple-700 to-indigo-900 p-6 sm:p-10 rounded-[40px] sm:rounded-[50px] shadow-2xl text-white relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none group-hover:bg-white/20 transition-all duration-700" />
                      
                      <div className="relative z-10 flex flex-col h-full">
                         <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 backdrop-blur-md rounded-xl sm:rounded-2xl flex items-center justify-center mb-6 sm:mb-8">
                            <Bot className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                         </div>
                         <h3 className="text-xl sm:text-2xl font-black mb-4 sm:mb-6 tracking-tight leading-none">AI Learning<br/>Coach Insights</h3>
                         <div className="text-indigo-50 leading-relaxed whitespace-pre-line text-base sm:text-lg font-medium italic mb-6 sm:mb-8 opacity-90">
                           "{aiSuggestions}"
                         </div>
                         <button
                           onClick={() => navigate('/ai-companion', { 
                             state: { 
                               quizContext: {
                                 topic,
                                 level,
                                 score: result.score,
                                 total: result.total,
                                 weakAreas: result.analysis.filter(q => !q.isCorrect).map(q => q.question)
                               }
                             } 
                           })}
                           className="w-full bg-white text-indigo-900 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black shadow-lg hover:shadow-xl hover:scale-[1.03] active:scale-[0.98] transition-all text-sm sm:text-base"
                         >
                           Deep Dive Analysis
                         </button>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                          setStep(1);
                          setQuiz([]);
                          setAnswers({});
                          setResult(null);
                          setCurrentQ(0);
                      }}
                      className="w-full bg-white border-2 border-gray-100 text-gray-800 py-4 sm:py-5 rounded-2xl sm:rounded-3xl font-black hover:bg-gray-50 transition-all shadow-sm text-sm sm:text-base"
                    >
                      New Assessment
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
}