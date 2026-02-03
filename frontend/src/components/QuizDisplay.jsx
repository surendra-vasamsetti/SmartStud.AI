import React, { useState, useEffect } from 'react';
import { saveQuizResult } from '../utils/quizTracking';
import { Check, X } from 'lucide-react';

export default function QuizDisplay({ content, subject = 'General' }) {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Track start time when component mounts
  useEffect(() => {
    setStartTime(Date.now());
  }, []);

  if (!content) return null;

  // Parse quiz content - extract JSON from markdown if needed
  let quizData = [];
  try {
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    const jsonStr = jsonMatch ? jsonMatch[0] : content;
    quizData = JSON.parse(jsonStr);
  } catch (e) {
    return <div className="text-red-500">Error parsing quiz data. Please try again.</div>;
  }

  if (!Array.isArray(quizData) || quizData.length === 0) {
    return <div className="text-gray-500">No quiz questions generated.</div>;
  }

  const handleAnswer = (answer) => {
    setAnswers({ ...answers, [currentQ]: answer });
  };

  const nextQuestion = async () => {
    if (currentQ < quizData.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      setShowResults(true);
      // Save quiz result
      await saveQuizResultToFirestore();
    }
  };

  // Calculate score and incorrect answers
  const correctCount = Object.keys(answers).filter(
    (qIdx) => answers[qIdx] === quizData[qIdx].correctAnswer
  ).length;
  
  const score = Math.round((correctCount / quizData.length) * 100);

  // Extract topics from questions (simple keyword extraction)
  const extractTopics = () => {
    const topics = new Set();
    quizData.forEach(q => {
      // Extract potential topics from question text
      const words = q.question.toLowerCase().split(' ');
      // Look for capitalized words or technical terms
      const questionWords = q.question.split(' ');
      questionWords.forEach(word => {
        if (word.length > 4 && /^[A-Z]/.test(word)) {
          topics.add(word.replace(/[^a-zA-Z]/g, ''));
        }
      });
    });
    return Array.from(topics).slice(0, 5); // Limit to 5 topics
  };

  // Get incorrect questions with details
  const getIncorrectQuestions = () => {
    const incorrect = [];
    Object.keys(answers).forEach(qIdx => {
      if (answers[qIdx] !== quizData[qIdx].correctAnswer) {
        incorrect.push({
          question: quizData[qIdx].question,
          topic: extractTopics()[0] || subject, // Use first topic or subject
          userAnswer: answers[qIdx],
          correctAnswer: quizData[qIdx].correctAnswer
        });
      }
    });
    return incorrect;
  };

  // Save quiz result to Firestore
  const saveQuizResultToFirestore = async () => {
    const uid = localStorage.getItem('uid');
    if (!uid) return;

    setSaving(true);
    try {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000); // seconds
      const topics = extractTopics();

      const quizResultData = {
        subject: subject,
        topics: topics.length > 0 ? topics : [subject],
        score: score,
        totalQuestions: quizData.length,
        correctAnswers: correctCount,
        incorrectQuestions: getIncorrectQuestions(),
        timeSpent: timeSpent,
        difficulty: 'medium' // Can be made dynamic later
      };

      await saveQuizResult(uid, quizResultData);
      setSaved(true);
      console.log('Quiz result saved successfully!');
    } catch (error) {
      console.error('Error saving quiz result:', error);
    } finally {
      setSaving(false);
    }
  };

  if (showResults) {
    return (
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
        <h3 className="text-2xl font-bold mb-6 text-center dark:text-white">Quiz Results</h3>
        
        {/* Score Display */}
        <div className="text-center mb-8">
          <div className="text-5xl font-bold text-purple-600 dark:text-purple-400">
            {correctCount} / {quizData.length}
          </div>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {score}% Correct
          </p>
          
          {/* Save Status */}
          {saving && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              💾 Saving results...
            </p>
          )}
          {saved && (
            <p className="text-sm text-green-600 dark:text-green-400 mt-2 flex items-center justify-center gap-1">
              <Check size={16} /> Results saved! View in Performance page
            </p>
          )}
        </div>

        {/* Review */}
        <div className="space-y-4">
          {quizData.map((q, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-lg border-2 ${
                answers[idx] === q.correctAnswer
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20 dark:border-green-700'
                  : 'border-red-500 bg-red-50 dark:bg-red-900/20 dark:border-red-700'
              }`}
            >
              <div className="font-semibold mb-2 dark:text-white">
                {idx + 1}. {q.question}
              </div>
              <div className="text-sm">
                <span className="font-semibold dark:text-gray-300">Your answer: </span>
                <span className={answers[idx] === q.correctAnswer ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}>
                  {answers[idx] || 'Not answered'}
                </span>
              </div>
              <div className="text-sm text-green-700 dark:text-green-400">
                <span className="font-semibold">Correct answer: </span>
                {q.correctAnswer}
              </div>
              {q.explanation && (
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-2 italic">
                  💡 {q.explanation}
                </div>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={() => {
            setCurrentQ(0);
            setAnswers({});
            setShowResults(false);
            setSaved(false);
            setStartTime(Date.now());
          }}
          className="w-full mt-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600"
        >
          Retake Quiz
        </button>
      </div>
    );
  }

  const question = quizData[currentQ];

  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
          Question {currentQ + 1} of {quizData.length}
        </span>
        <div className="h-2 flex-1 mx-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-purple-600 dark:bg-purple-500 transition-all"
            style={{ width: `${((currentQ + 1) / quizData.length) * 100}%` }}
          />
        </div>
      </div>

      <h3 className="text-xl font-bold mb-6 dark:text-white">{question.question}</h3>

      <div className="space-y-3 mb-6">
        {question.options.map((option, idx) => {
          const letter = option.charAt(0);
          const isSelected = answers[currentQ] === letter;
          
          return (
            <button
              key={idx}
              onClick={() => handleAnswer(letter)}
              className={`w-full text-left p-4 rounded-lg border-2 transition ${
                isSelected
                  ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/30 dark:border-purple-500'
                  : 'border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-500'
              }`}
            >
              <span className="dark:text-white">{option}</span>
            </button>
          );
        })}
      </div>

      <button
        onClick={nextQuestion}
        disabled={!answers[currentQ]}
        className="w-full py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-purple-500 dark:hover:bg-purple-600"
      >
        {currentQ < quizData.length - 1 ? 'Next Question' : 'Submit Quiz'}
      </button>
    </div>
  );
}
