import { useState } from 'react';
import { X, Calendar, Clock, Target, CheckCircle, XCircle, Award } from 'lucide-react';

export default function QuizHistoryModal({ quizzes, onClose }) {
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  if (!quizzes || quizzes.length === 0) {
    return null;
  }

  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  // If a quiz is selected, show detailed view
  if (selectedQuiz) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                {selectedQuiz.subject}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {formatDate(selectedQuiz.timestamp)}
              </p>
            </div>
            <button
              onClick={() => setSelectedQuiz(null)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <X size={24} className="text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Score Summary */}
          <div className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
            <div className="text-center mb-4">
              <div className="text-5xl font-bold text-purple-600 dark:text-purple-400">
                {selectedQuiz.score}%
              </div>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {selectedQuiz.correctAnswers} / {selectedQuiz.totalQuestions} correct
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg text-center">
                <Clock className="mx-auto text-blue-500 mb-1" size={20} />
                <div className="text-sm font-semibold text-gray-800 dark:text-white">
                  {formatTime(selectedQuiz.timeSpent)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Time</div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg text-center">
                <Target className="mx-auto text-purple-500 mb-1" size={20} />
                <div className="text-sm font-semibold text-gray-800 dark:text-white capitalize">
                  {selectedQuiz.difficulty}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Level</div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg text-center">
                <Award className="mx-auto text-yellow-500 mb-1" size={20} />
                <div className="text-sm font-semibold text-gray-800 dark:text-white">
                  {selectedQuiz.score >= 80 ? 'A' : selectedQuiz.score >= 60 ? 'B' : 'C'}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Grade</div>
              </div>
            </div>
          </div>

          {/* Incorrect Questions */}
          {selectedQuiz.incorrectQuestions && selectedQuiz.incorrectQuestions.length > 0 && (
            <div className="p-6">
              <h3 className="font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <XCircle className="text-red-500" size={20} />
                Incorrect Answers ({selectedQuiz.incorrectQuestions.length})
              </h3>
              <div className="space-y-3">
                {selectedQuiz.incorrectQuestions.map((q, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                  >
                    <p className="font-medium text-gray-800 dark:text-white mb-2">
                      {q.question}
                    </p>
                    <div className="text-sm space-y-1">
                      <div className="text-red-600 dark:text-red-400">
                        <span className="font-semibold">Your answer:</span> {q.userAnswer}
                      </div>
                      <div className="text-green-600 dark:text-green-400">
                        <span className="font-semibold">Correct answer:</span> {q.correctAnswer}
                      </div>
                      {q.topic && (
                        <div className="text-gray-600 dark:text-gray-400">
                          <span className="font-semibold">Topic:</span> {q.topic}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Correct */}
          {(!selectedQuiz.incorrectQuestions || selectedQuiz.incorrectQuestions.length === 0) && (
            <div className="p-6 text-center">
              <CheckCircle className="mx-auto text-green-500 mb-3" size={48} />
              <p className="text-lg font-semibold text-gray-800 dark:text-white">
                Perfect Score! 🎉
              </p>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                You answered all questions correctly!
              </p>
            </div>
          )}

          {/* Back Button */}
          <div className="p-6 border-t dark:border-gray-700">
            <button
              onClick={() => setSelectedQuiz(null)}
              className="w-full py-3 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              ← Back to Quiz History
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Quiz list view
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Quiz History
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <X size={24} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Quiz List */}
        <div className="p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            You've attempted {quizzes.length} {quizzes.length === 1 ? 'quiz' : 'quizzes'}
          </p>

          <div className="space-y-3">
            {quizzes.map((quiz, index) => (
              <button
                key={quiz.id || index}
                onClick={() => setSelectedQuiz(quiz)}
                className="w-full p-4 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 border dark:border-gray-600 rounded-xl text-left transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-800 dark:text-white">
                    {quiz.subject}
                  </h3>
                  <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    quiz.score >= 80
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : quiz.score >= 60
                      ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                      : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                  }`}>
                    {quiz.score}%
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    {formatDate(quiz.timestamp)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    {formatTime(quiz.timeSpent)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Target size={14} />
                    {quiz.totalQuestions} questions
                  </div>
                  <div className="flex items-center gap-1 capitalize">
                    {quiz.difficulty}
                  </div>
                </div>

                {quiz.topics && quiz.topics.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {quiz.topics.slice(0, 3).map((topic, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs rounded-full"
                      >
                        {topic}
                      </span>
                    ))}
                    {quiz.topics.length > 3 && (
                      <span className="px-2 py-1 bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 text-xs rounded-full">
                        +{quiz.topics.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
