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
  X,
  Plus
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import MarkdownRenderer from "../components/MarkdownRenderer";
import { useCurrentUser } from "../hooks/useCurrentUser";


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

  const { user, username, email, loading: userLoading } = useCurrentUser();
  const uid = user?.uid;

  /* AI */
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showFeatureMenu, setShowFeatureMenu] = useState(false);

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

      <div className={`flex-1 transition-all flex flex-col ${!isMobile ? "md:ml-64" : ""}`}>
        <Navbar
          toggleSidebar={() => setIsOpen((p) => !p)}
          username={username}
          email={email}
        />

        {/* MAIN SCROLLABLE CONTENT */}
        {/* MAIN SCROLLABLE CONTENT */}
        {/* MAIN SCROLLABLE CONTENT */}
        <div className={`flex-1 flex flex-col items-center w-full ${isMobile ? 'h-full relative overflow-x-hidden' : 'justify-start pt-16 sm:pt-24 px-6 scale-95 origin-top'}`}>
            
            {/* MOBILE GREETING (CENTERED) */}
            {isMobile && !response && (
              <div className="flex-1 w-full flex flex-col items-center justify-center px-4" style={{ minHeight: 'calc(100vh - 180px)' }}>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center pb-20"
                >
                  <motion.h1 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="font-cursive text-4xl font-bold tracking-wide leading-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 bg-[length:200%_auto] animate-shimmer drop-shadow-sm px-2 mb-0"
                    style={{ WebkitTextFillColor: 'transparent', display: 'inline-block' }}
                  >
                    Hello {username || "Surendra"}<span className="text-violet-600 inline-block animate-pulse">!</span>
                  </motion.h1>
                  
                  <h2 
                    className="font-cursive text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-soft-primary to-indigo-600 opacity-0 animate-blur-in mt-0"
                    style={{ animationDelay: "0.2s", WebkitTextFillColor: 'transparent' }}
                  >
                    Chat with Stud
                  </h2>
                </motion.div>
              </div>
            )}

            {/* DESKTOP CONTENT & MOBILE RESPONSE */}
            {(response || !isMobile) && (
              <div className={`w-full max-w-4xl flex flex-col items-center ${isMobile ? 'px-4 pb-40 pt-10' : ''}`}>
                {!isMobile && (
                  <div className="text-center mb-8">
                     <motion.h1 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="font-cursive text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-wide leading-tight bg-clip-text text-transparent bg-[linear-gradient(110deg,#9333ea,45%,#ec4899,55%,#9333ea)] bg-[length:250%_100%] animate-shimmer drop-shadow-sm px-2"
                      >
                        Hello {username}<span className="text-violet-600 inline-block animate-pulse">!</span>
                      </motion.h1>
                      
                      <h2 
                        className="font-cursive text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-soft-primary via-purple-500 to-indigo-600 mt-3 opacity-0 animate-blur-in"
                        style={{ animationDelay: "0.2s" }}
                      >
                        Chat with Stud
                      </h2>
                  </div>
                )}

                {/* Desktop Search Bar */}
                {!isMobile && !response && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="w-full max-w-2xl mb-8"
                  >
                    <div className="flex bg-white rounded-full shadow-lg px-6 py-4 gap-3 border border-gray-100 focus-within:ring-2 focus-within:ring-purple-200 transition-all">
                      <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Describe what you want to learn..."
                        className="flex-1 outline-none text-lg bg-transparent"
                        onKeyDown={(e) => e.key === "Enter" && askGemini()}
                      />
                      <button
                        onClick={() => askGemini()}
                        disabled={loading || !query.trim()}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full font-semibold whitespace-nowrap disabled:opacity-50 hover:shadow-md transition-all"
                      >
                        {loading ? "..." : "Ask AI"}
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Desktop Features */}
                {!isMobile && !response && (
                  <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3 sm:gap-4 justify-center w-full max-w-2xl px-2">
                    <button
                      onClick={() => {
                        if (!response) {
                          alert("Please ask a question first to generate a Mind Map!");
                          return;
                        }
                        navigate("/mindmap", { state: { response } });
                      }}
                      className="flex flex-col sm:flex-row items-center justify-center gap-2 p-4 bg-white border border-indigo-100 rounded-2xl shadow-sm hover:shadow-md hover:bg-indigo-50 transition text-indigo-700 font-medium text-sm sm:text-base aspect-[2/1] sm:aspect-auto"
                    >
                      <Network size={24} className="mb-1 sm:mb-0 sm:w-5 sm:h-5 text-indigo-500" /> 
                      <span>Mind Map</span>
                    </button>
                    
                    <button
                       onClick={() => {
                        if (!response) {
                          alert("Please ask a question first to generate Flashcards!");
                          return;
                        }
                        navigate("/flashcards", { state: { response } });
                      }}
                      className="flex flex-col sm:flex-row items-center justify-center gap-2 p-4 bg-white border border-blue-100 rounded-2xl shadow-sm hover:shadow-md hover:bg-blue-50 transition text-blue-700 font-medium text-sm sm:text-base aspect-[2/1] sm:aspect-auto"
                    >
                      <StickyNote size={24} className="mb-1 sm:mb-0 sm:w-5 sm:h-5 text-blue-500" /> 
                      <span>Flashcards</span>
                    </button>
                    
                    <button
                       onClick={() => {
                        if (!response) {
                          alert("Please ask a question first to generate a Quiz!");
                          return;
                        }
                        navigate("/quiz-generator", { state: { response } });
                      }}
                      className="flex flex-col sm:flex-row items-center justify-center gap-2 p-4 bg-white border border-green-100 rounded-2xl shadow-sm hover:shadow-md hover:bg-green-50 transition text-green-700 font-medium text-sm sm:text-base aspect-[2/1] sm:aspect-auto"
                    >
                      <FileQuestion size={24} className="mb-1 sm:mb-0 sm:w-5 sm:h-5 text-green-500" /> 
                      <span>Quiz Generator</span>
                    </button>
                    
                     <button
                      onClick={clearResponse}
                      disabled={!response}
                      className="flex flex-col sm:flex-row items-center justify-center gap-2 p-4 bg-white border border-red-100 rounded-2xl shadow-sm hover:shadow-md hover:bg-red-50 transition text-red-700 font-medium text-sm sm:text-base aspect-[2/1] sm:aspect-auto disabled:opacity-50"
                    >
                      <Trash2 size={24} className="mb-1 sm:mb-0 sm:w-5 sm:h-5 text-red-500" /> 
                      <span>Clear</span>
                    </button>
                  </div>
                )}

                {/* AI RESPONSE */}
                {response && (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full"
                  >
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                      <div className="bg-gradient-to-r from-gray-50 to-white px-4 py-3 flex items-center justify-between border-b border-gray-200">
                        <div className="flex items-center gap-2">
                          <div className="bg-purple-100 p-1.5 rounded-lg">
                            <Bot size={20} className="text-purple-600" />
                          </div>
                          <h2 className="text-sm sm:text-base font-bold text-gray-800">Stud AI</h2>
                        </div>
                        
                        <div className="flex gap-2">
                            <button
                              onClick={copyToClipboard}
                              className="flex items-center gap-1 text-gray-500 hover:text-purple-600 px-2 py-1 rounded hover:bg-purple-50 transition text-xs"
                            >
                              {copied ? <Check size={14} /> : <Copy size={14} />}
                              <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
                            </button>
                            <button
                              onClick={clearResponse}
                              className="flex items-center gap-1 text-gray-500 hover:text-red-500 px-2 py-1 rounded hover:bg-red-50 transition text-xs"
                            >
                              <Trash2 size={14} />
                              <span className="hidden sm:inline">Clear</span>
                            </button>
                        </div>
                      </div>
        
                      <div className="p-4 sm:p-6 md:p-8 text-left">
                         <MarkdownRenderer content={response} />
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
        </div>


        {/* ================= MOBILE BOTTOM SEARCH BAR (ONLY MOBILE) ================= */}
        {isMobile && (
          <div className="bg-white/80 backdrop-blur-md border-t border-gray-200 p-3 pb-6 fixed bottom-0 left-0 right-0 z-30">
            <div className="max-w-3xl mx-auto">
                <div className="flex items-center bg-gray-100 rounded-full px-1.5 py-1.5 shadow-inner border border-gray-200 focus-within:border-gray-400 focus-within:ring-1 focus-within:ring-gray-300 transition-all">
                  {/* PLUS BUTTON */}
                  <div className="relative shrink-0">
                    <button
                      onClick={() => setShowFeatureMenu(!showFeatureMenu)}
                      className="w-9 h-9 flex items-center justify-center bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors"
                    >
                      <Plus size={18} />
                    </button>
                    {/* FEATURE MENU POPOVER */}
                    {showFeatureMenu && (
                      <div className="absolute bottom-full left-0 mb-3 w-48 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200 origin-bottom-left">
                        <button
                           onClick={() => {
                            setShowFeatureMenu(false);
                            if (!response) {
                              alert("Please ask a question first to generate a Mind Map!");
                              return;
                            }
                            navigate("/mindmap", { state: { response } });
                          }}
                          className="flex items-center gap-3 p-3 hover:bg-indigo-50 border-b border-gray-100/50 text-left transition-colors"
                        >
                          <div className="bg-indigo-100 p-1.5 rounded-lg text-indigo-600"><Network size={16} /></div>
                          <span className="text-sm font-medium text-gray-700">Mind Map</span>
                        </button>
                        
                        <button
                           onClick={() => {
                            setShowFeatureMenu(false);
                            if (!response) {
                              alert("Please ask a question first to generate Flashcards!");
                              return;
                            }
                            navigate("/flashcards", { state: { response } });
                          }}
                          className="flex items-center gap-3 p-3 hover:bg-blue-50 border-b border-gray-100/50 text-left transition-colors"
                        >
                          <div className="bg-blue-100 p-1.5 rounded-lg text-blue-600"><StickyNote size={16} /></div>
                          <span className="text-sm font-medium text-gray-700">Flashcards</span>
                        </button>
                        <button
                           onClick={() => {
                            setShowFeatureMenu(false);
                            if (!response) {
                              alert("Please ask a question first to generate a Quiz!");
                              return;
                            }
                            navigate("/quiz-generator", { state: { response } });
                          }}
                          className="flex items-center gap-3 p-3 hover:bg-green-50 text-left transition-colors"
                        >
                          <div className="bg-green-100 p-1.5 rounded-lg text-green-600"><FileQuestion size={16} /></div>
                          <span className="text-sm font-medium text-gray-700">Quiz Generator</span>
                        </button>
                      </div>
                    )}
                  </div>

                   <input
                     value={query}
                     onChange={(e) => setQuery(e.target.value)}
                     placeholder="Ask anything..."
                     className="flex-1 bg-transparent border-none focus:ring-0 outline-none px-3 py-2 text-base max-h-32 overflow-y-auto resize-none"
                     onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && askGemini()}
                   />
                   
                   {/* SEND BUTTON */}
                   <button
                     onClick={() => askGemini()}
                     disabled={loading || !query.trim()}
                     className={`w-9 h-9 flex items-center justify-center rounded-full transition-all shrink-0 ${
                        loading || !query.trim() 
                        ? "bg-gray-300 text-gray-400" 
                        : "bg-black text-white hover:bg-gray-800"
                     }`}
                   >
                     {loading ? (
                       <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                     ) : (
                       <Send size={18} className={query.trim() ? "translate-x-[1px]" : ""} />
                     )}
                   </button>
                </div>
               <p className="text-[10px] text-gray-400 text-center mt-2 px-4 leading-tight">
                  Stud AI can make mistakes. Check important info.
               </p>
            </div>
          </div>
        )}

        {/* History Toggle Button */}
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="fixed top-20 right-4 z-20 p-2 bg-white/90 backdrop-blur rounded-full shadow-md text-gray-600 hover:text-purple-600 border border-gray-200 md:hidden"
        >
          <History size={20} />
        </button>

        {/* ================= HISTORY SIDEBAR ================= */}
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
                {/* ... (Keep existing history logic) ... */}
                {historyLoading && <div className="text-center py-8">Loading...</div>}
                
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
