export default function Performance({ questions, answers }) {
  let correct = 0;

  questions.forEach((q, i) => {
    if (q.correctAnswer === answers[i]) correct++;
  });

  const accuracy = ((correct / questions.length) * 100).toFixed(2);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md bg-slate-900 text-white rounded-xl p-6 shadow-lg text-center">
        <h2 className="text-2xl font-bold mb-6">Quiz Performance</h2>

        <div className="space-y-2 text-lg">
          <p>
            Total Questions:{" "}
            <span className="font-semibold">{questions.length}</span>
          </p>
          <p>
            Correct Answers:{" "}
            <span className="font-semibold text-green-400">
              {correct}
            </span>
          </p>
          <p>
            Accuracy:{" "}
            <span className="font-semibold text-indigo-400">
              {accuracy}%
            </span>
          </p>
        </div>

        <h3
          className={`mt-6 text-xl font-semibold ${
            accuracy >= 80
              ? "text-green-400"
              : accuracy >= 50
              ? "text-yellow-400"
              : "text-red-400"
          }`}
        >
          {accuracy >= 80
            ? "Excellent! 🔥"
            : accuracy >= 50
            ? "Good, keep practicing 👍"
            : "Needs Improvement ⚠️"}
        </h3>

        <button
          onClick={() => window.location.reload()}
          className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 transition py-3 rounded font-semibold"
        >
          Practice Again
        </button>
      </div>
    </div>
  );
}
