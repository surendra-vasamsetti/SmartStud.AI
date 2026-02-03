import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { ChevronDown, ChevronRight, CheckCircle, Circle, ArrowLeft, PlayCircle, BookOpen } from "lucide-react";
import { auth } from "../firebase";
import MarkdownRenderer from "./MarkdownRenderer";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function CourseLearningView() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const { username, email } = useCurrentUser();
  
  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [expandedChapters, setExpandedChapters] = useState([0]); 
  const [currentTopic, setCurrentTopic] = useState(null);
  const [completing, setCompleting] = useState(false);

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
      const courseResponse = await fetch(`${API_URL}/api/courses/${courseId}`);
      const courseData = await courseResponse.json();

      const progressResponse = await fetch(`${API_URL}/api/courses/progress/${user.uid}/${courseId}`);
      const progressData = await progressResponse.json();

      if (courseData.success) {
        setCourse(courseData.course);
        if (courseData.course.chapters?.length > 0) {
          const firstTopic = courseData.course.chapters[0].topics[0];
          setCurrentTopic(firstTopic);
        }
      }

      if (progressData.success) {
        setProgress(progressData.progress);
      }
    } catch (error) {
      console.error("Error fetching course data:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleChapter = (chapterIndex) => {
    setExpandedChapters((prev) =>
      prev.includes(chapterIndex)
        ? prev.filter((i) => i !== chapterIndex)
        : [...prev, chapterIndex]
    );
  };

  const selectTopic = (topic) => {
    setCurrentTopic(topic);
  };

  const isTopicCompleted = (topicId) => {
    return progress?.completedTopics?.includes(topicId) || false;
  };

  const handleMarkAsCompleted = async () => {
    if (!currentTopic || completing) return;

    const user = auth.currentUser;
    if (!user) return;

    setCompleting(true);

    try {
      const response = await fetch(`${API_URL}/api/courses/progress/complete-topic`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          courseId,
          topicId: currentTopic.topicId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setProgress(data.progress);
        const nextTopic = findNextIncompleteTopic(currentTopic.topicId, data.progress.completedTopics);
        if (nextTopic) {
          setCurrentTopic(nextTopic);
        }
      }
    } catch (error) {
      console.error("Error marking topic as completed:", error);
    } finally {
      setCompleting(false);
    }
  };

  const findNextIncompleteTopic = (currentTopicId, completedTopics) => {
    if (!course) return null;
    let foundCurrent = false;
    for (const chapter of course.chapters) {
      for (const topic of chapter.topics) {
        if (foundCurrent && !completedTopics.includes(topic.topicId)) {
          return topic;
        }
        if (topic.topicId === currentTopicId) {
          foundCurrent = true;
        }
      }
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!course) return null;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
        {/* Note: Sidebar and Navbar removed for focus mode */}

        {/* Content Area */}
        <div className="flex-1 flex flex-col w-full h-full"> 
            {/* Minimal Top Header for Learning View */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm z-10">
                 <button
                    onClick={() => navigate(`/course-overview/${courseId}`)}
                    className="flex items-center gap-2 text-gray-600 hover:text-black font-medium transition-colors"
                >
                    <ArrowLeft size={18} />
                    Back to Course Overview
                </button>
                <h1 className="text-lg font-bold text-gray-800 hidden md:block truncate max-w-xl">{course.title}</h1>
                 {/* Progress on Top Right */}
                 <div className="flex items-center gap-3 min-w-[200px]">
                    <span className="text-xs font-semibold text-gray-500">{Math.round(progress?.completionPercentage || 0)}% Complete</span>
                    <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
                        <div
                            className="bg-purple-600 h-full rounded-full transition-all duration-500"
                            style={{ width: `${progress?.completionPercentage || 0}%` }}
                        />
                    </div>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                
                {/* Course Chapter Sidebar */}
                <div className="w-80 border-r border-gray-200 bg-white flex flex-col overflow-hidden shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-0">
                    {/* Sidebar Content (Chapters) */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-1">
                        {course.chapters.map((chapter, index) => (
                            <div key={index} className="rounded-lg overflow-hidden">
                                <button
                                    onClick={() => toggleChapter(index)}
                                    className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors rounded-lg border border-transparent hover:border-gray-100"
                                >
                                    <span className="font-semibold text-gray-800 text-sm">
                                        {index + 1}. {chapter.title}
                                    </span>
                                    {expandedChapters.includes(index) ? 
                                        <ChevronDown size={16} className="text-gray-400"/> : 
                                        <ChevronRight size={16} className="text-gray-400"/>
                                    }
                                </button>
                                
                                <AnimatePresence>
                                    {expandedChapters.includes(index) && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="ml-3 pl-3 border-l-2 border-gray-100 space-y-0.5 overflow-hidden my-1"
                                        >
                                            {chapter.topics.map((topic) => {
                                                const isActive = currentTopic?.topicId === topic.topicId;
                                                const isCompleted = isTopicCompleted(topic.topicId);
                                                
                                                return (
                                                    <button
                                                        key={topic.topicId}
                                                        onClick={() => selectTopic(topic)}
                                                        className={`w-full flex items-start gap-3 p-2.5 text-sm rounded-lg transition-all border ${
                                                            isActive 
                                                            ? "bg-purple-50 text-purple-700 font-medium border-purple-100" 
                                                            : "text-gray-600 hover:bg-gray-50 border-transparent hover:border-gray-100"
                                                        }`}
                                                    >
                                                        <div className="mt-0.5 min-w-[16px]">
                                                            {isCompleted ? (
                                                                <CheckCircle size={16} className="text-green-500 fill-green-50" />
                                                            ) : isActive ? (
                                                                <Circle size={16} className="text-purple-600 fill-purple-100" />
                                                            ) : (
                                                                <Circle size={16} className="text-gray-300" />
                                                            )}
                                                        </div>
                                                        <span className="leading-snug text-left">{topic.title}</span>
                                                    </button>
                                                )
                                            })}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Learning Area */}
                <div className="flex-1 overflow-y-auto bg-gray-50/50">
                    {currentTopic ? (
                        <div className="max-w-4xl mx-auto px-8 py-10">
                            {/* Header Section */}
                            <div className="flex items-start justify-between mb-8 gap-4 border-b border-gray-100 pb-6">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{currentTopic.title}</h1>
                                    <p className="text-gray-500 text-sm">Topic {currentTopic.order} of Chapter {expandedChapters[0] + 1}</p>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleMarkAsCompleted}
                                    disabled={isTopicCompleted(currentTopic.topicId) || completing}
                                    className={`px-6 py-2.5 rounded-lg font-semibold text-sm flex items-center gap-2 transition-all shadow-sm ${
                                        isTopicCompleted(currentTopic.topicId)
                                        ? "bg-green-100 text-green-700 border border-green-200 cursor-default"
                                        : "bg-purple-600 text-white hover:bg-purple-700 shadow-purple-200"
                                    }`}
                                >
                                    {isTopicCompleted(currentTopic.topicId) ? (
                                        <>
                                            <CheckCircle size={16} />
                                            Completed
                                        </>
                                    ) : completing ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Updating...
                                        </>
                                    ) : (
                                        "Mark as Completed"
                                    )}
                                </motion.button>
                            </div>

                            {/* Related Videos Section - Styled like Image 3 */}
                            {(currentTopic.videos?.length > 0 || currentTopic.videoUrl) && (
                                <div className="mb-10">
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        Related Videos 
                                        <span role="img" aria-label="clapper">🎬</span>
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {currentTopic.videos && currentTopic.videos.length > 0 ? (
                                            currentTopic.videos.map((video, idx) => (
                                                <a 
                                                    key={idx}
                                                    href={video.url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="group block relative rounded-xl overflow-hidden aspect-video bg-gray-900 shadow-md hover:shadow-xl transition-all"
                                                >
                                                    <img 
                                                        src={video.thumbnail || `https://source.unsplash.com/600x400/?coding,technology,${Math.random()}`} 
                                                        alt={video.title} 
                                                        className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity"
                                                    />
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                                            <PlayCircle size={24} className="text-white fill-white" />
                                                        </div>
                                                    </div>
                                                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent text-white">
                                                        <p className="font-semibold text-sm truncate">{video.title}</p>
                                                        <p className="text-xs opacity-80">Watch on YouTube</p>
                                                    </div>
                                                </a>
                                            ))
                                        ) : (
                                            /* Legacy Fallback */
                                            <a 
                                                href={currentTopic.videoUrl} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="group block relative rounded-xl overflow-hidden aspect-video bg-gray-900 shadow-md hover:shadow-xl transition-all"
                                            >
                                                <img 
                                                    src={`https://source.unsplash.com/600x400/?coding,technology,${Math.random()}`} 
                                                    alt="Video Thumbnail" 
                                                    className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity"
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                                        <PlayCircle size={24} className="text-white fill-white" />
                                                    </div>
                                                </div>
                                                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent text-white">
                                                    <p className="font-semibold text-sm truncate">{currentTopic.title} Tutorial</p>
                                                    <p className="text-xs opacity-80">Watch on YouTube</p>
                                                </div>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Content Section */}
                            <div className="prose prose-lg max-w-none text-gray-700">
                                <MarkdownRenderer content={currentTopic.content} />
                            </div>

                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <BookOpen size={64} className="mb-4 text-gray-200" />
                            <p>Select a topic to begin learning</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
}
