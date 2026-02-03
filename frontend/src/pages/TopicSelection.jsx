import React from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

const topics = [
  "HTML",
  "CSS",
  "JavaScript",
  "React",
  "Python",
  "Java",
  "DSA",
  "Aptitude",
  "AI/ML",
  "DBMS"
];

export default function TopicSelection() {
  const navigate = useNavigate();

  const selectTopic = (topic) => {
    sessionStorage.setItem("selectedTopic", topic);
    navigate("/ai-quiz");
  };

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center py-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-soft-text mb-3 tracking-tight">Select a Topic</h1>
          <p className="text-soft-muted text-lg">Choose your subject to start the quiz challenge</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-4xl w-full">
          {topics.map((topic) => (
            <button
              key={topic}
              onClick={() => selectTopic(topic)}
              className="
                group relative bg-soft-paper p-6 rounded-2xl shadow-soft hover:shadow-soft-hover 
                transition-all duration-300 transform hover:-translate-y-1 border border-soft-primary/5
                flex flex-col items-center justify-center gap-4
              "
            >
              <div className="w-12 h-12 rounded-full bg-soft-primary/10 flex items-center justify-center group-hover:bg-soft-primary/20 transition-colors">
                <span className="text-2xl font-bold text-soft-primary">
                  {topic.charAt(0)}
                </span>
              </div>
              <span className="text-lg font-semibold text-soft-text group-hover:text-soft-primary transition-colors">
                {topic}
              </span>
              
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-soft-primary/20 rounded-2xl transition-colors pointer-events-none" />
            </button>
          ))}
        </div>
      </div>
    </Layout>
  );
}
