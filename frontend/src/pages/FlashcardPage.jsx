import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { GoogleGenerativeAI } from "@google/generative-ai";
import FlashcardsDisplay from "../components/FlashcardsDisplay";
import { motion } from "framer-motion";
import { StickyNote, X } from "lucide-react";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export default function FlashcardPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const sourceText = location.state?.response;

  useEffect(() => {
    if (!sourceText) {
      setError("No content to generate Flashcards from. Please start a chat first.");
      setLoading(false);
      return;
    }

    const generate = async () => {
      try {
        const prompt = `Based on this content:\n\n${sourceText}\n\nCreate 5-8 flashcards for studying. \n\nOutput format: A STRICT JSON array of objects, where each object has "question" and "answer" keys. \nExample: [{"question": "...", "answer": "..."}]\n\nDo NOT include any markdown formatting or text outside the JSON.`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        setContent(cleanText);
      } catch (err) {
        console.error(err);
        setError("Failed to generate Flashcards.");
      } finally {
        setLoading(false);
      }
    };

    generate();
  }, [sourceText]);

  return (
    <div className="min-h-screen bg-indigo-50 flex flex-col">
      <div className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <StickyNote className="w-6 h-6 text-indigo-600" /> AI Flashcards
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

      <div className="flex-1 p-8 overflow-y-auto">
        {loading ? (
           <div className="h-full flex flex-col items-center justify-center">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
             <p className="text-gray-600 animate-pulse">Creating flashcards...</p>
           </div>
        ) : error ? (
          <div className="h-full flex items-center justify-center text-red-500 font-medium">
            {error}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="max-w-4xl mx-auto"
          >
            <FlashcardsDisplay content={content} />
          </motion.div>
        )}
      </div>
    </div>
  );
}
