import React, { useEffect, useState } from "react";
import { Plus, Trash2, Search } from "lucide-react";
import Toast from "../components/Toast";
import Layout from "../components/Layout";
import { db } from "../firebase";
import { getUserDoc } from "../utils/firebaseUsers";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

const COLORS = [
  "bg-blue-100",
  "bg-purple-100",
  "bg-yellow-100",
  "bg-pink-100",
  "bg-green-100",
];

export default function Todo() {
  /* ---------- USER ---------- */
  const [username, setUsername] = useState("");

  /* ---------- TODO ---------- */
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("active");
  const [toast, setToast] = useState(null);

  const uid = sessionStorage.getItem("uid");

  /* ---------- LOAD USER ---------- */
  useEffect(() => {
    async function loadUser() {
      if (!uid) return;
      const user = await getUserDoc(uid);
      setUsername(user?.firstName || "User");
    }
    loadUser();
  }, [uid]);

  /* ---------- LOAD TASKS ---------- */
  useEffect(() => {
    if (!uid) return;
    const ref = collection(db, "users", uid, "todos");
    const unsub = onSnapshot(ref, (snap) => {
      setTasks(
        snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }))
      );
    });
    return () => unsub();
  }, [uid]);

  /* ---------- ADD TASK ---------- */
  const addTask = async () => {
    if (!title.trim()) return;
    await addDoc(collection(db, "users", uid, "todos"), {
      title,
      completed: false,
      color: COLORS[tasks.length % COLORS.length],
      createdAt: serverTimestamp(),
    });
    setTitle("");
    setToast({ message: "Task added successfully", type: "success" });
  };

  /* ---------- DELETE ---------- */
  const deleteTask = async (id) => {
    await deleteDoc(doc(db, "users", uid, "todos", id));
    setToast({ message: "Task deleted", type: "error" });
  };

  /* ---------- TOGGLE ---------- */
  const toggleTask = async (task) => {
    await updateDoc(doc(db, "users", uid, "todos", task.id), {
      completed: !task.completed,
    });
  };

  const filteredTasks = tasks.filter(
    (t) =>
      t.completed === (tab === "completed") &&
      t.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        {/* TOAST */}
        {toast && <Toast {...toast} onClose={() => setToast(null)} />}

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-soft-text tracking-tight">
              {username}'s To-Do
            </h1>
            <p className="text-soft-muted">Stay organized and productive</p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              placeholder="Search task..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-soft-primary/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-soft-primary/20 transition-all shadow-sm"
            />
          </div>
        </div>

        {/* ADD */}
        <div className="bg-white p-4 rounded-2xl shadow-soft mb-8 border border-soft-primary/5">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="flex-1 bg-gray-50 border-0 rounded-xl px-4 py-3 focus:bg-white focus:ring-2 focus:ring-soft-primary/20 transition-all outline-none"
              onKeyDown={(e) => e.key === "Enter" && addTask()}
            />
            <button
              onClick={addTask}
              className="w-full sm:w-auto bg-soft-primary text-white px-6 py-3 rounded-xl hover:bg-soft-primary-dark transition-colors flex items-center justify-center gap-2 font-medium shadow-soft-hover"
            >
              <Plus size={20} /> New Task
            </button>
          </div>
        </div>

        {/* TABS */}
        <div className="flex gap-2 mb-6 border-b border-gray-100 pb-1">
          {["active", "completed"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-6 py-2 rounded-t-xl text-sm font-medium transition-all relative ${
                tab === t
                  ? "text-soft-primary"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t === "active" ? "Active Tasks" : "Completed"}
              {tab === t && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-soft-primary rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* TASKS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTasks.length === 0 && (
            <div className="col-span-full text-center py-20 text-gray-400">
              <p>No tasks found. Time to relax or add a new one!</p>
            </div>
          )}
          {filteredTasks.map((task) => (
             <div
              key={task.id}
              className={`
                group p-5 rounded-2xl shadow-sm hover:shadow-soft-hover transition-all duration-300 
                border border-transparent hover:border-soft-primary/10
                ${task.completed ? "bg-gray-50 opacity-75" : "bg-white"}
              `}
            >
              <div className="flex justify-between items-start gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className="relative mt-1">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTask(task)}
                      className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded-md checked:bg-soft-primary checked:border-soft-primary transition-colors cursor-pointer"
                    />
                    <Plus className="hidden peer-checked:block w-3.5 h-3.5 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  
                  <h3
                    className={`font-medium text-gray-800 transition-all ${
                      task.completed && "line-through text-gray-400"
                    }`}
                  >
                    {task.title}
                  </h3>
                </div>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="text-gray-300 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50 opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              
              {/* Color tag */}
              <div className={`mt-3 w-12 h-1.5 rounded-full ${task.color}`} />
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
