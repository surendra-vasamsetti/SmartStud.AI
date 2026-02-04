import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, User, Settings, Users, AlertCircle, HelpCircle, LogOut } from "lucide-react";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import SuccessPopup from "./SuccessPopup";

export default function Navbar({ toggleSidebar, username, email }) {
  const [open, setOpen] = useState(false);
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  /* ---------------- CLOSE ON OUTSIDE CLICK ---------------- */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.clear();
      sessionStorage.clear();
      setShowLogoutPopup(true);
      setOpen(false);

      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  return (
    <>
      {showLogoutPopup && (
        <SuccessPopup
          message="Logged out successfully!"
        />
      )}
      <nav className="h-16 sm:h-20 bg-white/80 backdrop-blur-md shadow-sm border-b border-soft-primary/5 px-3 sm:px-4 md:px-6 flex items-center justify-between relative z-20">
        
        {/* HAMBURGER */}
        <button className="md:hidden p-1.5 sm:p-2 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors" onClick={toggleSidebar}>
          <Menu size={22} className="sm:w-6 sm:h-6" />
        </button>

        {/* APP NAME */}
        <h1 className="text-base sm:text-lg md:text-xl font-semibold dark:text-white truncate max-w-[150px] sm:max-w-none">Smartstud.Ai</h1>

        {/* PROFILE */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen(!open)}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-semibold dark:text-white text-sm sm:text-base hover:ring-2 hover:ring-soft-primary/30 transition-all"
          >
            {username?.charAt(0)?.toUpperCase()}
          </button>

          {/* DROPDOWN */}
          {open && (
            <div className="absolute right-0 mt-2 w-64 sm:w-72 bg-white dark:bg-gray-800 rounded-xl shadow-lg border dark:border-gray-700 z-[100] max-h-[calc(100vh-5rem)] overflow-y-auto">
              
              {/* USER INFO */}
              <div className="p-3 sm:p-4 border-b dark:border-gray-700">
                <p className="font-semibold dark:text-white text-sm sm:text-base truncate">{username}</p>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">{email}</p>

                <div className="flex gap-2 mt-2 sm:mt-3">
                  <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded">
                    0
                  </span>
                  <span className="px-2 py-1 text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded">
                    0
                  </span>
                </div>
              </div>

              {/* MENU ITEMS */}
              <div className="py-1 sm:py-2">
                <MenuItem 
                  icon={<User size={16} className="sm:w-[18px] sm:h-[18px]" />} 
                  label="View Profile" 
                  onClick={() => {
                    setOpen(false);
                    navigate('/profile');
                  }}
                />
                <MenuItem 
                  icon={<Settings size={16} className="sm:w-[18px] sm:h-[18px]" />} 
                  label="Settings"
                  onClick={() => {
                    setOpen(false);
                    navigate('/settings');
                  }}
                />
                <MenuItem icon={<Users size={16} className="sm:w-[18px] sm:h-[18px]" />} label="Communities" />
              </div>

            

              {/* LOGOUT */}
              <div className="border-t dark:border-gray-700">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm sm:text-base transition-colors"
                >
                  <LogOut size={16} className="sm:w-[18px] sm:h-[18px]" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}

/* ---------------- MENU ITEM COMPONENT ---------------- */
function MenuItem({ icon, label, onClick }) {
  return (
    <button 
      onClick={onClick}
      className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-gray-100 dark:hover:bg-gray-700 text-left dark:text-gray-300 text-sm sm:text-base transition-colors"
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
