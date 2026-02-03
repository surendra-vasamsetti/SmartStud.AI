import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useCurrentUser } from "../hooks/useCurrentUser";

import {
  Star,
  Clock,
  Calendar,
  GraduationCap,
  Users,
  Award,
  Heart,
  Briefcase,
  Smartphone,
  Server,
  Cloud,
  CheckCircle,
} from "lucide-react";

export default function JavaCourseOverview() {
  const navigate = useNavigate();
  const [favorite, setFavorite] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const { username, email } = useCurrentUser();

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

  /* LOAD FAVORITE */
  useEffect(() => {
    const fav = localStorage.getItem("fav-java-course");
    if (fav === "true") setFavorite(true);
  }, []);

  /* TOGGLE FAVORITE */
  const toggleFavorite = () => {
    const newValue = !favorite;
    setFavorite(newValue);
    localStorage.setItem("fav-java-course", newValue);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Sidebar
        isOpen={isOpen}
        toggleSidebar={() => setIsOpen((p) => !p)}
        isMobile={isMobile}
      />

      <div className={`flex-1 transition-all ${!isMobile ? "md:ml-64" : ""}`}>
        <Navbar toggleSidebar={() => setIsOpen((p) => !p)} username={username} email={email} />

    <section className="w-full py-16 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-20">

        {/* ================= HERO ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center perspective-[1200px]">

          {/* LEFT */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-4 mb-5">
              {/* YOUR LOGO */}
              <img
                src="https://github.com/shaik1207/images/blob/main/ChatGPT%20Image%20Dec%2021,%202025,%2007_10_12%20PM.png?raw=true"
                alt="Platform Logo"
                className="h-10 w-auto drop-shadow-lg"
              />

              <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-semibold">
                Professional Certificate
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
              Java Developer <br className="hidden md:block" />
              Professional Course
            </h1>

            <p className="mt-6 text-gray-600 text-lg max-w-xl">
              Master Java from fundamentals to advanced backend concepts with
              a structured, job-focused learning experience.
            </p>

            {/* META */}
            <div className="flex flex-wrap gap-6 mt-7 text-sm text-gray-700">
              <Meta icon={<Star className="text-yellow-500" />} text="4.7 (400+ reviews)" />
              <Meta icon={<Users />} text="19,800+ learners" />
              <Meta icon={<GraduationCap />} text="Beginner friendly" />
            </div>

            {/* CTA + FAVORITE */}
            <div className="flex flex-wrap gap-4 mt-10 items-center">
              <motion.button
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/java-roadmap")}
                className="bg-gradient-to-r from-blue-600 to-purple-600
                           text-white px-9 py-4 rounded-2xl text-lg font-semibold
                           shadow-2xl"
              >
                View Learning Path
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleFavorite}
                className={`flex items-center gap-2 px-6 py-4 rounded-2xl border
                ${
                  favorite
                    ? "bg-red-50 text-red-600 border-red-300"
                    : "bg-white hover:bg-gray-50"
                }`}
              >
                <Heart
                  className={favorite ? "fill-red-500 text-red-500" : ""}
                />
                {favorite ? "Added to Favorites" : "Add to Favorites"}
              </motion.button>
            </div>
          </motion.div>

          {/* RIGHT FEATURE CARD */}
          <motion.div
            initial={{ opacity: 0, rotateY: -20 }}
            animate={{ opacity: 1, rotateY: 0 }}
            transition={{ duration: 0.8 }}
            whileHover={{ rotateY: 8, rotateX: -6, scale: 1.04 }}
            className="bg-white rounded-3xl shadow-2xl p-10 grid grid-cols-2 gap-7 transform-gpu"
          >
            <Feature icon={<Clock />} title="3 Months" desc="10 hrs / week" />
            <Feature icon={<Calendar />} title="Flexible" desc="Self-paced" />
            <Feature icon={<Award />} title="Certificate" desc="Shareable" />
            <Feature icon={<GraduationCap />} title="Skill-based" desc="Job ready" />
          </motion.div>
        </div>

        {/* WHY JAVA */}
        <div>
          <h2 className="text-3xl font-bold mb-8">🚀 Why Learn Java?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-7">
            <WhyCard icon={<Server />} title="Backend Development" />
            <WhyCard icon={<Smartphone />} title="Android Applications" />
            <WhyCard icon={<Cloud />} title="Cloud & Microservices" />
            <WhyCard icon={<Briefcase />} title="High-Paying Careers" />
          </div>
        </div>

        {/* WHY PLATFORM */}
        <div>
          <h2 className="text-3xl font-bold mb-8">⭐ Why Choose This Platform?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
            <PlatformPoint text="Structured roadmap from beginner to advanced" />
            <PlatformPoint text="Hands-on real-world examples" />
            <PlatformPoint text="Progress tracking & milestones" />
            <PlatformPoint text="Industry-aligned curriculum" />
            <PlatformPoint text="Certificate after completion" />
            <PlatformPoint text="Inspired by Coursera + W3Schools" />
          </div>
        </div>

      </div>
    </section>
      </div>
    </div>
  );
}

/* ---------------- SMALL COMPONENTS ---------------- */

function Meta({ icon, text }) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <span>{text}</span>
    </div>
  );
}

function Feature({ icon, title, desc }) {
  return (
    <div className="flex items-start gap-4">
      <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">{icon}</div>
      <div>
        <h4 className="font-semibold">{title}</h4>
        <p className="text-sm text-gray-500">{desc}</p>
      </div>
    </div>
  );
}

function WhyCard({ icon, title }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-xl">
      <div className="p-3 bg-blue-100 text-blue-600 rounded-xl w-fit mb-4">
        {icon}
      </div>
      <h3 className="font-semibold">{title}</h3>
    </div>
  );
}

function PlatformPoint({ text }) {
  return (
    <div className="flex items-start gap-3 bg-white p-6 rounded-2xl shadow">
      <CheckCircle className="text-green-500 mt-1" />
      <p>{text}</p>
    </div>
  );
}
