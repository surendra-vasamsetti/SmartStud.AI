import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { useGeneration } from "../contexts/GenerationContext";
import { Clock, Book, TrendingUp, PlayCircle, CheckCircle, Sparkles, Loader2, ArrowLeft, StopCircle } from "lucide-react";
import { auth } from "../firebase";
import SkillTree from "./SkillTree";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function CourseOverviewPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const { username, email } = useCurrentUser();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [completedTopics, setCompletedTopics] = useState([]);
  
  // Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [genProgress, setGenProgress] = useState(0);
  const [genStep, setGenStep] = useState("");
  
  // Context for Background Generation
  const { startGeneration, activeGenerations } = useGeneration();
  
  // Computed Generation State based on Context
  const contextGenState = activeGenerations[courseId];
  
  // Sync local isGenerating with Context
  useEffect(() => {
     if (contextGenState) {
         setIsGenerating(true);
         setGenProgress(contextGenState.progress);
         setGenStep(contextGenState.status === 'starting' ? "Starting engine..." : `Generating topics... ${contextGenState.progress}%`);
     } else {
         // If context clears it, it means it's done or validation failed
         // We should reload the course data to ensure we have the latest content
         if (isGenerating) {
             setIsGenerating(false);
             fetchCourseData(); 
         }
     }
  }, [contextGenState, isGenerating]);

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
    fetchCourseData();
  }, [courseId]);

  const fetchCourseData = async () => {
    const user = auth.currentUser;
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/courses/${courseId}`);
      const data = await response.json();

      if (data.success) {
        setCourse(data.course);
        checkEnrollment(user.uid, courseId);
      }
    } catch (error) {
      console.error("Error fetching course:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollment = async (userId, courseId) => {
    try {
      const response = await fetch(`${API_URL}/api/courses/progress/${userId}/${courseId}`);
      const data = await response.json();
      if (data.success) {
        setIsEnrolled(true);
        // Fetch detailed progress (completed topics)
        try {
           const progRes = await fetch(`${API_URL}/api/courses/progress/${userId}/${courseId}`);
           const progData = await progRes.json();
           if (progData.success && progData.progress) {
               setCompletedTopics(progData.progress.completedTopics || []);
           }
        } catch (err) {
            console.error("Error fetching progress details", err);
        }
      }
    } catch (error) {
      console.error("Error checking enrollment:", error);
    }
  };

  const handleGenerateContent = async () => {
      // Logic moved to Context
      setIsGenerating(true); // immediate feedback
      await startGeneration(courseId);
  };

  const handleStopGeneration = () => {
      stopGeneration(courseId);
      setIsGenerating(false);
      setGenStep("Stopped.");
  };

  const handleStartLearning = async (chapter = null, topic = null) => {
    const user = auth.currentUser;
    if (!user) return;

    if (!isEnrolled) {
        try {
            await fetch(`${API_URL}/api/courses/enroll`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: user.uid, courseId })
            });
            setIsEnrolled(true);
        } catch (error) {
            console.error("Enrollment error", error);
        }
    }
    
    // Navigate to learning page
    // Using query params or state to jump to specific topic
    if (topic && topic.topicId) {
        navigate(`/course-learning/${courseId}?topicId=${topic.topicId}`);
    } else {
        navigate(`/course-learning/${courseId}`);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!course) return null;

  const isOutline = course.status === 'outline';

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar isOpen={isOpen} toggleSidebar={() => setIsOpen((p) => !p)} isMobile={isMobile} />
      
      <div className={`flex-1 flex flex-col transition-all duration-300 ${!isMobile ? "md:ml-64" : ""}`}>
        <Navbar toggleSidebar={() => setIsOpen((p) => !p)} username={username} email={email} />
        
        <div className="p-6 md:p-10 max-w-7xl mx-auto w-full relative">
          
          {/* Main Card - Overview */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-sm p-8 md:p-12 mb-10 flex flex-col md:flex-row gap-10 items-center overflow-hidden relative"
          >
             {/* Left Content */}
             <div className="flex-1 w-full z-10">
                <button 
                  onClick={() => navigate(-1)} 
                  className="mb-6 flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors font-medium group"
                >
                  <div className="p-2 bg-white rounded-full shadow-sm group-hover:shadow-md transition-all border border-gray-100">
                    <ArrowLeft size={18} />
                  </div>
                  Back
                </button>

                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 leading-tight">
                    {course.title}
                </h1>
                <p className="text-gray-500 text-lg mb-8 leading-relaxed max-w-xl">
                    {course.description || "Embark on your journey with this comprehensive course."}
                </p>

                {/* Stats Row */}
                <div className="flex items-center gap-6 mb-10">
                    <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-xl">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                            <Clock size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Duration</p>
                            <p className="font-bold text-gray-800">{course.duration}</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-xl">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                            <Book size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Chapters</p>
                            <p className="font-bold text-gray-800">{course.chapters?.length || 0} Chapters</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-xl">
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                            <TrendingUp size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Difficulty</p>
                            <p className="font-bold text-gray-800 text-transform capitalize">{course.difficulty || "Beginner"}</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-4">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={isOutline ? handleGenerateContent : handleStartLearning}
                            disabled={isGenerating}
                            className={`flex-1 flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-lg shadow-lg transition-all ${
                                isGenerating ? "bg-gray-400 cursor-not-allowed" : 
                                isOutline ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200" :
                                "bg-purple-600 hover:bg-purple-700 text-white shadow-purple-200"
                            }`}
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 size={24} className="animate-spin" />
                                    Generating... {genProgress}%
                                </>
                            ) : isOutline ? (
                                <>
                                    <Sparkles size={24} />
                                    Generate Content
                                </>
                            ) : (
                                <>
                                    <PlayCircle size={24} />
                                    {isEnrolled ? "Continue Learning" : "Start Course"}
                                </>
                            )}
                        </motion.button>

                        {isGenerating && (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleStopGeneration}
                                className="px-4 py-3.5 rounded-xl font-bold text-red-500 bg-red-50 hover:bg-red-100 border border-red-200 transition-all flex items-center gap-2"
                                title="Stop Generation"
                            >
                                <StopCircle size={24} />
                            </motion.button>
                        )}
                    </div>
                
                    {isGenerating && (
                        <p className="text-indigo-600 text-sm font-medium animate-pulse text-center">
                            {genStep}
                        </p>
                    )}
                </div>

             </div>

             {/* Right Image */}
             <div className="flex-1 w-full relative">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                     <img 
                      src={course.thumbnail || `https://source.unsplash.com/800x600/?${encodeURIComponent(course.category || "learning")},technology`}
                      alt={course.title}
                      className="w-full h-full object-cover aspect-video"
                    />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
                {/* Decorative Elements */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-100 rounded-full filter blur-3xl opacity-50 -z-10"></div>
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-100 rounded-full filter blur-3xl opacity-50 -z-10"></div>
             </div>
          </motion.div>

          {/* Skill Tree Visualization */}
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-8 text-center">Your Learning Path</h2>
            <SkillTree 
              chapters={course.chapters} 
              isOutline={isOutline} 
              isGenerating={isGenerating}
              completedTopics={completedTopics}
              isEnrolled={isEnrolled}
              onStartLearning={handleStartLearning} 
            />
          </div>

        </div>
      </div>
    </div>
  );
}
