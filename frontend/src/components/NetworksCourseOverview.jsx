import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useCurrentUser } from "../hooks/useCurrentUser";

import {
  Star, Clock, Calendar, GraduationCap, Users, Award, Heart,
  Network, Globe, Shield, CheckCircle,
} from "lucide-react";

export default function NetworksCourseOverview() {
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
    const fav = localStorage.getItem("fav-networks-course");
    if (fav === "true") setFavorite(true);
  }, []);

  const toggleFavorite = () => {
    const newValue = !favorite;
    setFavorite(newValue);
    localStorage.setItem("fav-networks-course", newValue);
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
              <img src="https://cdn-icons-png.flaticon.com/512/906/906175.png" alt="Networks" className="h-12 w-auto" />
              <span className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-semibold">Networking Course</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
              Computer Networks <br className="hidden md:block" />Complete Course
            </h1>
            <p className="mt-6 text-gray-600 text-lg max-w-xl">
              Master networking fundamentals including OSI model, TCP/IP, routing, protocols, and network security.
            </p>
            <div className="flex flex-wrap gap-6 mt-7 text-sm text-gray-700">
              <Meta icon={<Star className="text-yellow-500" />} text="4.6 (350+ reviews)" />
              <Meta icon={<Users />} text="18,000+ learners" />
              <Meta icon={<GraduationCap />} text="Intermediate" />
            </div>
            <div className="flex flex-wrap gap-4 mt-10 items-center">
              <motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }}
                onClick={() => alert("Networks Roadmap coming soon!")}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-9 py-4 rounded-2xl text-lg font-semibold shadow-2xl">
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
            <Feature icon={<Clock />} title="14 Weeks" desc="8 hrs / week" />
            <Feature icon={<Calendar />} title="Flexible" desc="Self-paced" />
            <Feature icon={<Award />} title="Certificate" desc="Shareable" />
            <Feature icon={<GraduationCap />} title="Intermediate" desc="Basic CS knowledge" />
          </motion.div>
        </div>
        <div>
          <h2 className="text-3xl font-bold mb-8">🌐 Why Learn Networking?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-7">
            <WhyCard icon={<Network />} title="Infrastructure" />
            <WhyCard icon={<Globe />} title="Internet Protocols" />
            <WhyCard icon={<Shield />} title="Security" />
            <WhyCard icon={<Award />} title="IT Careers" />
          </div>
        </div>
        <div>
          <h2 className="text-3xl font-bold mb-8">⭐ What You'll Learn</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
            <PlatformPoint text="OSI and TCP/IP models" />
            <PlatformPoint text="IP addressing and subnetting" />
            <PlatformPoint text="Routing and switching" />
            <PlatformPoint text="Network protocols (HTTP, DNS, DHCP)" />
            <PlatformPoint text="Network security fundamentals" />
            <PlatformPoint text="Troubleshooting and diagnostics" />
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
      <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">{icon}</div>
      <div><h4 className="font-semibold">{title}</h4><p className="text-sm text-gray-500">{desc}</p></div>
    </div>
  );
}

function WhyCard({ icon, title }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-xl">
      <div className="p-3 bg-purple-100 text-purple-600 rounded-xl w-fit mb-4">{icon}</div>
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
