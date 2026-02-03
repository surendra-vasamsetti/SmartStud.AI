import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function PerformanceCharts({ quizResults }) {
  if (!quizResults || quizResults.length === 0) {
    return null;
  }

  // Prepare data for score trend chart
  const scoreTrendData = quizResults
    .slice()
    .reverse() // Oldest to newest
    .map((quiz, index) => ({
      quiz: `Quiz ${index + 1}`,
      score: quiz.score,
      date: quiz.timestamp ? new Date(quiz.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : `Q${index + 1}`
    }));

  // Prepare data for subject performance
  const subjectPerformance = {};
  quizResults.forEach(quiz => {
    const subject = quiz.subject || 'General';
    if (!subjectPerformance[subject]) {
      subjectPerformance[subject] = { total: 0, count: 0 };
    }
    subjectPerformance[subject].total += quiz.score;
    subjectPerformance[subject].count += 1;
  });

  const subjectData = Object.entries(subjectPerformance).map(([subject, data]) => ({
    subject: subject.length > 15 ? subject.substring(0, 15) + '...' : subject,
    avgScore: Math.round(data.total / data.count),
    quizzes: data.count
  }));

  // Prepare data for performance distribution pie chart
  const gradeDistribution = {
    excellent: 0, // 90-100%
    good: 0,      // 70-89%
    average: 0,   // 50-69%
    needsWork: 0  // 0-49%
  };

  quizResults.forEach(quiz => {
    if (quiz.score >= 90) gradeDistribution.excellent++;
    else if (quiz.score >= 70) gradeDistribution.good++;
    else if (quiz.score >= 50) gradeDistribution.average++;
    else gradeDistribution.needsWork++;
  });

  const pieData = [
    { name: 'Excellent (90-100%)', value: gradeDistribution.excellent, color: '#22c55e' },
    { name: 'Good (70-89%)', value: gradeDistribution.good, color: '#3b82f6' },
    { name: 'Average (50-69%)', value: gradeDistribution.average, color: '#f59e0b' },
    { name: 'Needs Work (<50%)', value: gradeDistribution.needsWork, color: '#ef4444' }
  ].filter(item => item.value > 0);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border dark:border-gray-600 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800 dark:text-white">{label}</p>
          <p className="text-purple-600 dark:text-purple-400">
            Score: {payload[0].value}%
          </p>
        </div>
      );
    }
    return null;
  };

  const SubjectTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border dark:border-gray-600 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800 dark:text-white">{label}</p>
          <p className="text-blue-600 dark:text-blue-400">
            Avg Score: {payload[0].value}%
          </p>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {payload[0].payload.quizzes} {payload[0].payload.quizzes === 1 ? 'quiz' : 'quizzes'}
          </p>
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border dark:border-gray-600 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800 dark:text-white">{payload[0].name}</p>
          <p className="text-gray-600 dark:text-gray-400">
            {payload[0].value} {payload[0].value === 1 ? 'quiz' : 'quizzes'} ({((payload[0].value / quizResults.length) * 100).toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="font-bold text-sm"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="space-y-6">
      {/* Score Trend and Pie Chart Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Trend Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-800 dark:text-white mb-4">
            📈 Score Trend Over Time
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={scoreTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis 
                dataKey="date" 
                stroke="#6B7280"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#6B7280"
                style={{ fontSize: '12px' }}
                domain={[0, 100]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke="#9333ea" 
                strokeWidth={3}
                dot={{ fill: '#9333ea', r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
            Track your improvement across all quizzes
          </p>
        </div>

        {/* Performance Distribution Pie Chart */}
        {pieData.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-800 dark:text-white mb-4">
              🥧 Performance Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomLabel}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Legend */}
            <div className="grid grid-cols-2 gap-2 mt-4">
              {pieData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {item.name.split(' ')[0]}
                  </span>
                </div>
              ))}
            </div>
            
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
              Breakdown of your quiz performance by grade
            </p>
          </div>
        )}
      </div>

      {/* Subject Performance Chart */}
      {subjectData.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-800 dark:text-white mb-4">
            📊 Performance by Subject
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={subjectData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis 
                dataKey="subject" 
                stroke="#6B7280"
                style={{ fontSize: '12px' }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                stroke="#6B7280"
                style={{ fontSize: '12px' }}
                domain={[0, 100]}
              />
              <Tooltip content={<SubjectTooltip />} />
              <Bar 
                dataKey="avgScore" 
                fill="#3b82f6"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
            Compare your average scores across different subjects
          </p>
        </div>
      )}
    </div>
  );
}
