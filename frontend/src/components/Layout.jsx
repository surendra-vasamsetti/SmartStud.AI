import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import { Menu } from "lucide-react";

export default function Layout({ children }) {
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

  return (
    <div className="flex min-h-screen bg-soft-bg text-soft-text font-sans">
      <Sidebar
        isOpen={isOpen}
        toggleSidebar={() => setIsOpen(!isOpen)}
        isMobile={isMobile}
      />

      {/* Main Content Wrapper */}
      <div 
        className={`
          flex-1 flex flex-col transition-all duration-300
          ${!isMobile ? "ml-64" : ""}
        `}
      >
        {/* Mobile Header for Sidebar Toggle */}
        {isMobile && (
          <div className="bg-soft-paper/80 backdrop-blur-md sticky top-0 z-30 px-4 py-3 border-b border-soft-primary/10 flex items-center justify-between shadow-soft">
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-soft-primary hover:bg-soft-primary/10 transition-colors"
            >
              <Menu size={24} />
            </button>
            <span className="font-semibold text-lg text-soft-text">SmartStud.Ai</span>
            <div className="w-10" /> {/* Spacer for balance */}
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
