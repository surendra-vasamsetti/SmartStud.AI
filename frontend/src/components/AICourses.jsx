import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Layout from "../components/Layout";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { 
  Code, 
  Database, 
  Globe, 
  Layout as LayoutIcon, 
  Server, 
  Monitor, 
  ArrowRight,
  Clock,
  Star
} from "lucide-react";

export default function AICourses() {
  const navigate = useNavigate();
  // Removed manual sidebar state
  const { username } = useCurrentUser();

  const courses = [
    {
      id: "java",
      title: "Java Programming",
      description: "Master Java from basics to advanced concepts. Learn OOP, Data Structures, and building robust applications.",
      icon: <Code size={32} className="text-orange-500" />,
      color: "bg-orange-50",
      borderColor: "border-orange-100",
      btnColor: "bg-orange-500 hover:bg-orange-600",
      path: "/JavaCourseOverview",
      level: "Beginner to Advanced",
      duration: "10 Weeks"
    },
    {
      id: "html",
      title: "HTML5 Fundamentals",
      description: "Build the structure of the web. Learn semantic HTML, forms, and modern web standards.",
      icon: <LayoutIcon size={32} className="text-orange-600" />, // Renamed import to avoid conflict
      color: "bg-orange-50",
      borderColor: "border-orange-100",
      btnColor: "bg-orange-600 hover:bg-orange-700",
      path: "/HTMLCourseOverview",
      level: "Beginner",
      duration: "4 Weeks"
    },
    {
      id: "css",
      title: "CSS3 Styling",
      description: "Style your websites with precision. specific formatting, Flexbox, Grid, and responsive design.",
      icon: <Monitor size={32} className="text-blue-500" />,
      color: "bg-blue-50",
      borderColor: "border-blue-100",
      btnColor: "bg-blue-500 hover:bg-blue-600",
      path: "/CSSCourseOverview",
      level: "Beginner",
      duration: "5 Weeks"
    },
    {
      id: "js",
      title: "JavaScript Mastery",
      description: "Make your websites interactive. Learn ES6+, DOM manipulation, and asynchronous programming.",
      icon: <Globe size={32} className="text-yellow-500" />,
      color: "bg-yellow-50",
      borderColor: "border-yellow-100",
      btnColor: "bg-yellow-500 hover:bg-yellow-600",
      path: "/JSCourseOverview",
      level: "Intermediate",
      duration: "8 Weeks"
    },
    {
      id: "sql",
      title: "SQL Database",
      description: "Learn to manage and query databases. Master SQL syntax, joins, and database design.",
      icon: <Database size={32} className="text-indigo-500" />,
      color: "bg-indigo-50",
      borderColor: "border-indigo-100",
      btnColor: "bg-indigo-500 hover:bg-indigo-600",
      path: "/SQLCourseOverview",
      level: "Beginner",
      duration: "6 Weeks"
    },
    {
      id: "networks",
      title: "Computer Networks",
      description: "Understand how the internet works. OSI model, TCP/IP, protocols, and network security.",
      icon: <Server size={32} className="text-green-500" />,
      color: "bg-green-50",
      borderColor: "border-green-100",
      btnColor: "bg-green-500 hover:bg-green-600",
      path: "/NetworksCourseOverview",
      level: "Intermediate",
      duration: "8 Weeks"
    }
  ];

  return (
    <Layout>
      <div className="pt-8 pb-12 px-4 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-block px-4 py-1.5 rounded-full bg-soft-primary/10 text-soft-primary font-medium text-sm mb-4">
             Premium Education
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-soft-text mb-6 tracking-tight">
            Explore Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-soft-primary to-soft-secondary">Premium Courses</span>
          </h1>
          <p className="text-soft-muted text-lg leading-relaxed">
            Expert-curated learning paths to help you master new skills. From programming basics to advanced concepts.
          </p>
        </motion.div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className={`
                bg-white rounded-3xl shadow-soft hover:shadow-soft-hover overflow-hidden border transition-all duration-300 group
                ${course.borderColor}
              `}
            >
              <div className={`p-8 h-full flex flex-col`}>
                <div className="flex justify-between items-start mb-6">
                  <div className={`p-4 rounded-2xl shadow-sm ${course.color}`}>
                    {course.icon}
                  </div>
                  <span className="px-3 py-1 bg-gray-50 rounded-full text-xs font-semibold text-gray-600 border border-gray-100">
                    {course.level}
                  </span>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-soft-primary transition-colors">
                  {course.title}
                </h3>
                
                <p className="text-gray-600 text-sm leading-relaxed mb-6 flex-grow">
                  {course.description}
                </p>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-8 pt-4 border-t border-dashed border-gray-100">
                  <div className="flex items-center gap-1.5">
                    <Clock size={16} className="text-soft-muted" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Star size={16} className="text-yellow-400 fill-yellow-400" />
                    <span className="font-medium text-gray-700">4.8</span>
                  </div>
                </div>

                <button
                  onClick={() => navigate(course.path)}
                  className={`
                    w-full py-3.5 px-6 rounded-xl text-white font-semibold flex items-center justify-center gap-2 
                    transition-all shadow-md group-hover:shadow-lg hover:-translate-y-0.5
                    ${course.btnColor}
                  `}
                >
                  View Course
                  <ArrowRight size={18} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
