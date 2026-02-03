import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useCurrentUser } from "../hooks/useCurrentUser";

import {
  Star, Clock, Calendar, GraduationCap, Users, Award, Heart,
  Code, Zap, Globe, CheckCircle,
} from "lucide-react";

export default function JSCourseOverview() {
  const navigate = useNavigate();
  const [favorite, setFavorite] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const { username, email } = useCurrentUser();

  useEffect(() => {
    const resize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setIsOpen(false);
    };
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  useEffect(() => {
    const fav = localStorage.getItem("fav-js-course");
    if (fav === "true") setFavorite(true);
  }, []);

  const toggleFavorite = () => {
    const newValue = !favorite;
    setFavorite(newValue);
    localStorage.setItem("fav-js-course", newValue);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Sidebar isOpen={isOpen} toggleSidebar={() => setIsOpen((p) => !p)} isMobile={isMobile} />
      <div className={`flex-1 transition-all ${!isMobile ? "md:ml-64" : ""}`}>
        <Navbar toggleSidebar={() => setIsOpen((p) => !p)} username={username} email={email} />
    <section className="w-full py-16 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="flex items-center gap-4 mb-5">
              <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" alt="JavaScript" className="h-12 w-auto" />
              <span className="text-sm bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-semibold">Programming Course</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
              JavaScript Mastery <br className="hidden md:block" />Complete Course
            </h1>
            <p className="mt-6 text-gray-600 text-lg max-w-xl">
              Master JavaScript from basics to advanced concepts. Learn ES6+, DOM manipulation, async programming, and modern frameworks.
            </p>
            <div className="flex flex-wrap gap-6 mt-7 text-sm text-gray-700">
              <Meta icon={<Star className="text-yellow-500" />} text="4.8 (800+ reviews)" />
              <Meta icon={<Users />} text="35,000+ learners" />
              <Meta icon={<GraduationCap />} text="Intermediate" />
            </div>
            <div className="flex flex-wrap gap-4 mt-10 items-center">
              <motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }}
                onClick={() => alert("JavaScript Roadmap coming soon!")}
                className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white px-9 py-4 rounded-2xl text-lg font-semibold shadow-2xl">
                Start Learning
              </motion.button>
              <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }} onClick={toggleFavorite}
                className={`flex items-center gap-2 px-6 py-4 rounded-2xl border ${favorite ? "bg-red-50 text-red-600 border-red-300" : "bg-white hover:bg-gray-50"}`}>
                <Heart className={favorite ? "fill-red-500 text-red-500" : ""} />
                {favorite ? "Added to Favorites" : "Add to Favorites"}
              </motion.button>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, rotateY: -20 }} animate={{ opacity: 1, rotateY: 0 }} transition={{ duration: 0.8 }}
            whileHover={{ rotateY: 8, rotateX: -6, scale: 1.04 }} className="bg-white rounded-3xl shadow-2xl p-10 grid grid-cols-2 gap-7">
            <Feature icon={<Clock />} title="12 Weeks" desc="8 hrs / week" />
            <Feature icon={<Calendar />} title="Flexible" desc="Self-paced" />
            <Feature icon={<Award />} title="Certificate" desc="Shareable" />
            <Feature icon={<GraduationCap />} title="Advanced" desc="HTML/CSS required" />
          </motion.div>
        </div>
        <div>
          <h2 className="text-3xl font-bold mb-8">⚡ Why Learn JavaScript?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-7">
            <WhyCard icon={<Code />} title="Full-Stack Development" />
            <WhyCard icon={<Zap />} title="Interactive Websites" />
            <WhyCard icon={<Globe />} title="Most Popular Language" />
            <WhyCard icon={<Award />} title="High Demand" />
          </div>
        </div>
        <div>
          <h2 className="text-3xl font-bold mb-8">⭐ What You'll Learn</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
            <PlatformPoint text="ES6+ modern JavaScript features" />
            <PlatformPoint text="DOM manipulation and events" />
            <PlatformPoint text="Async programming (Promises, async/await)" />
            <PlatformPoint text="APIs and fetch requests" />
            <PlatformPoint text="Object-oriented and functional programming" />
            <PlatformPoint text="Introduction to React/Vue/Angular" />
          </div>
        </div>
      </div>
    </section>
      </div>
    </div>
  );
}

function Meta({ icon, text }) {
  return <div className="flex items-center gap-2">{icon}<span>{text}</span></div>;
}

function Feature({ icon, title, desc }) {
  return (
    <div className="flex items-start gap-4">
      <div className="p-3 bg-yellow-100 text-yellow-600 rounded-xl">{icon}</div>
      <div><h4 className="font-semibold">{title}</h4><p className="text-sm text-gray-500">{desc}</p></div>
    </div>
  );
}

function WhyCard({ icon, title }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-xl">
      <div className="p-3 bg-yellow-100 text-yellow-600 rounded-xl w-fit mb-4">{icon}</div>
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
