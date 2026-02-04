import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function PublicRoute({ children }) {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
          <p className="text-gray-500 font-medium animate-pulse">Checking credentials...</p>
        </div>
      </div>
    );
  }

  // If user *is* logged in, redirect them to dashboard
  if (currentUser) {
    return <Navigate to="/dashboard" replace />;
  }

  // Otherwise, render the public page (Login, Register, Landing)
  return children;
}
