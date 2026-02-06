import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { Sparkles, BookOpen, Clock, Trash2 } from "lucide-react";
import { auth } from "../firebase";
import CourseThumbnail from "./CourseThumbnail";
import EnrollmentSuccessModal from "./EnrollmentSuccessModal";

import { API_URL } from "../api/apiConfig";

export default function AICourseGenerator() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const { username, email } = useCurrentUser();

  // Form state
  const [courseName, setCourseName] = useState("");
  const [description, setDescription] = useState("");
  const [numChapters, setNumChapters] = useState(2);
  const [targetDuration, setTargetDuration] = useState(10);
  const [includeVideo, setIncludeVideo] = useState(true);
  const [category, setCategory] = useState("Programming");
  const [difficulty, setDifficulty] = useState("Beginner");

  // UI state
  const [loading, setLoading] = useState(false);
  
  // Success Modal State
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [enrolledCourse, setEnrolledCourse] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  // Responsive
  useEffect(() => {
    const resize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setIsOpen(false);
    };
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  // Load all courses
  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await fetch(`${API_URL}/api/courses/all`);
      const data = await response.json();
      if (data.success) {
        setCourses(data.courses);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoadingCourses(false);
    }
  };

  const handleGenerateCourse = async () => {
    if (!courseName || !description) {
      alert("Please fill in course name and description");
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      alert("Please login to generate courses");
      navigate("/login");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/courses/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseName,
          description,
          numChapters,
          targetDuration: `${targetDuration} Hours`,
          includeVideo,
          category,
          difficulty,
          userId: user.uid,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Refresh list to show new course
        // Refresh list to show new course
        fetchCourses();
        // Reset form
        setCourseName("");
        setDescription("");
      } else {
        alert("Failed to generate course: " + data.message);
      }
    } catch (error) {
      console.error("Error generating course:", error);
      alert("Error generating course. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (course) => {
    const user = auth.currentUser;
    if (!user) {
      alert("Please login to enroll");
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/courses/enroll`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          courseId: course._id,
        }),
      });

      const data = await response.json();

      if (data.success || data.message === "Already enrolled") {
        setEnrolledCourse(course);
        setSuccessModalOpen(true);
        // navigate(`/course-overview/${courseId}`);
      } else {
        alert(data.message || "Failed to enroll");
      }
    } catch (error) {
      console.error("Error enrolling:", error);
      alert("Error enrolling in course");
    }
  };

  const handleDelete = async (e, courseId) => {
    e.stopPropagation();
    if (!window.confirm("Delete this course and all its data?")) return;

    try {
      const response = await fetch(`${API_URL}/api/courses/${courseId}`, { method: "DELETE" });
      const data = await response.json();
      
      if (data.success) {
        setCourses(prev => prev.filter(c => c._id !== courseId));
      } else {
        alert("Delete failed");
      }
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Sidebar isOpen={isOpen} toggleSidebar={() => setIsOpen((p) => !p)} isMobile={isMobile} />

      <div className={`flex-1 transition-all ${!isMobile ? "md:ml-64" : ""}`}>
        <Navbar toggleSidebar={() => setIsOpen((p) => !p)} username={username} email={email} />

        {/* Header */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="pt-10 px-6 text-center max-w-3xl mx-auto mb-12"
        >
           <div className="inline-block px-4 py-1.5 rounded-full bg-soft-primary/10 text-soft-primary font-medium text-sm mb-4">
              AI Technology
           </div>
           <h1 className="text-4xl md:text-5xl font-bold text-soft-text mb-6 tracking-tight">
             AI-Powered <span className="text-transparent bg-clip-text bg-gradient-to-r from-soft-primary to-soft-secondary">Course Generation</span>
           </h1>
           <p className="text-soft-muted text-lg leading-relaxed">
             Create personalized learning paths with AI in seconds
           </p>
        </motion.div>

        {/* Course Generation Form */}
        <div className="px-6 mt-10 mb-10">
          <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl p-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Sparkles className="text-purple-600" />
              Create New Course Using AI
            </h2>

            <div className="space-y-6">
              {/* Course Name */}
              <div>
                <label className="block text-sm font-semibold mb-2">Course Name</label>
                <input
                  type="text"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  placeholder="e.g., React Native Development"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  What do you want to learn?
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your learning goals and what topics you want to cover..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Number of Chapters & Duration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">Number of Chapters: {numChapters}</label>
                  <input
                    type="range"
                    min="2"
                    max="15"
                    value={numChapters}
                    onChange={(e) => setNumChapters(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>2 Chapters</span>
                    <span>15 Chapters</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Target Duration: {targetDuration} Hours</label>
                  <input
                    type="range"
                    min="1"
                    max="40"
                    value={targetDuration}
                    onChange={(e) => setTargetDuration(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                   <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1 Hour</span>
                    <span>40 Hours</span>
                  </div>
                </div>
              </div>

              {/* Include Video Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="text-sm font-semibold">Include Video Recommendations</span>
                <button
                  onClick={() => setIncludeVideo(!includeVideo)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    includeVideo ? "bg-purple-600" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      includeVideo ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-semibold mb-2">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="Programming">Programming</option>
                  <option value="AI">Artificial Intelligence</option>
                  <option value="Web Development">Web Development</option>
                  <option value="Data Science">Data Science</option>
                  <option value="Mobile Development">Mobile Development</option>
                  <option value="DevOps">DevOps</option>
                  <option value="Cybersecurity">Cybersecurity</option>
                  <option value="Cloud Computing">Cloud Computing</option>
                </select>
              </div>

              {/* Difficulty */}
              <div>
                <label className="block text-sm font-semibold mb-2">Difficulty Level</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              {/* Generate Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGenerateCourse}
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-lg font-semibold text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Generating Course...
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    Generate AI Course
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </div>

        {/* AI Generated Course List */}
        <div className="px-6 mt-16 mb-10">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">AI Generated Course List</h2>

            {loadingCourses ? (
              <div className="text-center py-10">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading courses...</p>
              </div>
            ) : courses.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-2xl shadow">
                <p className="text-gray-600">No courses generated yet. Create your first course above!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <CourseCard key={course._id} course={course} onEnroll={handleEnroll} onDelete={handleDelete} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <EnrollmentSuccessModal 
        isOpen={successModalOpen}
        onClose={() => setSuccessModalOpen(false)}
        course={enrolledCourse}
        onGoToCourse={() => navigate(`/course-overview/${enrolledCourse._id}`)}
      />
    </div>
  );
}

// Course Card Component
function CourseCard({ course, onEnroll, onDelete }) {
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="bg-white rounded-2xl shadow-lg overflow-hidden"
    >
      <CourseThumbnail course={course} className="h-48" />

      <div className="p-6 relative">
        <button 
          onClick={(e) => onDelete(e, course._id)}
          className="absolute top-4 right-4 p-2 bg-white/80 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition-colors z-10"
          title="Delete Course"
        >
            <Trash2 size={18} />
        </button>
        <h3 className="font-bold text-xl mb-2 line-clamp-2 pr-8">{course.title}</h3>
        <p className="text-sm text-gray-600 mb-4 line-clamp-3">{course.description}</p>

        <div className="flex items-center gap-4 mb-4 text-sm text-gray-700">
          <div className="flex items-center gap-1">
            <BookOpen size={16} />
            <span>{course.chapters?.length || 0} Chapters</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={16} />
            <span>{course.duration}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              course.difficulty === "Beginner"
                ? "bg-green-100 text-green-700"
                : course.difficulty === "Intermediate"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {course.difficulty}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
            {course.category}
          </span>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onEnroll(course)}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
        >
          <Sparkles size={18} />
          Enroll & Start Learning
        </motion.button>
      </div>
    </motion.div>
  );
}
