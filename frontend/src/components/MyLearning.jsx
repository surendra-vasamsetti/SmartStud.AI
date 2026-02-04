import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { BookOpen, Clock, TrendingUp, Play, Trash2 } from "lucide-react";
import { auth } from "../firebase";
import CourseThumbnail from "./CourseThumbnail";

import { API_URL } from "../api/apiConfig";

export default function MyLearning() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const { user, username, email } = useCurrentUser();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);

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
    if (user) {
      fetchEnrolledCourses();
    }
  }, [user]);

  const fetchEnrolledCourses = async () => {
    if (!user) return;

    try {
      const response = await fetch(`${API_URL}/api/courses/my-courses/${user.uid}`);
      const data = await response.json();
      
      if (data.success) {
        setEnrolledCourses(data.courses);
      }
    } catch (error) {
      console.error("Error fetching enrolled courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleContinueLearning = (courseId) => {
    navigate(`/course-overview/${courseId}`);
  };

  const handleDeleteCourse = async (e, courseId) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this course? This action cannot be undone.")) return;

    try {
      const response = await fetch(`${API_URL}/api/courses/${courseId}`, { method: "DELETE" });
      const data = await response.json();
      if (data.success) {
        setEnrolledCourses((prev) => prev.filter((course) => course._id !== courseId));
      } else {
        alert("Failed to delete course");
      }
    } catch (error) {
      console.error("Error deleting course:", error);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Sidebar isOpen={isOpen} toggleSidebar={() => setIsOpen((p) => !p)} isMobile={isMobile} />

      <div className={`flex-1 transition-all ${!isMobile ? "md:ml-64" : ""}`}>
        <Navbar toggleSidebar={() => setIsOpen((p) => !p)} username={username} email={email} />

        {/* Header */}
        {/* Header */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="pt-10 px-6 text-center max-w-3xl mx-auto mb-12"
        >
           <div className="inline-block px-4 py-1.5 rounded-full bg-soft-primary/10 text-soft-primary font-medium text-sm mb-4">
              Your Journey
           </div>
           <h1 className="text-4xl md:text-5xl font-bold text-soft-text mb-6 tracking-tight">
             My <span className="text-transparent bg-clip-text bg-gradient-to-r from-soft-primary to-soft-secondary">Learning</span>
           </h1>
           <p className="text-soft-muted text-lg leading-relaxed">
             Continue your learning journey and track your progress
           </p>
        </motion.div>

        {/* Enrolled Courses */}
        <div className="px-6 mt-10 mb-10">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Continue Learning your courses</h2>

            {loading ? (
              <div className="text-center py-10">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading your courses...</p>
              </div>
            ) : enrolledCourses.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-2xl shadow">
                <BookOpen className="mx-auto text-gray-400 mb-4" size={64} />
                <p className="text-gray-600 mb-4">You haven't enrolled in any courses yet.</p>
                <button
                  onClick={() => navigate("/ai-courses")}
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700"
                >
                  Browse Courses
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrolledCourses.map((course) => (
                  <EnrolledCourseCard
                    key={course._id}
                    course={course}
                    onContinue={handleContinueLearning}
                    onDelete={handleDeleteCourse}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Enrolled Course Card
function EnrolledCourseCard({ course, onContinue, onDelete }) {
  const progress = course.progress || 0;

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="bg-white rounded-2xl shadow-lg overflow-hidden"
    >
      <CourseThumbnail course={course} className="h-40" />

      <div className="p-6 relative">
        <button 
            onClick={(e) => onDelete(e, course._id)}
            className="absolute top-6 right-6 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
            title="Delete Course"
        >
            <Trash2 size={18} />
        </button>
        <h3 className="font-bold text-lg mb-2 line-clamp-2 pr-8">{course.title}</h3>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-600">Progress</span>
            <span className="font-semibold text-purple-600">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Last Accessed */}
        {course.lastAccessedTopicId && (
          <p className="text-sm text-gray-600 mb-4">
            Last topic: {course.lastAccessedTopicId}
          </p>
        )}

        {/* Continue Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onContinue(course._id)}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
        >
          <Play size={18} />
          Continue Learning
        </motion.button>
      </div>
    </motion.div>
  );
}
