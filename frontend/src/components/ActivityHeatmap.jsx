export default function ActivityHeatmap({ quizResults }) {
  if (!quizResults || quizResults.length === 0) {
    return null;
  }

  // Get last 7 days
  const today = new Date();
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (6 - i));
    return date;
  });

  // Count quizzes per day
  const activityData = last7Days.map(date => {
    const dateStr = date.toDateString();
    const count = quizResults.filter(quiz => {
      if (!quiz.timestamp) return false;
      const quizDate = quiz.timestamp instanceof Date ? quiz.timestamp : new Date(quiz.timestamp);
      return quizDate.toDateString() === dateStr;
    }).length;

    return {
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      date: date.getDate(),
      count,
      intensity: count === 0 ? 0 : count <= 2 ? 1 : count <= 4 ? 2 : 3
    };
  });

  const getColorClass = (intensity) => {
    switch (intensity) {
      case 0: return 'bg-gray-100 dark:bg-gray-700';
      case 1: return 'bg-purple-200 dark:bg-purple-900/40';
      case 2: return 'bg-purple-400 dark:bg-purple-700';
      case 3: return 'bg-purple-600 dark:bg-purple-500';
      default: return 'bg-gray-100 dark:bg-gray-700';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
      <h3 className="font-semibold text-gray-800 dark:text-white mb-4">
        🔥 Weekly Activity
      </h3>

      <div className="flex justify-between gap-2">
        {activityData.map((day, index) => (
          <div key={index} className="flex-1 text-center">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              {day.day}
            </div>
            <div
              className={`${getColorClass(day.intensity)} rounded-lg h-20 flex items-center justify-center transition-all hover:scale-105 cursor-pointer`}
              title={`${day.count} ${day.count === 1 ? 'quiz' : 'quizzes'} on ${day.day}`}
            >
              <span className="font-bold text-gray-700 dark:text-white">
                {day.count > 0 ? day.count : ''}
              </span>
            </div>
            <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {day.date}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-600 dark:text-gray-400">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-4 h-4 rounded bg-gray-100 dark:bg-gray-700"></div>
          <div className="w-4 h-4 rounded bg-purple-200 dark:bg-purple-900/40"></div>
          <div className="w-4 h-4 rounded bg-purple-400 dark:bg-purple-700"></div>
          <div className="w-4 h-4 rounded bg-purple-600 dark:bg-purple-500"></div>
        </div>
        <span>More</span>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
        Your quiz activity over the past 7 days
      </p>
    </div>
  );
}
