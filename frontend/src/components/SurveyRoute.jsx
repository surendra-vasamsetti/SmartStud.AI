import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import StudentSurvey from "./StudentSurvey";

export default function SurveyRoute() {
  const { currentUser, userData, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // If survey is already completed, they shouldn't be here
  if (userData?.surveyCompleted) {
    return <Navigate to="/dashboard" replace />;
  }

  return <StudentSurvey />;
}
