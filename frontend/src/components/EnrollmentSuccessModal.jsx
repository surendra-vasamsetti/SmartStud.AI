import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, ArrowRight, Sparkles } from 'lucide-react';
import CourseThumbnail from './CourseThumbnail';

export default function EnrollmentSuccessModal({ isOpen, onClose, course, onGoToCourse }) {
  if (!isOpen || !course) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden relative"
        >
          {/* Confetti / Celebration Decoration */}
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-purple-500 to-indigo-600"></div>
          
          <div className="relative pt-12 px-6 pb-8 text-center">
            {/* Success Icon */}
            <div className="mx-auto w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg mb-6 relative z-10">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>

            <h2 className="text-3xl font-bold text-gray-800 mb-2">Enrollment Success!</h2>
            <p className="text-gray-500 mb-8">You are all set to start learning.</p>

            {/* Course Card Preview */}
            <div className="bg-gray-50 rounded-2xl p-4 mb-8 text-left border border-gray-100 flex gap-4 items-center">
               <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                  <CourseThumbnail course={course} className="h-full w-full" />
               </div>
               <div>
                 <h3 className="font-bold text-gray-800 line-clamp-2 leading-tight mb-1">{course.title}</h3>
                 <span className="text-xs font-semibold px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                   {course.category}
                 </span>
               </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onGoToCourse}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-purple-200 flex items-center justify-center gap-2"
              >
                Start Learning Now <ArrowRight size={20} />
              </motion.button>
              
              <button 
                onClick={onClose}
                className="w-full py-3 text-gray-500 font-medium hover:text-gray-700 transition-colors"
              >
                Stay Here
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
