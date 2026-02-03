import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { GoogleGenerativeAI } from "@google/generative-ai";
import QuizDisplay from "../components/QuizDisplay";
import { motion } from "framer-motion";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export default function QuizGenPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const sourceText = location.state?.response;

  useEffect(() => {
    if (!sourceText) {
      setError("No content to generate Quiz from. Please start a chat first.");
      setLoading(false);
      return;
    }

    const generate = async () => {
      try {
        const prompt = `Based on this content:\n\n${sourceText}\n\nCreate exactly 5 multiple choice questions to test understanding. 

        Output ONLY a JSON array in this exact format (no markdown, no extra text):
        [
          {
            "question": "Question text?",
            "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
            "correctAnswer": "A",
            "explanation": "Why this is correct"
          }
        ]`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        setContent(cleanText);
      } catch (err) {
        console.error(err);
        setError("Failed to generate Quiz.");
      } finally {
        setLoading(false);
      }
    };

    generate();
  }, [sourceText]);

  return (
    <div className="min-h-screen bg-green-50 flex flex-col">
      <div className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <span>❓</span> AI Quiz Generator
        </h1>
        <button 
          onClick={() => navigate(-1)}
          className="text-gray-600 hover:text-gray-900 font-semibold"
        >
          Close
        </button>
      </div>

      <div className="flex-1 p-8 overflow-y-auto">
        {loading ? (
           <div className="h-full flex flex-col items-center justify-center">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
             <p className="text-gray-600 animate-pulse">Generating quiz questions...</p>
           </div>
        ) : error ? (
          <div className="h-full flex items-center justify-center text-red-500 font-medium">
            {error}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="max-w-3xl mx-auto"
          >
            <QuizDisplay content={content} />
          </motion.div>
        )}
      </div>
    </div>
  );
}
