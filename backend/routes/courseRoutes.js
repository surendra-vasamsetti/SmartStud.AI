import express from 'express';
import * as courseController from '../controllers/courseController.js';

const router = express.Router();

// Course generation
router.post('/generate', courseController.generateCourse);

// Get all courses
router.get('/all', courseController.getAllCourses);

// Generate course content (Step 2)
router.post('/generate-content', courseController.generateCourseContent);

// Get course by ID
router.get('/:courseId', courseController.getCourseById);

// Delete course
router.delete('/:courseId', courseController.deleteCourse);

// Enrollment
router.post('/enroll', courseController.enrollCourse);

// Get user's enrolled courses
router.get('/my-courses/:userId', courseController.getMyCourses);

// Progress tracking
router.post('/progress/complete-topic', courseController.completeTopic);
router.get('/progress/:userId/:courseId', courseController.getProgress);

export default router;
