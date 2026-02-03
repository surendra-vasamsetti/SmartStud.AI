import React, { useState } from "react";
import axios from "axios";

export default function AdaptiveQuiz() {
  const [topic, setTopic] = useState("Linear Algebra");
  const [quiz, setQuiz] = useState("");

  async function generateQuiz() {
    const res = await axios.post(import.meta.env.VITE_API + "/quiz/generate", {
      topic,
    });
    setQuiz(res.data.quiz);
  }

  return (
    <div className="bg-white p-4 rounded shadow mb-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-semibold">Adaptive Quiz</h2>
        <button
          className="bg-green-600 text-white px-3 py-1 rounded"
          onClick={generateQuiz}
        >
          Generate Quiz
        </button>
      </div>

      <pre className="text-gray-700 whitespace-pre-wrap">
        {quiz || "Click Generate Quiz to start."}
      </pre>
    </div>
  );
}
