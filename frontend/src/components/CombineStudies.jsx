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
      <Sidebar />

      <div className="flex-1 md:ml-64 p-6">
        <h1 className="text-3xl font-bold text-blue-700 mb-6">
          Welcome back, {username}
        </h1>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card title="Streak" value={`${streak} days`} />
          <Card title="Study Time" value={`${hours}h ${minutes}m`} />
        </div>

        <div className="bg-white p-6 rounded-xl shadow h-80">
          <h2 className="text-xl font-semibold mb-4 text-blue-700">
            Weekly Progress
          </h2>
          <Bar data={chartData} />
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
