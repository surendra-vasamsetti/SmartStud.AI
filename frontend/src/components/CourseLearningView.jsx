import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { ChevronDown, ChevronRight, CheckCircle, Circle, ArrowLeft, PlayCircle, BookOpen, List, X } from "lucide-react";
import { auth } from "../firebase";
import MarkdownRenderer from "./MarkdownRenderer";

import { API_URL } from "../api/apiConfig";

export default function CourseLearningView() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [chaptersOpen, setChaptersOpen] = useState(false);
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
      if (!mobile) {
        setIsOpen(false);
        setChaptersOpen(false);
      }
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
    if (isMobile) setChaptersOpen(false);
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
    <div className="flex h-screen bg-gray-50 overflow-hidden relative">
        {/* Content Area */}
        <div className="flex-1 flex flex-col w-full h-full"> 
            {/* Top Header */}
            <div className="bg-white border-b border-gray-200 px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between shadow-sm z-20 gap-3 sm:gap-4">
                {/* Left: Back + Title */}
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                   <button
                      onClick={() => navigate(`/course-overview/${courseId}`)}
                      className="p-1.5 sm:p-2 text-gray-600 hover:text-black transition-colors rounded-lg hover:bg-gray-100 shrink-0"
                      title="Back to Overview"
                  >
                      <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
                  </button>
                  <div className="h-6 w-[1px] bg-gray-200 mx-0.5 hidden sm:block shrink-0"></div>
                  <h1 className="text-sm sm:text-lg font-bold text-gray-800 truncate">{course.title}</h1>
                </div>

                {/* Right: Progress + Mobile Chapters */}
                <div className="flex items-center gap-2 sm:gap-6 shrink-0">
                   {/* Progress */}
                   <div className="flex items-center gap-2 sm:gap-3">
                      <span className="text-[10px] sm:text-xs font-semibold text-gray-500 whitespace-nowrap">
                        {Math.round(progress?.completionPercentage || 0)}% <span className="hidden sm:inline">Complete</span>
                      </span>
                      <div className="bg-gray-200 h-1.5 sm:h-2 rounded-full overflow-hidden w-12 sm:w-24 md:w-32">
                          <div
                              className="bg-purple-600 h-full rounded-full transition-all duration-500"
                              style={{ width: `${progress?.completionPercentage || 0}%` }}
                          />
                      </div>
                  </div>

                  {/* Mobile Chapters Toggle */}
                  <button 
                    onClick={() => setChaptersOpen(!chaptersOpen)}
                    className="md:hidden flex items-center gap-1.5 px-2.5 py-1.5 bg-purple-50 text-purple-700 rounded-lg font-medium text-[10px] sm:text-xs hover:bg-purple-100 transition-colors"
                  >
                    <List size={14} className="sm:w-4 sm:h-4" />
                    <span>Chapters</span>
                  </button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden relative">
                
                {/* Backdrop (Mobile Only) */}
                <AnimatePresence>
                  {isMobile && chaptersOpen && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setChaptersOpen(false)}
                      className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30"
                    />
                  )}
                </AnimatePresence>

                {/* Course Chapter Sidebar - Transformed for mobile */}
                <div className={`
                  ${isMobile 
                    ? `fixed top-0 right-0 h-full w-72 z-40 transition-transform duration-300 ease-in-out transform ${chaptersOpen ? "translate-x-0" : "translate-x-full"}`
                    : "w-80 border-r"
                  }
                  border-gray-200 bg-white flex flex-col overflow-hidden shadow-lg md:shadow-none
                `}>
                    {/* Sidebar Header (Mobile Only) */}
                    {isMobile && (
                      <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                        <span className="font-bold text-gray-800">Course Content</span>
                        <button onClick={() => setChaptersOpen(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                          <X size={20} className="text-gray-500" />
                        </button>
                      </div>
                    )}

                    {/* Sidebar Content (Chapters) */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
                        {course.chapters.map((chapter, index) => (
                            <div key={index} className="rounded-lg overflow-hidden">
                                <button
                                    onClick={() => toggleChapter(index)}
                                    className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors rounded-lg border border-transparent hover:border-gray-100"
                                >
                                    <span className="font-semibold text-gray-800 text-xs sm:text-sm">
                                        {index + 1}. {chapter.title}
                                    </span>
                                    {expandedChapters.includes(index) ? 
                                        <ChevronDown size={14} className="text-gray-400"/> : 
                                        <ChevronRight size={14} className="text-gray-400"/>
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
                                                        className={`w-full flex items-start gap-3 p-2.5 text-xs sm:text-sm rounded-lg transition-all border ${
                                                            isActive 
                                                            ? "bg-purple-50 text-purple-700 font-medium border-purple-100" 
                                                            : "text-gray-600 hover:bg-gray-50 border-transparent hover:border-gray-100"
                                                        }`}
                                                    >
                                                        <div className="mt-0.5 min-w-[14px] sm:min-w-[16px]">
                                                            {isCompleted ? (
                                                                <CheckCircle size={14} className="text-green-500 fill-green-50" />
                                                            ) : isActive ? (
                                                                <Circle size={14} className="text-purple-600 fill-purple-100" />
                                                            ) : (
                                                                <Circle size={14} className="text-gray-300" />
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
                <div className="flex-1 overflow-y-auto bg-gray-50/50 custom-scrollbar">
                    {currentTopic ? (
                        <div className="max-w-4xl mx-auto px-4 py-6 sm:px-8 sm:py-10">
                            {/* Header Section */}
                            <div className="mb-6 sm:mb-8 border-b border-gray-100 pb-6">
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{currentTopic.title}</h1>
                                <p className="text-gray-500 text-xs sm:text-sm">Topic {currentTopic.order} of Chapter {expandedChapters[0] + 1}</p>
                            </div>

                            {/* Related Videos Section */}
                            {(currentTopic.videos?.length > 0 || currentTopic.videoUrl) && (
                                <div className="mb-8 sm:mb-10">
                                    <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        Related Videos 
                                        <span role="img" aria-label="clapper">🎬</span>
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
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
                                                        src={video.thumbnail || `https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400&fit=crop`} 
                                                        alt={video.title} 
                                                        className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity"
                                                    />
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                                            <PlayCircle size={20} className="sm:w-6 sm:h-6 text-white fill-white" />
                                                        </div>
                                                    </div>
                                                    <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 bg-gradient-to-t from-black/80 to-transparent text-white">
                                                        <p className="font-semibold text-xs sm:text-sm truncate">{video.title}</p>
                                                        <p className="text-[10px] sm:text-xs opacity-80">Watch on YouTube</p>
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
                                                    src={`https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=600&h=400&fit=crop`} 
                                                    alt="Video Thumbnail" 
                                                    className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity"
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                                        <PlayCircle size={20} className="sm:w-6 sm:h-6 text-white fill-white" />
                                                    </div>
                                                </div>
                                                <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 bg-gradient-to-t from-black/80 to-transparent text-white">
                                                    <p className="font-semibold text-xs sm:text-sm truncate">{currentTopic.title} Tutorial</p>
                                                    <p className="text-[10px] sm:text-xs opacity-80">Watch on YouTube</p>
                                                </div>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Content Section */}
                            <div className="prose prose-sm sm:prose prose-purple max-w-none text-gray-700">
                                <MarkdownRenderer content={currentTopic.content} />
                            </div>

                            {/* Completion Section at Bottom */}
                            <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col items-center gap-4">
                                <p className="text-sm text-gray-500 italic">Have you finished reading? Mark this topic as completed to track your progress.</p>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleMarkAsCompleted}
                                    disabled={isTopicCompleted(currentTopic.topicId) || completing}
                                    className={`w-full sm:w-auto px-10 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-3 transition-all shadow-md ${
                                        isTopicCompleted(currentTopic.topicId)
                                        ? "bg-green-100 text-green-700 border border-green-200 cursor-default shadow-none"
                                        : "bg-purple-600 text-white hover:bg-purple-700 shadow-purple-200 hover:shadow-purple-300"
                                    }`}
                                >
                                    {isTopicCompleted(currentTopic.topicId) ? (
                                        <>
                                            <CheckCircle size={18} />
                                            Topic Completed
                                        </>
                                    ) : completing ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Updating Progress...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle size={18} />
                                            Mark as Completed
                                        </>
                                    )}
                                </motion.button>
                            </div>

                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 p-6 text-center">
                            <BookOpen size={48} className="sm:w-16 sm:h-16 mb-4 text-gray-200" />
                            <p className="text-sm sm:text-base">Select a topic from the {isMobile ? "chapters menu" : "sidebar"} to begin learning</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
}
