import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, User, Settings, Users, AlertCircle, HelpCircle, LogOut } from "lucide-react";

export default function Navbar({ toggleSidebar, username, email }) {
  const [open, setOpen] = useState(false);
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

  return (
    <nav className="h-20 bg-white/80 backdrop-blur-md shadow-sm border-b border-soft-primary/5 px-6 flex items-center justify-between relative z-20">
      
      {/* HAMBURGER */}
      <button className="md:hidden p-2 dark:text-white" onClick={toggleSidebar}>
        <Menu size={26} />
      </button>

      {/* APP NAME */}
      <h1 className="text-xl font-semibold dark:text-white">Smartstud.Ai</h1>

      {/* PROFILE */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setOpen(!open)}
          className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-semibold dark:text-white"
        >
          {username?.charAt(0)?.toUpperCase()}
        </button>

        {/* DROPDOWN */}
        {open && (
          <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-lg border dark:border-gray-700 z-[100]">
            
            {/* USER INFO */}
            <div className="p-4 border-b dark:border-gray-700">
              <p className="font-semibold dark:text-white">{username}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{email}</p>

              <div className="flex gap-2 mt-3">
                <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded">
                  0
                </span>
                <span className="px-2 py-1 text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded">
                  0
                </span>
              </div>
            </div>

            {/* MENU ITEMS */}
            <div className="py-2">
              <MenuItem 
                icon={<User size={18} />} 
                label="View Profile" 
                onClick={() => {
                  setOpen(false);
                  navigate('/profile');
                }}
              />
              <MenuItem 
                icon={<Settings size={18} />} 
                label="Settings"
                onClick={() => {
                  setOpen(false);
                  navigate('/settings');
                }}
              />
              <MenuItem icon={<Users size={18} />} label="Communities" />
            </div>

          

            {/* LOGOUT */}
            <div className="border-t dark:border-gray-700">
              <button className="w-full flex items-center gap-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

/* ---------------- MENU ITEM COMPONENT ---------------- */
function MenuItem({ icon, label, onClick }) {
  return (
    <button 
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 text-left dark:text-gray-300"
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
