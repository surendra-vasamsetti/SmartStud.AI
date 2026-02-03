import React, { useState } from "react";
import SuccessPopup from "./SuccessPopup";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import {
  MessageSquare,
  ClipboardList,
  ListTodo,
  Users,
  BarChart2,
  GraduationCap,
  BookOpen,
  Settings,
  LogOut,
  Sparkles,
  Brain
} from "lucide-react";

export default function Sidebar({ isOpen, toggleSidebar, isMobile }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [showLogoutPopup, setShowLogoutPopup] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.clear();
      sessionStorage.clear();
      setShowLogoutPopup(true);

      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  const menu = [
    { name: "Chat with Agent", icon: <MessageSquare size={20} />, path: "/dashboard" },
    { name: "AI Companion", icon: <Brain size={20} />, path: "/ai-companion" },
    { name: "Courses", icon: <GraduationCap size={20} />, path: "/ai-courses" },
    { name: "AI Courses", icon: <Sparkles size={20} />, path: "/ai-course-generator" },
    { name: "My Learning", icon: <BookOpen size={20} />, path: "/my-learning" },
    { name: "Library", icon: <BookOpen size={20} />, path: "/library" },
    { name: "Quizzes", icon: <ClipboardList size={20} />, path: "/Quizzes" },
    { name: "To-Do List", icon: <ListTodo size={20} />, path: "/todo" },
    { name: "CombineStudies", icon: <Users size={20} />, path: "/CombineStudies" },
    { name: "Performance", icon: <BarChart2 size={20} />, path: "/Performance" },
    { name: "Settings", icon: <Settings size={20} />, path: "/settings" }
  ];

  return (
    <>
      {/* LOGOUT POPUP */}
      {showLogoutPopup && (
        <SuccessPopup
          message="Logged out successfully!"
        />
      )}

      {/* BACKDROP (Mobile Only) */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-soft-text/20 backdrop-blur-sm z-30 transition-opacity"
          onClick={toggleSidebar}
        />
      )}

      {/* SIDEBAR */}
      <div
        className={`
          fixed top-0 left-0 h-full bg-soft-paper shadow-soft z-40
          w-64 transition-transform duration-300 ease-in-out border-r border-soft-primary/5
          ${isMobile ? (isOpen ? "translate-x-0" : "-translate-x-full") : "translate-x-0"}
        `}
      >
        {/* Logo Area */}
        <div className="h-20 flex flex-col items-center justify-center border-b border-soft-primary/5 bg-soft-bg/50">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-soft-primary to-soft-secondary flex items-center justify-center shadow-soft-hover transform hover:rotate-6 transition-transform duration-300">
             {/* Using a Lucide icon as placeholder if image fails, or keep the image but style it better */}
             <img
              src="https://github.com/shaik1207/images/blob/main/ChatGPT%20Image%20Dec%2021,%202025,%2007_10_12%20PM.png?raw=true"
              alt="logo"
              className="w-full h-full object-cover rounded-2xl opacity-90"
             />
          </div>

        </div>

        {/* Menu */}
        <div className="px-3 py-6 space-y-1.5 overflow-y-auto h-[calc(100%-160px)] custom-scrollbar">
          {menu.map((item) => {
            const active = location.pathname === item.path;

            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => isMobile && toggleSidebar()}
                className={`
                  relative flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-medium transition-all duration-200 group
                  ${
                    active
                      ? "text-soft-primary bg-soft-primary/10 shadow-inner-soft"
                      : "text-soft-muted hover:bg-white hover:text-soft-text hover:shadow-soft"
                  }
                `}
              >
                {/* Active Indicator Strip */}
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-soft-primary rounded-r-full" />
                )}
                
                <span className={`transition-colors duration-200 ${active ? "text-soft-primary" : "group-hover:text-soft-primary"}`}>
                  {item.icon}
                </span>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Logout */}
        <div className="absolute bottom-0 left-0 w-full p-4 border-t border-soft-primary/5 bg-soft-bg/30 backdrop-blur-sm">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 text-soft-danger hover:bg-soft-danger/10 w-full px-4 py-3 rounded-xl transition-all duration-200 font-medium group"
          >
            <LogOut size={20} className="group-hover:scale-110 transition-transform" /> 
            <span>Log out</span>
          </button>
        </div>
      </div>
    </>
  );
}
