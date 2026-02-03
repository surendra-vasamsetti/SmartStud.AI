import React, { useState } from "react";
import axios from "axios";

export default function StudyMaterial() {
  const [topic, setTopic] = useState("Linear Algebra");
  const [content, setContent] = useState("");

  async function generate() {
    const res = await axios.post(import.meta.env.VITE_API + "/content/generate", {
      topic,
    });
    setContent(res.data.content);
  }

  return (
    <div className="bg-white p-4 rounded shadow mb-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-semibold">Personalized Study Material</h2>
        <button
          className="bg-blue-600 text-white px-3 py-1 rounded"
          onClick={generate}
        >
          Generate
        </button>
      </div>

      <p className="text-gray-700">
        {content || "Press Generate to create AI content"}
      </p>
    </div>
  );
}
