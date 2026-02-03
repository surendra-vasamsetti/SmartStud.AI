import React, { useEffect, useState } from "react";
import { 
  Network, 
  StickyNote, 
  FileQuestion, 
  Trash2, 
  Bot, 
  Clipboard, 
  Check, 
  History, 
  Send, 
  Sparkles,
  MessageSquare,
  Copy,
  X 
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import MarkdownRenderer from "../components/MarkdownRenderer";


import { GoogleGenerativeAI } from "@google/generative-ai";
import { getUserDoc } from "../utils/firebaseUsers";

import {
  collection,
  addDoc,
  query as fsQuery,
  orderBy,
  limit,
  onSnapshot,
  doc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

/* ================= GEMINI ================= */
const genAI = new GoogleGenerativeAI(
  import.meta.env.VITE_GEMINI_API_KEY
);
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
});

export default function Dashboard() {
  const navigate = useNavigate();

  /* SIDEBAR */
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  /* USER */
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [uid, setUid] = useState("");

  /* AI */
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showHistory, setShowHistory] = useState(false);



  /* HISTORY */
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  /* RESPONSIVE */
  useEffect(() => {
    const resize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setIsOpen(false);
    };
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  /* LOAD USER */
  useEffect(() => {
    async function loadUser() {
      const userId = sessionStorage.getItem("uid");
      if (!userId) return;
      setUid(userId);
      const user = await getUserDoc(userId);
      setUsername(user?.firstName || "User");
      setEmail(user?.email || "No Email");
    }
    loadUser();
  }, []);

  /* RESTORE RESPONSE FROM SESSION STORAGE */
  useEffect(() => {
    const savedResponse = sessionStorage.getItem('aiResponse');
    const savedQuery = sessionStorage.getItem('aiQuery');
    if (savedResponse) {
      setResponse(savedResponse);
    }
    if (savedQuery) {
      setQuery(savedQuery);
    }

    // Cleanup: Clear response when navigating to sidebar pages (not feature pages)
    return () => {
      // Check if we're navigating to a feature page (mindmap, flashcards, quiz-generator)
      const currentPath = window.location.pathname;
      const featurePages = ['/mindmap', '/flashcards', '/quiz-generator'];
      const isGoingToFeaturePage = featurePages.some(page => currentPath.includes(page));
      
      // Only clear if NOT going to a feature page
      if (!isGoingToFeaturePage) {
        sessionStorage.removeItem('aiResponse');
        sessionStorage.removeItem('aiQuery');
      }
    };
  }, []);

  /* LOAD HISTORY - DISABLED DUE TO FIREBASE PERMISSIONS */
  // TODO: Fix Firebase Firestore security rules to enable history
  useEffect(() => {
    if (!uid) return;

    setHistoryLoading(true);
    const q = fsQuery(
      collection(db, "users", uid, "chatHistory"),
      orderBy("createdAt", "desc"),
      limit(50)
    );

    const unsub = onSnapshot(q, (snap) => {
      setHistory(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setHistoryLoading(false);
    });

    return () => unsub();
  }, [uid]);

  /* SAVE CHAT */
  const saveToFirebase = async (question, answer) => {
    if (!uid) return;
    await addDoc(collection(db, "users", uid, "chatHistory"), {
      question,
      answer,
      createdAt: serverTimestamp(),
    });
  };

  /* DELETE CHAT */
  const deleteFromFirebase = async (id) => {
    if (!uid) return;
    await deleteDoc(doc(db, "users", uid, "chatHistory", id));
  };

  /* ASK GEMINI */
  const askGemini = async (q = query) => {
    if (!q.trim()) return;
    setLoading(true);

    try {
      const result = await model.generateContent(q);
      const text = result.response.text();

      if (!text || text.trim() === "") {
        setResponse("⚠️ Gemini did not return a response.");
      } else {
        setResponse(text);
        // Save to sessionStorage for persistence across navigation
        sessionStorage.setItem('aiResponse', text);
        sessionStorage.setItem('aiQuery', q);
        setQuery("");
        
        // Save to Firebase (non-blocking, don't fail if permissions issue)
        try {
          await saveToFirebase(q, text);
        } catch (fbError) {
          console.warn("Could not save to history:", fbError.message);
        }
      }
    } catch (error) {
      console.error("Gemini error:", error);
      setResponse("⚠️ Error: " + (error.message || "Failed to get response from Gemini."));
    } finally {
      setLoading(false);
    }
  };

  /* COPY TO CLIPBOARD */
  const copyToClipboard = () => {
    navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* CLEAR RESPONSE */
  const clearResponse = () => {
    setResponse("");
    setQuery("");
    sessionStorage.removeItem('aiResponse');
    sessionStorage.removeItem('aiQuery');
  };



  return (
    <div className="flex min-h-screen relative overflow-hidden bg-white">
      
      {/* BACKGROUND BLOBS */}
      <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[20%] w-[50%] h-[50%] bg-orange-500/40 rounded-full blur-[100px] mix-blend-multiply animate-pulse" />
          <div className="absolute bottom-[0%] left-[0%] w-[40%] h-[40%] bg-pink-600/30 rounded-full blur-[100px] mix-blend-multiply" />
          <div className="absolute bottom-[-10%] right-[0%] w-[40%] h-[40%] bg-indigo-600/30 rounded-full blur-[100px] mix-blend-multiply" />
      </div>

      {/* CONTENT WRAPPER - NEEDS RELATIVE Z-10 TO SIT ABOVE BG */}
      <div className="flex relative z-10 w-full h-full">
      <Sidebar
        isOpen={isOpen}
        toggleSidebar={() => setIsOpen((p) => !p)}
        isMobile={isMobile}
      />

      <div className={`flex-1 transition-all ${!isMobile ? "md:ml-64" : ""}`}>
        <Navbar
          toggleSidebar={() => setIsOpen((p) => !p)}
          username={username}
          email={email}
        />

        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           className="pt-24 px-6 flex flex-col items-center"
        >
          <div className="w-fit mx-auto text-left">
            <motion.h1 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="font-cursive text-5xl md:text-6xl font-bold tracking-wide leading-tight bg-clip-text text-transparent bg-[linear-gradient(110deg,#9333ea,45%,#ec4899,55%,#9333ea)] bg-[length:250%_100%] animate-shimmer drop-shadow-sm"
            >
              Hello {username}<span className="text-violet-600 inline-block animate-pulse">!</span>
            </motion.h1>
            
            <h2 
              className="font-cursive text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-soft-primary via-purple-500 to-indigo-600 ml-24 opacity-0 animate-blur-in"
              style={{ animationDelay: "0.2s" }}
            >
              Chat with Stud
            </h2>
          </div>
        </motion.div>

        {/* History Toggle Button - Fixed Top Right */}
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="fixed top-24 right-6 z-10 flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-lg hover:shadow-xl transition font-semibold text-gray-700 hover:text-purple-600 border-2 border-purple-200"
        >
          <History size={20} />
          <span className="hidden sm:inline">{showHistory ? "Hide" : "History"}</span>
        </button>

        {/* ================= SEARCH ================= */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="max-w-3xl mx-auto mt-8 px-6"
        >
          <div className="flex bg-white rounded-full shadow-lg px-6 py-4 gap-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Describe what you want to learn..."
              className="flex-1 outline-none text-lg"
              onKeyDown={(e) => e.key === "Enter" && askGemini()}
            />
            <button
              onClick={() => askGemini()}
              disabled={loading || !query.trim()}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full font-semibold"
            >
              {loading ? "Thinking..." : "Ask AI"}
            </button>
          </div>


          {/* Feature Navigation Buttons (Below Search) */}
          <div className="flex flex-wrap gap-4 mt-6 justify-center">
            <button
              onClick={() => {
                if (!response) {
                  alert("Please ask a question first to generate a Mind Map!");
                  return;
                }
                navigate("/mindmap", { state: { response } });
              }}
              className="flex items-center gap-2 px-6 py-3 bg-white border border-indigo-100 rounded-xl shadow-sm hover:shadow-md hover:bg-indigo-50 transition text-indigo-700 font-semibold"
            >
              <Network size={20} /> Mind Map
            </button>
            
            <button
               onClick={() => {
                if (!response) {
                  alert("Please ask a question first to generate Flashcards!");
                  return;
                }
                navigate("/flashcards", { state: { response } });
              }}
              className="flex items-center gap-2 px-6 py-3 bg-white border border-blue-100 rounded-xl shadow-sm hover:shadow-md hover:bg-blue-50 transition text-blue-700 font-semibold"
            >
              <StickyNote size={20} /> Flashcards
            </button>
            
            <button
               onClick={() => {
                if (!response) {
                  alert("Please ask a question first to generate a Quiz!");
                  return;
                }
                navigate("/quiz-generator", { state: { response } });
              }}
              className="flex items-center gap-2 px-6 py-3 bg-white border border-green-100 rounded-xl shadow-sm hover:shadow-md hover:bg-green-50 transition text-green-700 font-semibold"
            >
              <FileQuestion size={20} /> Quiz
            </button>
            
            <button
              onClick={clearResponse}
              disabled={!response}
              className="flex items-center gap-2 px-6 py-3 bg-white border border-red-100 rounded-xl shadow-sm hover:shadow-md hover:bg-red-50 transition text-red-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 size={20} /> Clear
            </button>
          </div>
        </motion.div>

        {/* ================= AI RESPONSE ================= */}
        {response && (
          <motion.div
            initial={{ opacity: 0, y: 30, rotateX: -10 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 0.6 }}
            className="px-6 mt-10 mb-10"
          >
            <div className="mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden max-w-5xl border border-gray-100">
              {/* Header with copy button */}
              <div className="bg-gradient-to-r from-gray-50 to-white px-8 py-4 flex items-center justify-between border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <Bot size={24} className="text-purple-600" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-800">AI Response</h2>
                </div>
                
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 text-gray-500 hover:text-purple-600 px-3 py-1.5 rounded-lg transition text-sm hover:bg-purple-50"
                >
                  {copied ? (
                    <>
                      <Check size={16} />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={16} />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Content Area */}
              <div className="p-8">
                 <MarkdownRenderer content={response} />
              </div>
            </div>
          </motion.div>
        )}

        {/* ================= HISTORY ================= */}
        {/* ChatGPT-Style History Sidebar */}
        {showHistory && (
          <div 
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setShowHistory(false)}
          >
            <div 
              className="fixed right-0 top-0 h-full w-80 bg-white shadow-2xl z-50 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
                <h3 className="font-bold text-lg">Chat History</h3>
                <button 
                  onClick={() => setShowHistory(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>

              {/* History List */}
              <div className="p-4 space-y-2">
                {historyLoading && (
                  <div className="text-center py-8 text-gray-500">Loading...</div>
                )}
                
                {!historyLoading && history.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <History size={24} className="mb-2 mx-auto" />
                    <p className="text-sm">No conversations yet</p>
                  </div>
                )}

                {!historyLoading && history.map((item) => (
                  <div
                    key={item.id}
                    className="group p-3 rounded-lg hover:bg-gray-100 cursor-pointer transition relative"
                  >
                    <div 
                      onClick={() => {
                        setQuery(item.question);
                        setResponse(item.answer);
                        sessionStorage.setItem('aiResponse', item.answer);
                        sessionStorage.setItem('aiQuery', item.question);
                        setShowHistory(false);
                      }}
                    >
                      <p className="text-sm font-medium text-gray-800 line-clamp-2">
                        {item.question}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {item.createdAt?.toDate?.()?.toLocaleDateString() || "Recent"}
                      </p>
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteFromFirebase(item.id);
                      }}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 text-xs"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
