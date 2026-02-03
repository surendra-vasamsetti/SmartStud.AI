import { AlertTriangle, Target, TrendingDown, BookOpen } from 'lucide-react';

export default function WeakAreasCard({ weakAreas, loading }) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Target className="text-red-500" size={20} />
          <h3 className="font-semibold text-gray-800 dark:text-white">Weak Areas</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!weakAreas || weakAreas.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Target className="text-green-500" size={20} />
          <h3 className="font-semibold text-gray-800 dark:text-white">Weak Areas</h3>
        </div>
        <div className="text-center py-8">
          <div className="text-6xl mb-3">🎉</div>
          <p className="text-gray-600 dark:text-gray-400">
            No weak areas detected!
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
            Keep up the great work!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <Target className="text-red-500" size={20} />
        <h3 className="font-semibold text-gray-800 dark:text-white">Weak Areas</h3>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Topics where you scored below 60%
      </p>

      <div className="space-y-3">
        {weakAreas.slice(0, 5).map((area, index) => (
          <WeakAreaItem key={index} area={area} />
        ))}
      </div>

      {weakAreas.length > 5 && (
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-3 text-center">
          +{weakAreas.length - 5} more weak areas
        </p>
      )}
    </div>
  );
}

function WeakAreaItem({ area }) {
  const severityColor = area.severity === 'critical' 
    ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
    : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';

  const severityIcon = area.severity === 'critical' ? '🔴' : '🟡';

  return (
    <div className={`p-3 rounded-lg border ${severityColor}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span>{severityIcon}</span>
          <span className="font-medium">{area.topic}</span>
        </div>
        <span className="text-sm font-semibold">{area.accuracy}%</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-white dark:bg-gray-700 h-2 rounded-full overflow-hidden">
        <div
          className={`h-2 transition-all ${
            area.severity === 'critical' 
              ? 'bg-red-500' 
              : 'bg-yellow-500'
          }`}
          style={{ width: `${area.accuracy}%` }}
        />
      </div>

      <div className="flex items-center justify-between mt-2 text-xs">
        <span className="opacity-75">
          {area.attemptsCount} {area.attemptsCount === 1 ? 'attempt' : 'attempts'}
        </span>
        <button className="flex items-center gap-1 hover:underline font-medium">
          <BookOpen size={12} />
          Practice
        </button>
      </div>
    </div>
  );
}
