import { useEffect } from 'react';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { useAgentMemory } from '../hooks/useAgentMemory';
import { Brain, TrendingUp, Target, Zap, Book, Clock } from 'lucide-react';

export default function StudentInsights() {
  const { user } = useCurrentUser();
  const uid = user?.uid;
  const { memory, insights, loading } = useAgentMemory(uid);

  if (loading) {
    return (
      <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (!insights) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
        <Brain className="text-purple-600" size={24} />
        What Your AI Companion Knows About You
      </h2>

      <div className="space-y-6">
        {/* Learning Profile */}
        <div>
          <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            <Book size={18} className="text-blue-500" />
            Learning Profile
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400">Level</p>
              <p className="font-semibold text-gray-800 dark:text-white capitalize">
                {insights.profile.level}
              </p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400">Style</p>
              <p className="font-semibold text-gray-800 dark:text-white capitalize">
                {insights.profile.style}
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400">Pace</p>
              <p className="font-semibold text-gray-800 dark:text-white capitalize">
                {insights.profile.pace}
              </p>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div>
          <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            <TrendingUp size={18} className="text-green-500" />
            Your Progress
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400">Study Streak</p>
              <p className="font-semibold text-gray-800 dark:text-white text-2xl">
                {insights.progress.studyStreak} 🔥
              </p>
            </div>
            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400">Study Time</p>
              <p className="font-semibold text-gray-800 dark:text-white text-2xl">
                {insights.progress.totalStudyTime}h
              </p>
            </div>
            <div className="bg-pink-50 dark:bg-pink-900/20 p-3 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400">Quizzes Taken</p>
              <p className="font-semibold text-gray-800 dark:text-white text-2xl">
                {insights.progress.quizzesTaken}
              </p>
            </div>
          </div>
        </div>

        {/* Performance */}
        <div>
          <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            <Zap size={18} className="text-yellow-500" />
            Performance Tracking
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400">Struggling</p>
              <p className="font-semibold text-gray-800 dark:text-white text-2xl">
                {insights.performance.struggling}
              </p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400">In Progress</p>
              <p className="font-semibold text-gray-800 dark:text-white text-2xl">
                {insights.performance.inProgress}
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400">Mastered</p>
              <p className="font-semibold text-gray-800 dark:text-white text-2xl">
                {insights.performance.mastered}
              </p>
            </div>
          </div>
        </div>

        {/* Goals */}
        <div>
          <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            <Target size={18} className="text-purple-500" />
            Your Goal
          </h3>
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
            <p className="text-gray-800 dark:text-white">
              {insights.goals.primary}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Motivation: <span className="capitalize">{insights.goals.motivation}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg">
        <p className="text-sm text-gray-700 dark:text-gray-300">
          💡 <strong>How this helps:</strong> Your AI companion uses this information to personalize
          explanations, adjust difficulty, and provide recommendations tailored to your learning journey!
        </p>
      </div>
    </div>
  );
}
