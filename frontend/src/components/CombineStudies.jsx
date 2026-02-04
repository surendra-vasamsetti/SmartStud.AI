import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import Sidebar from "./Sidebar";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement);

export default function CombineStudies({ username = "Student", userId }) {
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [streak, setStreak] = useState(0);
  const [weeklyMinutes, setWeeklyMinutes] = useState([0, 0, 0, 0, 0, 0, 0]);

  useEffect(() => {
    if (!userId) return;

    const ref = doc(db, "users", userId, "dashboard", "stats");

    const unsub = onSnapshot(ref, (snap) => {
      if (!snap.exists()) return;
      const d = snap.data();

      setTotalMinutes(Math.floor((d.totalTime ?? 0) * 60));
      setStreak(d.streak ?? 0);
      setWeeklyMinutes(
        (d.weeklyHours ?? []).map((h) => Math.floor(h * 60))
      );
    });

    return () => unsub();
  }, [userId]);

  /* ---------------- RESPONSIVE SIDEBAR LOGIC ---------------- */
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const resize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setIsOpen(false);
    };
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  const chartData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        data: weeklyMinutes.map((m) => (m / 60).toFixed(1)),
        backgroundColor: "#2563eb",
        borderRadius: 10,
      },
    ],
  };

  return (
    <div className="flex min-h-screen bg-[#F3F7FF]">
      <Sidebar 
        isOpen={isOpen} 
        toggleSidebar={() => setIsOpen(!isOpen)} 
        isMobile={isMobile} 
      />

      <div className={`flex-1 transition-all ${!isMobile ? "md:ml-64" : ""}`}>
        {/* Mobile Navbar */}
        <div className="md:hidden bg-white p-4 flex justify-between items-center shadow-sm sticky top-0 z-20">
          <div className="font-bold text-xl text-blue-700">Stud.AI</div>
          <button onClick={() => setIsOpen(!isOpen)} className="p-2 hover:bg-gray-100 rounded-lg">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
        </div>

        <div className="p-4 sm:p-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-700 mb-6 mt-2 sm:mt-0">
            Welcome back, {username}
          </h1>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <Card title="Streak" value={`${streak} days`} />
            <Card title="Study Time" value={`${hours}h ${minutes}m`} />
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-xl shadow h-80">
            <h2 className="text-xl font-semibold mb-4 text-blue-700">
              Weekly Progress
            </h2>
            <div className="h-64 w-full">
              <Bar 
                data={chartData} 
                options={{
                  maintainAspectRatio: false,
                  responsive: true
                }} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div className="bg-white p-5 rounded-xl shadow">
      <p className="text-gray-500">{title}</p>
      <h2 className="text-2xl font-bold text-blue-700">{value}</h2>
    </div>
  );
}
