import { useState } from 'react';
import { Sparkles, RefreshCw, Lightbulb } from 'lucide-react';

export default function RecommendationsCard({ recommendations, loading, onRefresh }) {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="text-purple-500" size={20} />
            <h3 className="font-semibold text-gray-800 dark:text-white">AI Recommendations</h3>
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="text-purple-500" size={20} />
            <h3 className="font-semibold text-gray-800 dark:text-white">AI Recommendations</h3>
          </div>
        </div>
        <div className="text-center py-8">
          <Lightbulb className="mx-auto text-gray-400 mb-3" size={48} />
          <p className="text-gray-600 dark:text-gray-400">
            Take a few quizzes to get personalized recommendations!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="text-purple-500" size={20} />
          <h3 className="font-semibold text-gray-800 dark:text-white">AI Recommendations</h3>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
          title="Refresh recommendations"
        >
          <RefreshCw 
            size={18} 
            className={`text-gray-600 dark:text-gray-400 ${refreshing ? 'animate-spin' : ''}`}
          />
        </button>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Personalized study tips based on your performance
      </p>

      <div className="space-y-3">
        {recommendations.map((rec, index) => (
          <RecommendationItem key={index} recommendation={rec} index={index} />
        ))}
      </div>
    </div>
  );
}

function RecommendationItem({ recommendation, index }) {
  const icons = ['🎯', '📚', '💡'];
  const colors = [
    'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800'
  ];

  return (
    <div className={`p-4 rounded-lg border ${colors[index % 3]}`}>
      <div className="flex gap-3">
        <div className="flex-shrink-0 text-2xl">
          {icons[index % 3]}
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            {recommendation.text || recommendation}
          </p>
        </div>
      </div>
    </div>
  );
}
