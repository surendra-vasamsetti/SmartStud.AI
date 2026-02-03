import mongoose from 'mongoose';

// Topic Schema
const topicSchema = new mongoose.Schema({
  topicId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    default: ''
  },
  videos: [{
    title: String,
    url: String,
    thumbnail: String
  }],
  videoSearchTerm: {
    type: String,
    default: ''
  },
  order: {
    type: Number,
    required: true
  }
});

// Chapter Schema
const chapterSchema = new mongoose.Schema({
  chapterNumber: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  duration: {
    type: String,
    required: true
  },
  topics: [topicSchema]
});

// Course Schema
const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    required: true
  },
  category: {
    type: String,
    required: true
  },
  duration: {
    type: String,
    required: true
  },
  includeVideo: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['outline', 'published'],
    default: 'published'
  },
  chapters: [chapterSchema],
  createdBy: {
    type: String,
    required: true
  },
  thumbnail: {
    type: String,
    default: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Enrollment Schema
const enrollmentSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  enrolledAt: {
    type: Date,
    default: Date.now
  },
  lastAccessedTopicId: {
    type: String,
    default: ''
  },
  lastAccessedAt: {
    type: Date,
    default: Date.now
  }
});

// User Progress Schema
const userProgressSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  completedTopics: [{
    type: String
  }],
  completionPercentage: {
    type: Number,
    default: 0
  },
  currentChapter: {
    type: Number,
    default: 0
  },
  currentTopic: {
    type: Number,
    default: 0
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create indexes for faster queries
enrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });
userProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true });

export const Course = mongoose.model('Course', courseSchema);
export const Enrollment = mongoose.model('Enrollment', enrollmentSchema);
export const UserProgress = mongoose.model('UserProgress', userProgressSchema);
