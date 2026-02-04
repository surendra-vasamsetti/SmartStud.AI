import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { GoogleGenerativeAI } from "@google/generative-ai";
import MindMapDisplay from "../components/MindMapDisplay";
import { motion } from "framer-motion";
import { Network, X } from "lucide-react";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export default function MindMapPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const sourceText = location.state?.response;

  useEffect(() => {
    console.log("MindMapPage mounted. Source text:", sourceText); // Debug log

    if (!sourceText) {
      setError("No content to generate Mind Map from. Please start a chat first.");
      setLoading(false);
      return;
    }

    const generate = async () => {
      try {
        const prompt = `Analyze this content and create a hierarchical mind map:

"${sourceText}"

CRITICAL: You must return EXACTLY ONE JSON object (NOT an array).

The structure must have:
1. ONE root "topic" that summarizes the MAIN SUBJECT of the content
2. Multiple "children" representing KEY CONCEPTS
3. Each child can have its own "children" for details

TOPIC NAME RULES:
- Root topic: Clear, concise summary (e.g., "Python Programming", "Machine Learning Basics")
- Keep ALL names SHORT: 2-5 words maximum
- Use descriptive nouns, not full sentences

EXAMPLE OF CORRECT FORMAT:
{
  "topic": "Java Programming",
  "children": [
    {
      "topic": "Core Features",
      "children": [
        { "topic": "Object-Oriented" },
        { "topic": "Platform Independent" }
      ]
    },
    {
      "topic": "Key Applications",
      "children": [
        { "topic": "Enterprise Software" },
        { "topic": "Android Development" }
      ]
    }
  ]
}

WRONG (DO NOT DO THIS):
[
  { "topic": "Feature 1" },
  { "topic": "Feature 2" }
]

Return ONLY the JSON object. NO markdown. NO code blocks. NO arrays at root level.`;

        console.log("Sending prompt to Gemini...");
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        console.log("Gemini Response:", text); // Debug log

        // Clean up markdown code blocks just in case
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        setContent(cleanText);
      } catch (err) {
        console.error("Mind Map Error:", err);
        setError("Failed to generate Mind Map.");
      } finally {
        setLoading(false);
      }
    };

    generate();
  }, [sourceText]);

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      <div className="bg-white shadow-sm px-6 py-4 flex items-center justify-between z-10">
        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Network className="w-6 h-6 text-purple-600" /> Mind Map Generator
        </h1>
        <button 
          onClick={() => navigate(-1)}
          className="text-gray-500 hover:text-gray-800 p-2 rounded-full hover:bg-gray-100 transition-colors flex items-center gap-1 group"
          title="Close"
        >
          <X size={24} className="sm:hidden" />
          <X size={20} className="hidden sm:block" />
          <span className="hidden sm:inline font-semibold">Close</span>
        </button>
      </div>

      <div className="flex-1 relative overflow-hidden">
        {loading ? (
           <div className="absolute inset-0 flex flex-col items-center justify-center">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
             <p className="text-gray-600 animate-pulse">Generating Mind Map structure...</p>
           </div>
        ) : error ? (
          <div className="absolute inset-0 flex items-center justify-center text-red-500 font-medium">
            {error}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="w-full h-full"
          >
            <MindMapDisplay content={content} />
          </motion.div>
        )}
      </div>
    </div>
  );
}
