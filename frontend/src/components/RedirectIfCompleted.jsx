import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export function RedirectIfCompleted({ children }) {
  const { currentUser, userData, loading } = useAuth();

  if (loading) return null;

  if (currentUser && userData?.hasCompletedQuiz) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
