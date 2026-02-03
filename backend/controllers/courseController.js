import { Course, Enrollment, UserProgress } from '../models/courseModel.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// Use gemini-2.5-flash as requested (matching working Quiz/Chat model)
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

// Templates for content generation
const contentTemplates = [
  "In this detailed section, we explore the core principles of {topic}. Understanding this is fundamental to mastering {course}.",
  "{topic} represents a paradigm shift in how we approach {category}. We'll dissect the mechanics and see why it matters.",
  "Many developers struggle with {topic}, but we break it down into simple, actionable steps in this module.",
  "We will build a mini-project focusing on {topic}. This hands-on approach ensures you grasp the practical applications within {course}.",
  "What makes {topic} so powerful? We analyze its performance implications and how it optimizes your {category} workflow.",
  "A deep dive into {topic}: differentiating between common misconceptions and industry standards.",
  "From theory to practice: implementing {topic} in a real-world {course} environment.",
  "Advanced techniques in {topic} that differentiate junior developers from seniors.",
  "Troubleshooting {topic}: How to debug common errors and ensure reliability in your applications.",
  "Integrating {topic} with existing systems: A guide to seamless architecture in {category}."
];

const interactions = [
  "Try it yourself: Open your editor and type out the example code.",
  "Pro Tip: Always verify your inputs/outputs when working with this concept.",
  "Challenge: Can you modify the standard behavior to suit a custom use case?",
  "Note: This feature was significantly updated in the latest version."
];

// Helper to generate content from templates
const generateTopicContent = (courseName, category, topicTitle, chapterIndex, topicIndex) => {
    // Select template and interaction deterministically but varied
    const template = contentTemplates[((chapterIndex + 1) * (topicIndex + 1)) % contentTemplates.length];
    const interaction = interactions[(chapterIndex + topicIndex) % interactions.length];
    
    const uniqueContent = template
      .replace(/{topic}/g, `**${topicTitle}**`)
      .replace(/{course}/g, courseName)
      .replace(/{category}/g, category);

    return `# ${topicTitle}\n\n${uniqueContent}\n\n## Deep Dive\n${interaction}\n\n## Why is this important?\nUnderstanding **${topicTitle}** gives you the ability to build more robust *${category}* applications. \n\n## Practical Example\nHere is how you might approach this in a real-world scenario:\n\n1. Analyze the requirements for ${topicTitle}\n2. Implement the core logic\n3. Test and verify\n\n> "Learning ${topicTitle} was a turning point in my ${courseName} journey." - Senior Developer\n\n## Summary\nWe have covered the basics of ${topicTitle}. In the next section, we will expand on this.`;
};

const generateAIContent = async (courseName, topicTitle, chapterTitle, category) => {
    let retries = 0;
    const maxRetries = 3;
    
    while (retries < maxRetries) {
        try {
            const prompt = `
            You are an expert instructor creating content for a course on "${courseName}".
            
            Topic: "${topicTitle}"
            Chapter: "${chapterTitle}"
            Category: "${category}"

            Write a detailed, engaging, and educational lesson for this topic.
            
            Structure:
            1. **Introduction**: Explain the concept clearly (ELIF style but professional).
            2. **Key Concepts**: Bullet points of important terms/ideas.
            3. **Real-World Application**: How is this used in industry?
            4. **Code Example / Practical Demo**: If coding, provide a code block. If not, provide a step-by-step meaningful example.
            5. **Summary**: A quick wrap-up.

            Format: Markdown. Keep it strictly educational and high quality. Avoid generic filler text.
            `;

            const result = await model.generateContent(prompt);
            return result.response.text();
        } catch (error) {
            const isRateLimit = error.message.includes('429') || error.message.includes('Quota');
            
            if (isRateLimit) {
                retries++;
                const delay = Math.pow(2, retries) * 2000; // 4s, 8s, 16s
                console.warn(`⚠️ Rate limit hit for "${topicTitle}". Retrying in ${delay/1000}s... (Attempt ${retries}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                 console.error(`❌ Fatal AI Error for "${topicTitle}":`, error.message);
                 throw error; // Non-retryable error
            }
        }
    }
    
    throw new Error("Max retries exceeded");
};

// Smart Mock Data helper
const getSmartMockData = (courseName, category) => {
  const name = courseName.toLowerCase();
  
  if (name.includes('java') && !name.includes('script')) {
    return [
      {
        title: "Introduction to Java",
        topics: ["JVM, JRE, and JDK Explained", "Variables and Data Types", "Control Flow Statements", "Your First Hello World"]
      },
      {
        title: "Object-Oriented Programming",
        topics: ["Classes and Objects", "Inheritance and Polymorphism", "Encapsulation Principles", "Abstract Classes and Interfaces"]
      },
      {
        title: "Java Collections Framework",
        topics: ["ArrayList vs LinkedList", "HashSet and Maps", "Iterators and Streams", "Generics Deep Dive"]
      },
      {
        title: "Advanced Concepts",
        topics: ["Exception Handling", "Multithreading Basics", "File I/O Operations", "Lambda Expressions"]
      }
    ];
  }
  
  if (name.includes('react') || name.includes('redux')) {
    return [
      {
        title: "React Fundamentals",
        topics: ["JSX and Rendering Elements", "Components and Props", "State and Lifecycle", "Handling Events"]
      },
      {
        title: "React Hooks",
        topics: ["useState and useEffect", "Custom Hooks", "useContext and useReducer", "Rules of Hooks"]
      },
      {
        title: "React Router & Navigation",
        topics: ["Setting up Router", "Nested Routes", "Programmatic Navigation", "Protected Routes"]
      },
      {
        title: "State Management",
        topics: ["Context API", "Redux Toolkit Basics", "Async Data Fetching", "Performance Optimization"]
      }
    ];
  }

  if (name.includes('python')) {
    return [
      {
        title: "Python Basics",
        topics: ["Syntax and Indentation", "Variables and Standard Types", "Lists, Tuples, and Sets", "Dictionaries"]
      },
      {
        title: "Control Structures",
        topics: ["If-Else Statements", "For and While Loops", "Functions and Lambda", "List Comprehensions"]
      },
      {
        title: "Modules and Packages",
        topics: ["Importing Modules", "Standard Library Tour", "Pip and Virtual Environments", "File Handling"]
      },
      {
        title: "Object-Oriented Python",
        topics: ["Classes and Objects", "Inheritance", "Magic Methods", "Decorators"]
      }
    ];
  }

  if (name.includes('web') || name.includes('html') || name.includes('css') || name.includes('javascript') || name.includes('js')) {
     return [
      {
        title: "HTML5 & CSS3 Fundamentals",
        topics: ["Semantic HTML Structure", "CSS Box Model & Flexbox", "Grid Layouts", "Responsive Design"]
      },
      {
        title: "JavaScript Basics",
        topics: ["Variables & Data Types", "ES6+ Features", "DOM Manipulation", "Event Handling"]
      },
      {
        title: "Asynchronous JavaScript",
        topics: ["Callbacks & Promises", "Async/Await", "Fetch API", "Error Handling"]
      }
    ];
  }
  
  if (name.includes('node') || name.includes('express')) {
      return [
        {
            title: "Node.js Fundamentals",
            topics: ["Node.js Architecture", "Modules & NPM", "File System API", "Streams & Buffers"]
        },
        {
            title: "Express.js Framework",
            topics: ["Routing & Middleware", "REST API Design", "Error Handling", "Database Integration"]
        }
      ]
  }

  return null; // Fallback to generic if no match
};

// Helper to get Unsplash Image
const getUnsplashImage = async (query) => {
    if (!process.env.UNSPLASH_ACCESS_KEY) return "";

    try {
        const response = await fetch(`https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&orientation=landscape&client_id=${process.env.UNSPLASH_ACCESS_KEY}`);
        const data = await response.json();
        
        if (data && data.urls && data.urls.regular) {
            return data.urls.regular;
        }
        return "";
    } catch (error) {
        console.error("Unsplash API Error:", error.message);
        return "";
    }
};

// YouTube Search Helper
const getYouTubeVideos = async (term) => {
    if (!process.env.YOUTUBE_API_KEY) {
        // Fallback if no API Key: Return generic Search Object
        return [{
            title: `${term} (Search Results)`,
            url: `https://www.youtube.com/results?search_query=${encodeURIComponent(term)}`,
            thumbnail: `https://source.unsplash.com/600x400/?${encodeURIComponent(term)},learning`
        }];
    }

    try {
        const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=2&q=${encodeURIComponent(term)}&type=video&key=${process.env.YOUTUBE_API_KEY}`);
        const data = await response.json();
        
        if (data.items) {
            return data.items.map(item => ({
                title: item.snippet.title,
                url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
                thumbnail: item.snippet.thumbnails.medium.url
            }));
        }
        return [];
    } catch (error) {
        console.error("YouTube API Error", error);
        return [];
    }
};

// Mock data generator for fallback (Outline Only)
const generateMockOutline = (courseName, description, numChapters, category, difficulty, includeVideo) => {
  console.log(`[SmartGenerator] Generating outline for: ${courseName} (${category})`);
  const chapters = [];
  
  // Try to get smart data
  const smartData = getSmartMockData(courseName, category);

  if (smartData) {
    // Use smart data, limited by numChapters
    const chaptersToUse = smartData.slice(0, numChapters);
    
    chaptersToUse.forEach((chap, i) => {
        const topics = chap.topics.map((t) => ({
             title: t,
             content: "",
             videoSearchTerm: includeVideo ? `${courseName} ${t} tutorial` : ''
        }));
        
        chapters.push({
            chapterNumber: i + 1,
            title: `Chapter ${i+1}: ${chap.title}`,
            duration: `${Math.floor(Math.random() * 2) + 1} Hours`,
            topics
        });
    });
    
    // If user asked for more chapters than we have in smart data, fill with generic
    for(let i = chaptersToUse.length + 1; i <= numChapters; i++) {
        const topics = [];
        for (let j = 1; j <= 3; j++) {
            topics.push({
                title: `${courseName} Advanced Topic ${i}.${j}`,
                content: "",
                videoSearchTerm: includeVideo ? `${courseName} Topic ${i}.${j} tutorial` : ''
            });
        }
        chapters.push({
            chapterNumber: i,
            title: `Chapter ${i}: Advanced Applications`,
            duration: "2 Hours",
            topics
        });
    }

  } else {
    // Completely Generic Fallback
    for (let i = 1; i <= numChapters; i++) {
        const topics = [];
        const numTopics = Math.floor(Math.random() * 3) + 3; // 3-6 topics

        for (let j = 1; j <= numTopics; j++) {
        topics.push({
            title: `${courseName} Topic ${i}.${j}`,
            content: "", // Empty for outline
            videoSearchTerm: includeVideo ? `${courseName} Topic ${i}.${j} tutorial` : ''
        });
        }

        chapters.push({
        chapterNumber: i,
        title: `Chapter ${i}: Fundamentals of ${courseName}`,
        duration: `${Math.floor(Math.random() * 2) + 1} Hours`,
        topics
        });
    }
  }

  return {
    title: courseName,
    description: description,
    duration: `${numChapters * 2} Weeks`,
    chapters
  };
};

// Generate AI Course Outline
export const generateCourse = async (req, res) => {
  try {
    const { courseName, description, numChapters, includeVideo, category, difficulty, userId } = req.body;

    if (!courseName || !description || !numChapters || !category || !difficulty || !userId) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    let courseData;

    try {
      const prompt = `Generate a structured educational course OUTLINE with the following details:
      - Title: ${courseName}
      - Title: ${courseName}
      - User's Intent: ${description} (Use this as a base, but generate a comprehensive, professional, and engaging course description of at least 3-4 sentences.)
      - Target Duration: ${req.body.targetDuration || 'Flexible'}
      - Number of Chapters: ${numChapters}
      - Difficulty: ${difficulty}
      - Category: ${category}
      
      For each chapter, generate:
      1. A descriptive chapter title
      2. 4-6 topics (Titles ONLY, do NOT generate detailed content yet)
      3. Estimated duration for the chapter
      
      ${includeVideo ? 'For each topic, suggest a specific, searchable YouTube video title.' : ''}
      
      Return ONLY a valid JSON object:
      {
        "title": "course title",
        "description": "detailed course description",
        "duration": "total duration",
        "chapters": [
          {
            "chapterNumber": 1,
            "title": "chapter title",
            "duration": "duration",
            "topics": [
              {
                "title": "topic title",
                "videoSearchTerm": "search term"
              }
            ]
          }
        ]
      }`;

      const result = await model.generateContent(prompt);
      const aiResponse = result.response.text();
      const cleanResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      courseData = JSON.parse(cleanResponse);

    } catch (aiError) {
      // Log simple message instead of full stack trace for known 429/404 errors
      if (aiError.message.includes('429') || aiError.message.includes('Quota') || aiError.message.includes('404') || aiError.message.includes('not found')) {
         console.warn('⚠️ AI Model Unavailable (Quota or Not Found). Switching to Smart Mock Generator.');
      } else {
         console.error('AI Generation failed:', aiError.message);
      }
      
      courseData = generateMockOutline(courseName, description, numChapters, category, difficulty, includeVideo);
    }

    // Process Topics and Save
     courseData.chapters = courseData.chapters.map((chapter, chapterIndex) => ({
      ...chapter,
      topics: chapter.topics.map((topic, topicIndex) => ({
        topicId: `ch${chapterIndex + 1}-t${topicIndex + 1}`,
        title: topic.title,
        content: "", // Explicitly empty for outline
        videoSearchTerm: topic.videoSearchTerm || '',
        videos: [], // Will be filled in Step 2
        order: topicIndex + 1
      }))
    }));

      // Optimize query to avoid ambiguity (e.g. Python snake vs code)
      let queryTerm = courseName;
      const lowerName = courseName.toLowerCase();
      
      if (lowerName.includes('python')) {
          // 'syntax' and 'abstract' help get flat textual images, avoiding angled laptops/snakes
          queryTerm = 'python code syntax abstract'; 
      } else if (lowerName.includes('java') && !lowerName.includes('script')) {
          queryTerm = 'java code syntax minimal';
      } else if (lowerName.includes('react')) {
           queryTerm = 'react js code abstract';
      } else {
           // Generalizer: use 'texture' or 'pattern' to get flat backgrounds
           queryTerm = `${courseName} coding pattern digital`;
      }

      const unsplashImage = await getUnsplashImage(queryTerm);
      
      const course = new Course({
        title: courseData.title,
        description: courseData.description,
        difficulty,
        category,
        duration: courseData.duration,
        includeVideo,
        status: 'outline', // Set status to outline
        chapters: courseData.chapters,
        createdBy: userId,
        thumbnail: unsplashImage || "" // Uses Unsplash or falls back to Gradient
      });

    await course.save();

    res.status(201).json({ success: true, course });
  } catch (error) {
    console.error('Course generation error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate course', error: error.message });
  }
};

// Generate Content for Existing Course
export const generateCourseContent = async (req, res) => {
    try {
        const { courseId } = req.body;
        
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        // Fill content for each topic
        // Return response IMMEDIATELY to allow polling
        res.status(202).json({ success: true, message: 'Content generation started', courseId });

        // Run generation in background (do not await here)
        (async () => {
            try {
                // Fill content for each topic
                for (const [cIndex, chapter] of course.chapters.entries()) {
                    for (const [tIndex, topic] of chapter.topics.entries()) {
                        // Generate Text Content
                        if (!topic.content || topic.content.trim() === '') {
                            try {
                                 // Attempt AI Generation
                                await new Promise(r => setTimeout(r, 2000)); // Rate limit buffer
                                topic.content = await generateAIContent(course.title, topic.title, chapter.title, course.category);
                            } catch (err) {
                                // Fallback to Template if AI fails
                                topic.content = generateTopicContent(course.title, course.category, topic.title, cIndex, tIndex);
                            }
                        }

                        // Fetch Videos (if enabled and missing)
                        if (course.includeVideo && topic.videoSearchTerm && (!topic.videos || topic.videos.length === 0)) {
                            // Slight delay for video API
                            topic.videos = await getYouTubeVideos(topic.videoSearchTerm);
                        }
                        
                         // SAVE PROGRESS after EACH TOPIC to enable "Green Light" indicator on frontend
                        await course.save();
                    }
                }

                course.status = 'published';
                await course.save();
                console.log(`[ContentGen] Course ${courseId} fully generated.`);

            } catch (bgError) {
                console.error('[ContentGen] Background generation failed:', bgError);
            }
        })();

    } catch (error) {
        console.error('Content generation error:', error);
        // Only verify headers sent if we crashed before sending response
        if (!res.headersSent) {
             res.status(500).json({ success: false, message: 'Failed to generate content', error: error.message });
        }
    }
};

// Delete Course
export const deleteCourse = async (req, res) => {
    try {
        const { courseId } = req.params;

        // Delete course
        await Course.findByIdAndDelete(courseId);
        
        // Delete enrollments
        await Enrollment.deleteMany({ courseId });
        
        // Delete progress
        await UserProgress.deleteMany({ courseId });

        res.status(200).json({ success: true, message: 'Course deleted successfully' });
    } catch (error) {
        console.error('Delete course error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete course', error: error.message });
    }
};

export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, courses });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch courses', error: error.message });
  }
};

export const getCourseById = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    res.status(200).json({ success: true, course });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch course', error: error.message });
  }
};

export const enrollCourse = async (req, res) => {
  try {
    const { userId, courseId } = req.body;
    if (!userId || !courseId) return res.status(400).json({ success: false, message: 'Missing userId or courseId' });

    const existingEnrollment = await Enrollment.findOne({ userId, courseId });
    if (existingEnrollment) return res.status(400).json({ success: false, message: 'Already enrolled' });

    const enrollment = new Enrollment({ userId, courseId, lastAccessedTopicId: 'ch1-t1' });
    await enrollment.save();

    const progress = new UserProgress({ userId, courseId, completedTopics: [], completionPercentage: 0 });
    await progress.save();

    res.status(201).json({ success: true, enrollment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to enroll', error: error.message });
  }
};

export const getMyCourses = async (req, res) => {
  try {
    const { userId } = req.params;
    const enrollments = await Enrollment.find({ userId }).populate('courseId');
    const coursesWithProgress = await Promise.all(
      enrollments.map(async (enrollment) => {
        if(!enrollment.courseId) return null; // Handle deleted courses
        const progress = await UserProgress.findOne({ userId, courseId: enrollment.courseId._id });
        return {
          ...enrollment.courseId.toObject(),
          enrolledAt: enrollment.enrolledAt,
          lastAccessedTopicId: enrollment.lastAccessedTopicId,
          progress: progress ? progress.completionPercentage : 0,
          completedTopics: progress ? progress.completedTopics : []
        };
      })
    );
    res.status(200).json({ success: true, courses: coursesWithProgress.filter(c => c !== null) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch enrolled courses', error: error.message });
  }
};

export const completeTopic = async (req, res) => {
  try {
    const { userId, courseId, topicId } = req.body;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    const totalTopics = course.chapters.reduce((sum, chapter) => sum + chapter.topics.length, 0);
    let progress = await UserProgress.findOne({ userId, courseId });
    if (!progress) progress = new UserProgress({ userId, courseId, completedTopics: [] });

    if (!progress.completedTopics.includes(topicId)) {
      progress.completedTopics.push(topicId);
      progress.completionPercentage = Math.round((progress.completedTopics.length / totalTopics) * 100);
      progress.updatedAt = new Date();
      await progress.save();
    }

    await Enrollment.findOneAndUpdate({ userId, courseId }, { lastAccessedTopicId: topicId, lastAccessedAt: new Date() });
    res.status(200).json({ success: true, progress });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to mark topic as completed', error: error.message });
  }
};

export const getProgress = async (req, res) => {
  try {
    const { userId, courseId } = req.params;
    const progress = await UserProgress.findOne({ userId, courseId });
    if (!progress) return res.status(200).json({ success: false, message: 'Progress not found' });
    res.status(200).json({ success: true, progress });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch progress', error: error.message });
  }
};
