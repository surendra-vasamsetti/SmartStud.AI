// components/History.jsx
import React from "react";
import Sidebar from "./Sidebar";
import { Trash2, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

const History = ({
  history = [],
  loading,
  onSelectQuestion,
  onDeleteChat,
  onClearHistory,
}) => {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN CONTENT */}
      <main className="flex-1 px-4 sm:px-6 lg:px-10 py-8 md:ml-64">
        <div className="max-w-5xl mx-auto">
          {/* HEADER */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
              Previous Conversations
            </h2>

            {history.length > 0 && (
              <button
                onClick={onClearHistory}
                className="flex items-center gap-2
                           text-sm font-semibold
                           text-red-600 hover:text-red-700
                           bg-red-50 hover:bg-red-100
                           px-4 py-2 rounded-xl transition"
              >
                <Trash2 size={16} />
                Clear History
              </button>
            )}
          </div>

          {/* LOADING */}
          {loading && (
            <div className="text-center py-20 text-gray-500">
              Loading chat history...
            </div>
          )}

          {/* EMPTY STATE WITH 3D ANIMATION */}
          {!loading && history.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 40, rotateX: -20 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="flex flex-col items-center justify-center
                         bg-white rounded-3xl shadow-xl
                         py-20 px-6 text-center"
              style={{ perspective: 1000 }}
            >
              <motion.div
                animate={{ rotateY: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 6 }}
                className="p-6 bg-blue-100 text-blue-600 rounded-2xl mb-6"
              >
                <MessageSquare size={48} />
              </motion.div>

              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                No conversations yet
              </h3>

              <p className="text-gray-500 max-w-md">
                Ask your first question using the AI search.
                Your conversations will appear here for quick access.
              </p>
            </motion.div>
          )}

          {/* HISTORY LIST */}
          {!loading && history.length > 0 && (
            <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
              {history.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white border rounded-2xl p-6
                             shadow-sm hover:shadow-md
                             transition relative group"
                >
                  {/* QUESTION */}
                  <div
                    onClick={() => onSelectQuestion(item.question)}
                    className="cursor-pointer text-blue-600
                               font-semibold mb-3 hover:text-blue-800"
                  >
                    Q: {item.question}
                  </div>

                  {/* ANSWER */}
                  <div className="text-gray-700 whitespace-pre-line">
                    {item.answer}
                  </div>

                  {/* FOOTER */}
                  <div className="flex justify-between items-center mt-4">
                    <div className="text-xs text-gray-400">
                      {item.createdAt?.toDate?.()?.toLocaleString() ||
                        "Recent"}
                    </div>

                    <button
                      onClick={() => onDeleteChat(item.id)}
                      className="text-red-500 hover:text-red-700
                                 opacity-0 group-hover:opacity-100
                                 transition-opacity text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default History;
