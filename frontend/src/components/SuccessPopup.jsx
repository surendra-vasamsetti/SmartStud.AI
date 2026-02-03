// src/components/SuccessPopup.jsx
import React, { useEffect } from "react";

export default function SuccessPopup({
  message,
  type = "success",   // "success" | "error"
  onClose,
  duration = 2500
}) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose && onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const colors = {
    success: "bg-green-600",
    error: "bg-red-600",
  };

  return (
    <div className="fixed top-6 right-6 z-50 animate-slide-in">
      <div
        className={`${colors[type]} text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3`}
      >
        {/* Spinner */}
        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>

        {/* Message */}
        <span className="font-medium">{message}</span>
      </div>

      {/* Animation */}
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slide-in {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
