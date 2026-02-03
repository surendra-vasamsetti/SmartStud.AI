import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import WeakAreasCard from "../components/WeakAreasCard";
import RecommendationsCard from "../components/RecommendationsCard";
import QuizHistoryModal from "../components/QuizHistoryModal";
import PerformanceCharts from "../components/PerformanceCharts";
import ActivityHeatmap from "../components/ActivityHeatmap";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { getAllQuizResults } from "../utils/quizTracking";
import { detectWeakAreas, getMasteredTopics, getPerformanceSummary } from "../utils/weakAreaDetection";
import { generateRecommendations } from "../services/aiRecommendations";
import {
  BarChart3,
  TrendingUp,
  Clock,
  Award,
  Target
} from "lucide-react";

export default function Performance() {
  const { username, email } = useCurrentUser();
  const uid = sessionStorage.getItem("uid");

  // State
  const [quizResults, setQuizResults] = useState([]);
  const [weakAreas, setWeakAreas] = useState([]);
  const [masteredTopics, setMasteredTopics] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [performanceSummary, setPerformanceSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [showQuizHistory, setShowQuizHistory] = useState(false);

  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Load quiz data
  useEffect(() => {
    async function loadPerformanceData() {
      if (!uid) return;

      setLoading(true);
      try {
        // Fetch all quiz results
        const results = await getAllQuizResults(uid);
        setQuizResults(results);

        // Analyze performance
        const weak = detectWeakAreas(results);
        const mastered = getMasteredTopics(results);
        const summary = getPerformanceSummary(results);

        setWeakAreas(weak);
        setMasteredTopics(mastered);
        setPerformanceSummary(summary);

        // Generate AI recommendations
        if (results.length > 0) {
          await loadRecommendations(weak, mastered, summary);
        }
      } catch (error) {
        console.error("Error loading performance data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadPerformanceData();
  }, [uid]);

  // Load AI recommendations
  async function loadRecommendations(weak, mastered, summary) {
    setRecommendationsLoading(true);
    try {
      const recs = await generateRecommendations({
        weakAreas: weak,
        strongAreas: mastered,
        avgScore: summary?.averageScore || 0,
        totalQuizzes: summary?.totalQuizzes || 0,
        recentScores: summary?.recentScores || []
      });
      setRecommendations(recs);
    } catch (error) {
      console.error("Error generating recommendations:", error);
    } finally {
      setRecommendationsLoading(false);
    }
  }

  // Refresh recommendations
  const handleRefreshRecommendations = async () => {
    await loadRecommendations(weakAreas, masteredTopics, performanceSummary);
  };

  // Format time
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* SIDEBAR */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col md:ml-64">
        {/* Navbar */}
        <Navbar 
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
          username={username}
          email={email}
        />

        <main className="flex-1 px-4 sm:px-6 lg:px-10 py-6">
          {/* HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">
              Performance Analytics
            </h1>
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <BarChart3 size={18} />
              <span>Adaptive Learning</span>
            </div>
          </div>

          {loading ? (
            <LoadingSkeleton />
          ) : quizResults.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              {/* STATS CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <button
                  onClick={() => setShowQuizHistory(true)}
                  className="text-left"
                >
                  <StatCard
                    title="Total Quizzes"
                    value={performanceSummary?.totalQuizzes || 0}
                    icon={<BarChart3 className="text-blue-500" size={24} />}
                    color="blue"
                    clickable={true}
                  />
                </button>
                <StatCard
                  title="Average Score"
                  value={`${performanceSummary?.averageScore || 0}%`}
                  icon={<TrendingUp className="text-green-500" size={24} />}
                  color="green"
                />
                <StatCard
                  title="Study Time"
                  value={formatTime(performanceSummary?.totalTimeSpent || 0)}
                  icon={<Clock className="text-purple-500" size={24} />}
                  color="purple"
                />
                <StatCard
                  title="Topics Mastered"
                  value={performanceSummary?.masteredTopicsCount || 0}
                  icon={<Award className="text-yellow-500" size={24} />}
                  color="yellow"
                />
              </div>

              {/* ACTIVITY HEATMAP */}
              <div className="mb-8">
                <ActivityHeatmap quizResults={quizResults} />
              </div>

              {/* PERFORMANCE CHARTS */}
              {quizResults.length >= 2 && (
                <PerformanceCharts quizResults={quizResults} />
              )}

              {/* RECENT SCORES */}
              {performanceSummary?.recentScores && performanceSummary.recentScores.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-8">
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-4">
                    Recent Quiz Scores
                  </h3>
                  <div className="flex items-center gap-2 overflow-x-auto pb-2">
                    {performanceSummary.recentScores.map((score, index) => (
                      <div
                        key={index}
                        className={`flex-shrink-0 px-4 py-2 rounded-lg font-semibold ${
                          score >= 80
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                            : score >= 60
                            ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                        }`}
                      >
                        {score}%
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* WEAK AREAS & RECOMMENDATIONS */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <WeakAreasCard weakAreas={weakAreas} loading={false} />
                <RecommendationsCard
                  recommendations={recommendations}
                  loading={recommendationsLoading}
                  onRefresh={handleRefreshRecommendations}
                />
              </div>

              {/* MASTERED TOPICS */}
              {masteredTopics.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Award className="text-green-500" size={20} />
                    <h3 className="font-semibold text-gray-800 dark:text-white">
                      Mastered Topics
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {masteredTopics.map((topic, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
                      >
                        <span className="font-medium text-green-700 dark:text-green-400">
                          {topic.topic}
                        </span>
                        <span className="text-sm font-semibold text-green-600 dark:text-green-500">
                          {topic.averageScore}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Quiz History Modal */}
      {showQuizHistory && (
        <QuizHistoryModal
          quizzes={quizResults}
          onClose={() => setShowQuizHistory(false)}
        />
      )}
    </div>
  );
}

/* ================= COMPONENTS ================= */

function StatCard({ title, value, icon, color, clickable }) {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20',
    green: 'bg-green-50 dark:bg-green-900/20',
    purple: 'bg-purple-50 dark:bg-purple-900/20',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/20'
  };

  return (
    <div className={`${colorClasses[color]} rounded-xl shadow-sm p-6 border border-${color}-100 dark:border-${color}-800 ${
      clickable ? 'cursor-pointer hover:shadow-md transition-shadow' : ''
    }`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
        {icon}
      </div>
      <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
        {value}
      </h2>
      {clickable && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Click to view history →
        </p>
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center">
      <Target className="mx-auto text-gray-400 mb-4" size={64} />
      <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
        No Quiz Data Yet
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Take your first quiz to see personalized performance analytics and AI-powered recommendations!
      </p>
      <a
        href="/quiz-generator"
        className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
      >
        <BarChart3 size={20} />
        Take a Quiz
      </a>
    </div>
  );
}
