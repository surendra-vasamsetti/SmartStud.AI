import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./components/Dashboard";
import AuthCard from "./components/AuthCard";
import TopicSelection from "./pages/TopicSelection";
import Quizzes from "./components/Quizzes";
import Todo from "./components/Todo"; 
import History from "./components/History";
import StudentSurvey from "./components/StudentSurvey";
import CombineStudies from "./components/CombineStudies";
import SurveyRoute from "./components/SurveyRoute";
import Libraryy from "./components/Libraryy";
import ProgressCard from "./components/ProgressCard";
import Profile from "./components/Profile";
import Settings from "./pages/Settings";
import JavaRoadmap from "./components/JavaRoadmap";
import JavaCourse from "./components/JavaCourse";
import JavaCourseOverview from "./components/JavaCourseOverview";
import HTMLCourseOverview from "./components/HTMLCourseOverview";
import CSSCourseOverview from "./components/CSSCourseOverview";
import JSCourseOverview from "./components/JSCourseOverview";
import SQLCourseOverview from "./components/SQLCourseOverview";
import NetworksCourseOverview from "./components/NetworksCourseOverview";
import Performance from "./components/Performance";
import AICourses from "./components/AICourses";
import AICourseGenerator from "./components/AICourseGenerator";
import CourseOverviewPage from "./components/CourseOverviewPage";
import MyLearning from "./components/MyLearning";
import CourseLearningView from "./components/CourseLearningView";
import MindMapPage from "./pages/MindMapPage";
import FlashcardPage from "./pages/FlashcardPage";
import QuizGenPage from "./pages/QuizGenPage";
import AICompanion from "./components/AICompanion";

import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import { ThemeProvider } from "./contexts/ThemeContext";
import { SettingsProvider } from "./contexts/SettingsContext";
import { AuthProvider } from "./contexts/AuthContext";

export default function App() {
  return (
    <ThemeProvider>
      <SettingsProvider>
        <AuthProvider>
          <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
        <Route path="/get-started" element={<PublicRoute><Home /></PublicRoute>} />
        
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        
        {/* Protected Routes */}
        <Route path="/survey" element={<ProtectedRoute><StudentSurvey /></ProtectedRoute>} />
        <Route path="/select-topic" element={<ProtectedRoute><TopicSelection /></ProtectedRoute>} />
        <Route path="/Quizzes" element={<ProtectedRoute><Quizzes /></ProtectedRoute>} />
        {/* Note: survey route helps with redirection potentially, ensuring consistency */}
        
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/ai-courses" element={<ProtectedRoute><AICourses /></ProtectedRoute>} />
        <Route path="/ai-course-generator" element={<ProtectedRoute><AICourseGenerator /></ProtectedRoute>} />
        <Route path="/my-learning" element={<ProtectedRoute><MyLearning /></ProtectedRoute>} />
        <Route path="/course-overview/:courseId" element={<ProtectedRoute><CourseOverviewPage /></ProtectedRoute>} />
        <Route path="/course-learning/:courseId" element={<ProtectedRoute><CourseLearningView /></ProtectedRoute>} />
        <Route path="/mindmap" element={<ProtectedRoute><MindMapPage /></ProtectedRoute>} />
        <Route path="/flashcards" element={<ProtectedRoute><FlashcardPage /></ProtectedRoute>} />
        <Route path="/quiz-generator" element={<ProtectedRoute><QuizGenPage /></ProtectedRoute>} />
        <Route path="/todo" element={<ProtectedRoute><Todo /></ProtectedRoute>} />
        <Route path="/History" element={<ProtectedRoute><History /></ProtectedRoute>} />
        <Route path="/CombineStudies" element={<ProtectedRoute><CombineStudies /></ProtectedRoute>} />
        <Route path="/auth" element={<PublicRoute><AuthCard /></PublicRoute>} />
        <Route path="/library" element={<ProtectedRoute><Libraryy /></ProtectedRoute>} />
        <Route path="/progress" element={<ProtectedRoute><ProgressCard /></ProtectedRoute>} />
        <Route path="/Profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
         <Route path="/java-roadmap" element={<ProtectedRoute><JavaRoadmap /></ProtectedRoute>} />
          <Route
          path="/java-course/:moduleIndex/:lessonIndex"
          element={<ProtectedRoute><JavaCourse /></ProtectedRoute>}
        />
        <Route path="/JavaCourseOverview" element={<ProtectedRoute><JavaCourseOverview /></ProtectedRoute>} />
        <Route path="/HTMLCourseOverview" element={<ProtectedRoute><HTMLCourseOverview /></ProtectedRoute>} />
        <Route path="/CSSCourseOverview" element={<ProtectedRoute><CSSCourseOverview /></ProtectedRoute>} />
        <Route path="/JSCourseOverview" element={<ProtectedRoute><JSCourseOverview /></ProtectedRoute>} />
        <Route path="/SQLCourseOverview" element={<ProtectedRoute><SQLCourseOverview /></ProtectedRoute>} />
        <Route path="/NetworksCourseOverview" element={<ProtectedRoute><NetworksCourseOverview /></ProtectedRoute>} />
         <Route path="/Performance" element={<ProtectedRoute><Performance /></ProtectedRoute>} />
        </Routes>
          </BrowserRouter>
        </AuthProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
}
