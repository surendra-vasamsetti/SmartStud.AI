import React, { useState, useEffect } from 'react';
import { saveQuizResult } from '../utils/quizTracking';
import { 
  Check, 
  X, 
  ChevronRight, 
  Clock, 
  Trophy, 
  Award, 
  CheckCircle, 
  XCircle, 
  Lightbulb,
  Bot,
  RefreshCw,
  Target,
  BarChart2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function QuizDisplay({ content, subject = 'General' }) {
  const navigate = useNavigate();
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setStartTime(Date.now());
  }, []);

  if (!content) return null;

  let quizData = [];
  try {
    // Robust extraction: remove code blocks and find array boundaries
    let cleaned = content.replace(/```(?:json)?\s*([\s\S]*?)\s*```/g, "$1");
    const start = cleaned.indexOf('[');
    const end = cleaned.lastIndexOf(']') + 1;
    
    if (start !== -1 && end !== -1) {
      let jsonStr = cleaned.substring(start, end);
      jsonStr = jsonStr.replace(/[\u0000-\u001F]+/g, " "); // Remove control chars
      jsonStr = jsonStr.replace(/,\s*([\]}])/g, "$1");      // Remove trailing commas
      quizData = JSON.parse(jsonStr);
    } else {
      quizData = JSON.parse(cleaned);
    }
  } catch (e) {
    console.error("QuizDisplay Parse Error. Content:", content);
    return (
      <div className="bg-red-50 p-6 rounded-2xl border border-red-100 text-red-600 text-center font-bold">
        Error parsing quiz data. The AI response was formatted incorrectly.
      </div>
    );
  }

  if (!Array.isArray(quizData) || quizData.length === 0) {
    return (
      <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 text-gray-500 text-center font-bold">
        No quiz questions generated.
      </div>
    );
  }

  const handleAnswer = (answer) => {
    setAnswers({ ...answers, [currentQ]: answer });
  };

  const nextQuestion = async () => {
    if (currentQ < quizData.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      setShowResults(true);
      await saveQuizResultToFirestore();
    }
  };

  const correctCount = Object.keys(answers).filter(
    (qIdx) => answers[qIdx] === quizData[qIdx].correctAnswer
  ).length;
  
  const score = Math.round((correctCount / quizData.length) * 100);

  const extractTopics = () => {
    const topics = new Set();
    quizData.forEach(q => {
      const questionWords = q.question.split(' ');
      questionWords.forEach(word => {
        if (word.length > 4 && /^[A-Z]/.test(word)) {
          topics.add(word.replace(/[^a-zA-Z]/g, ''));
        }
      });
    });
    return Array.from(topics).slice(0, 5);
  };

  const getIncorrectQuestions = () => {
    const incorrect = [];
    Object.keys(answers).forEach(qIdx => {
      if (answers[qIdx] !== quizData[qIdx].correctAnswer) {
        incorrect.push({
          question: quizData[qIdx].question,
          topic: extractTopics()[0] || subject,
          userAnswer: answers[qIdx],
          correctAnswer: quizData[qIdx].correctAnswer
        });
      }
    });
    return incorrect;
  };

  const saveQuizResultToFirestore = async () => {
    const uid = localStorage.getItem('uid') || sessionStorage.getItem('uid');
    if (!uid) return;

    setSaving(true);
    try {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      const topics = extractTopics();

      const quizResultData = {
        subject: subject,
        topics: topics.length > 0 ? topics : [subject],
        score: score,
        totalQuestions: quizData.length,
        correctAnswers: correctCount,
        incorrectQuestions: getIncorrectQuestions(),
        timeSpent: timeSpent,
        difficulty: 'medium'
      };

      await saveQuizResult(uid, quizResultData);
      setSaved(true);
    } catch (error) {
      console.error('Error saving quiz result:', error);
    } finally {
      setSaving(false);
    }
  };

  const percent = score;
  const totalTime = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;

  if (showResults) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-5xl mx-auto space-y-10"
      >
        {/* Results Hero */}
        <div className="relative overflow-hidden bg-white px-6 py-10 sm:px-12 sm:py-16 rounded-[40px] sm:rounded-[60px] shadow-2xl text-center border border-white">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
             <div className="absolute top-[-20%] left-[-10%] w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] bg-purple-500 rounded-full blur-[100px] sm:blur-[120px]" />
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
          <p className="text-base sm:text-xl text-gray-500 font-medium mb-8 sm:mb-12">Session analysis for <span className="text-soft-primary font-bold">{subject}</span></p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto relative z-10">
            {[
              { label: "Correct", val: `${correctCount}/${quizData.length}`, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
              { label: "Accuracy", val: `${percent}%`, icon: Target, color: "text-blue-600", bg: "bg-blue-50" },
              { label: "Duration", val: `${Math.floor(totalTime / 60)}m ${totalTime % 60}s`, icon: Clock, color: "text-purple-600", bg: "bg-purple-50" },
              { label: "Points", val: `+${correctCount * 10}`, icon: BarChart2, color: "text-pink-600", bg: "bg-pink-50" }
            ].map((stat, i) => (
              <div key={i} className={`p-4 sm:p-6 rounded-2xl sm:rounded-[32px] ${stat.bg} flex flex-col items-center justify-center border border-white shadow-sm`}>
                <stat.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.color} mb-2 sm:mb-3`} />
                <div className="text-xl sm:text-2xl font-black text-gray-900">{stat.val}</div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-center">
             {saving && <span className="text-xs font-bold text-gray-400 animate-pulse">Saving session data...</span>}
             {saved && <span className="text-xs font-black text-green-500 flex items-center gap-1"><Check size={14}/> Session data secured</span>}
          </div>
        </div>

        {/* Breakdown */}
        <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto">
          <h3 className="text-xl sm:text-2xl font-black text-gray-800 ml-4 mb-2">Performance Breakdown</h3>
          {quizData.map((q, idx) => (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              key={idx}
              className="bg-white p-6 sm:p-8 rounded-3xl sm:rounded-[40px] shadow-sm border border-gray-50 flex gap-4 sm:gap-6"
            >
              <div className={`mt-1 flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center ${answers[idx] === q.correctAnswer ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'}`}>
                {answers[idx] === q.correctAnswer ? <CheckCircle size={20} className="sm:w-6 sm:h-6" /> : <XCircle size={20} className="sm:w-6 sm:h-6" />}
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-base sm:text-lg text-gray-800 mb-4 sm:mb-6 leading-relaxed">{q.question}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
                  <div className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border ${answers[idx] === q.correctAnswer ? 'bg-green-50/30 border-green-100' : 'bg-red-50/30 border-red-100'}`}>
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">Student Perspective</span>
                    <span className="text-xs sm:text-sm font-bold">{answers[idx] || 'Not answered'}</span>
                  </div>
                  <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl border bg-green-50/30 border-green-100">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">Correct Response</span>
                    <span className="text-xs sm:text-sm font-bold text-green-700">{q.correctAnswer}</span>
                  </div>
                </div>
                {q.explanation && (
                  <div className="bg-gray-50/80 p-5 sm:p-6 rounded-2xl sm:rounded-[28px] text-gray-600 text-xs sm:text-[14px] leading-relaxed relative">
                    <Lightbulb size={20} className="sm:w-6 sm:h-6 absolute -top-2 -right-2 sm:-top-3 sm:-right-3 text-yellow-400 bg-white rounded-full p-1 border shadow-sm" />
                    <strong className="text-gray-900 block mb-2 font-bold uppercase tracking-widest text-[10px]">Context insight</strong>
                    {q.explanation}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          
          <div className="bg-gradient-to-br from-indigo-700 via-purple-700 to-indigo-900 p-6 sm:p-10 rounded-[40px] shadow-2xl text-white relative overflow-hidden group mb-6">
            <div className="relative z-10 flex flex-col h-full">
               <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center mb-6">
                  <Bot className="w-6 h-6 text-white" />
               </div>
               <h3 className="text-xl sm:text-2xl font-black mb-4 tracking-tight leading-none">AI Learning<br/>Coach Insights</h3>
               <div className="text-indigo-50 leading-relaxed text-base font-medium italic mb-6 opacity-90">
                 "I've analyzed your session on {subject}. Ready for a deeper breakdown of your performance?"
               </div>
               <button
                 onClick={() => navigate('/ai-companion', { 
                   state: { 
                     quizContext: {
                       topic: subject,
                       level: 'advanced', // Default or derived
                       score: correctCount,
                       total: quizData.length,
                       weakAreas: quizData.filter((q, idx) => answers[idx] !== q.correctAnswer).map(q => q.question)
                     }
                   } 
                 })}
                 className="w-full bg-white text-indigo-900 py-3 rounded-xl font-black shadow-lg hover:shadow-xl hover:scale-[1.03] active:scale-[0.98] transition-all text-sm"
               >
                 Deep Dive Analysis
               </button>
            </div>
          </div>

          <button
            onClick={() => {
              setCurrentQ(0);
              setAnswers({});
              setShowResults(false);
              setSaved(false);
              setStartTime(Date.now());
            }}
            className="w-full mt-4 py-4 sm:py-5 bg-black text-white rounded-2xl sm:rounded-[24px] font-black text-base sm:text-lg shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all"
          >
            Reset Session
          </button>
        </div>
      </motion.div>
    );
  }

  const question = quizData[currentQ];

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center -mt-6 sm:-mt-20 px-1">
      <div className="w-full bg-white/90 backdrop-blur-2xl p-6 sm:p-12 rounded-3xl sm:rounded-[48px] shadow-2xl border border-white">
        <div className="flex justify-between items-end mb-6 sm:mb-8">
           <div>
              <span className="text-[10px] sm:text-xs font-black text-purple-600 uppercase tracking-widest block mb-1">Active Question</span>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">#{currentQ + 1}</h2>
           </div>
           <div className="text-right">
              <span className="text-[10px] sm:text-xs font-bold text-gray-400 block mb-1">Impact</span>
              <div className="text-xs sm:text-sm font-black text-gray-800">{Math.round(((currentQ + 1) / quizData.length) * 100)}% Complete</div>
           </div>
        </div>

        <div className="h-2 sm:h-3 w-full bg-gray-100 rounded-full mb-8 sm:mb-12 overflow-hidden flex p-0.5 sm:p-1 border border-white">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((currentQ + 1) / quizData.length) * 100}%` }}
          />
        </div>

        <h3 className="text-lg sm:text-2xl font-bold text-gray-800 mb-8 sm:mb-10 leading-[1.3] min-h-[60px] sm:min-h-[80px]">
          {question.question}
        </h3>

        <div className="space-y-3 sm:space-y-4 mb-8 sm:mb-10">
          {question.options.map((option, idx) => {
            const letter = option.charAt(0);
            const isSelected = answers[currentQ] === letter;
            
            return (
              <motion.button
                key={idx}
                whileHover={{ x: 8 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleAnswer(letter)}
                className={`w-full text-left px-5 sm:px-8 py-4 sm:py-5 rounded-2xl sm:rounded-[28px] border-2 transition-all flex items-center justify-between group ${
                  isSelected
                    ? "bg-soft-primary border-soft-primary text-white shadow-xl shadow-purple-500/20"
                    : "bg-white border-transparent hover:border-gray-100 text-gray-600 hover:text-gray-900 shadow-sm"
                }`}
              >
                <div className="flex items-center gap-3 sm:gap-5">
                   <span className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl sm:rounded-2xl font-black text-sm sm:text-base ${isSelected ? "bg-white/20" : "bg-gray-100 group-hover:bg-gray-200"}`}>{letter}</span>
                   <span className="font-bold text-sm sm:text-base">{option}</span>
                </div>
                {isSelected && <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />}
              </motion.button>
            );
          })}
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={nextQuestion}
          disabled={!answers[currentQ]}
          className="w-full bg-black text-white py-4 sm:py-6 rounded-2xl sm:rounded-3xl font-black text-lg sm:text-xl shadow-2xl flex items-center justify-center gap-3 disabled:opacity-30"
        >
          {currentQ < quizData.length - 1 ? 'Save & Continue' : 'Finish Session'}
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </motion.button>
      </div>
    </div>
  );
}
