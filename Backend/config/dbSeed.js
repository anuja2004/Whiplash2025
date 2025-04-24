import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";


// Import models
import User from '../models/User.js';
import Course from '../models/Course.js';
import Assignment from '../models/general/Assignment.js';
import Quiz from '../models/general/Quiz.js';
import Note from '../models//general/Note.js';
import UserProgress from '../models/UserProgress.js';
import Submission from '../models//general/Submission.js';


dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected...'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Clear all collections before seeding
const clearCollections = async () => {
  await User.deleteMany({});
  await Course.deleteMany({});
  await Assignment.deleteMany({});
  await Quiz.deleteMany({});
  await Note.deleteMany({});
  await UserProgress.deleteMany({});
  await Submission.deleteMany({});
  console.log('All collections cleared');
};

// Seed Data

// Users
const seedUsers = async () => {
  const hashedPassword = await bcrypt.hash('password123', 10);

  const users = [
    {
      name: 'John Doe',
      email: 'john@example.com',
      password: hashedPassword,
      role: 'student'
    },
    {
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: hashedPassword,
      role: 'instructor'
    },
    {
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin'
    }
  ];

  const createdUsers = await User.insertMany(users);
  console.log(`${createdUsers.length} users seeded`);
  return createdUsers;
};

// Resource data (YouTube links) for topics
const resourceData = {
  // Web Development Resources
  'HTML Basics': {
    videoResources: [
      { type: 'video', url: 'https://www.youtube.com/watch?v=qz0aGYrrlhU', title: 'HTML Crash Course For Absolute Beginners' },
      { type: 'video', url: 'https://www.youtube.com/watch?v=UB1O30fR-EE', title: 'HTML5 Tutorial For Beginners' }
    ],
    articleResources: [
      { type: 'article', url: 'https://developer.mozilla.org/en-US/docs/Learn/HTML/Introduction_to_HTML', title: 'Introduction to HTML - MDN Web Docs' }
    ]
  },
  'CSS Fundamentals': {
    videoResources: [
      { type: 'video', url: 'https://www.youtube.com/watch?v=yfoY53QXEnI', title: 'CSS Crash Course For Absolute Beginners' },
      { type: 'video', url: 'https://www.youtube.com/watch?v=1Rs2ND1ryYc', title: 'CSS Tutorial - Zero to Hero' }
    ],
    articleResources: [
      { type: 'article', url: 'https://developer.mozilla.org/en-US/docs/Learn/CSS', title: 'Learn CSS - MDN Web Docs' }
    ]
  },
  'JavaScript Core': {
    videoResources: [
      { type: 'video', url: 'https://www.youtube.com/watch?v=hdI2bqOjy3c', title: 'JavaScript Crash Course For Beginners' },
      { type: 'video', url: 'https://www.youtube.com/watch?v=PkZNo7MFNFg', title: 'Learn JavaScript - Full Course for Beginners' }
    ],
    articleResources: [
      { type: 'article', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide', title: 'JavaScript Guide - MDN Web Docs' }
    ]
  },
  'DOM Manipulation': {
    videoResources: [
      { type: 'video', url: 'https://www.youtube.com/watch?v=0ik6X4DJKCc', title: 'JavaScript DOM Manipulation - Full Course for Beginners' },
      { type: 'video', url: 'https://www.youtube.com/watch?v=wiozYyXQEVk', title: 'DOM Manipulation in JavaScript' }
    ],
    articleResources: [
      { type: 'article', url: 'https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Introduction', title: 'Introduction to the DOM - MDN Web Docs' }
    ]
  },
  'Frontend Framework (React/Vue/Angular)': {
    videoResources: [
      { type: 'video', url: 'https://www.youtube.com/watch?v=w7ejDZ8SWv8', title: 'React JS Crash Course' },
      { type: 'video', url: 'https://www.youtube.com/watch?v=qZXt1Aom3Cs', title: 'Vue.js Crash Course' },
      { type: 'video', url: 'https://www.youtube.com/watch?v=3dHNOWTI7H8', title: 'Angular Crash Course' }
    ],
    articleResources: [
      { type: 'article', url: 'https://reactjs.org/docs/getting-started.html', title: 'Getting Started with React' },
      { type: 'article', url: 'https://vuejs.org/guide/introduction.html', title: 'Introduction to Vue.js' }
    ]
  },
  'State Management': {
    videoResources: [
      { type: 'video', url: 'https://www.youtube.com/watch?v=CVpUuw9XSjY', title: 'Redux Crash Course with React' },
      { type: 'video', url: 'https://www.youtube.com/watch?v=9jULHSe41ls', title: 'State Management in React with Context API' }
    ],
    articleResources: [
      { type: 'article', url: 'https://redux.js.org/introduction/getting-started', title: 'Getting Started with Redux' }
    ]
  },
  'Node.js Backend': {
    videoResources: [
      { type: 'video', url: 'https://www.youtube.com/watch?v=fBNz5xF-Kx4', title: 'Node.js Crash Course' },
      { type: 'video', url: 'https://www.youtube.com/watch?v=Oe421EPjeBE', title: 'Node.js and Express.js - Full Course' }
    ],
    articleResources: [
      { type: 'article', url: 'https://nodejs.org/en/learn/getting-started/introduction-to-nodejs', title: 'Introduction to Node.js' }
    ]
  },
  'Express.js Framework': {
    videoResources: [
      { type: 'video', url: 'https://www.youtube.com/watch?v=L72fhGm1tfE', title: 'Express JS Crash Course' }
    ],
    articleResources: [
      { type: 'article', url: 'https://expressjs.com/en/starter/basic-routing.html', title: 'Basic Routing - Express.js' }
    ]
  },
  'Databases (SQL/NoSQL)': {
    videoResources: [
      { type: 'video', url: 'https://www.youtube.com/watch?v=HXV3zeQKqGY', title: 'SQL Tutorial - Full Database Course for Beginners' },
      { type: 'video', url: 'https://www.youtube.com/watch?v=pWbMrx5rVBE', title: 'MongoDB Crash Course' }
    ],
    articleResources: [
      { type: 'article', url: 'https://www.mongodb.com/docs/manual/core/databases-and-collections/', title: 'MongoDB Databases and Collections' }
    ]
  },
  'Authentication & Authorization': {
    videoResources: [
      { type: 'video', url: 'https://www.youtube.com/watch?v=2jqok-WgelI', title: 'Authentication with JWT and Node.js' },
      { type: 'video', url: 'https://www.youtube.com/watch?v=X48VuDVv0do', title: 'OAuth 2.0 and OpenID Connect' }
    ],
    articleResources: [
      { type: 'article', url: 'https://jwt.io/introduction', title: 'Introduction to JSON Web Tokens' }
    ]
  },

  // Operating Systems Resources
  'Introduction & History': {
    videoResources: [
      { type: 'video', url: 'https://www.youtube.com/watch?v=vBURTt97EkA', title: 'Operating Systems: Crash Course Computer Science' },
      { type: 'video', url: 'https://www.youtube.com/watch?v=9GDX-IyZ_C8', title: 'Introduction to Operating Systems' }
    ],
    articleResources: [
      { type: 'article', url: 'https://www.tutorialspoint.com/operating_system/os_overview.htm', title: 'Operating System Overview' }
    ]
  },
  'Process Management': {
    videoResources: [
      { type: 'video', url: 'https://www.youtube.com/watch?v=jZ_6PXoaoxo', title: 'Processes in Operating System' },
      { type: 'video', url: 'https://www.youtube.com/watch?v=OrM7nZcxXZU', title: 'Process Management (Part 1)' }
    ],
    articleResources: [
      { type: 'article', url: 'https://www.geeksforgeeks.org/process-management-in-operating-system/', title: 'Process Management in OS' }
    ]
  },
  'Threads & Concurrency': {
    videoResources: [
      { type: 'video', url: 'https://www.youtube.com/watch?v=LOfGJcVnvAk', title: 'Threads and Concurrency' },
      { type: 'video', url: 'https://www.youtube.com/watch?v=iKtvNJQoCNw', title: 'Threads vs Processes' }
    ],
    articleResources: [
      { type: 'article', url: 'https://www.geeksforgeeks.org/multithreading-in-operating-system/', title: 'Multithreading in OS' }
    ]
  },
  'CPU Scheduling Algorithms': {
    videoResources: [
      { type: 'video', url: 'https://www.youtube.com/watch?v=Jkmy2YLUbUY', title: 'CPU Scheduling Algorithms' },
      { type: 'video', url: 'https://www.youtube.com/watch?v=EWkQl0n0w5M', title: 'CPU Scheduling Examples' }
    ],
    articleResources: [
      { type: 'article', url: 'https://www.geeksforgeeks.org/cpu-scheduling-in-operating-systems/', title: 'CPU Scheduling in OS' }
    ]
  },
  'Memory Management (Paging, Segmentation)': {
    videoResources: [
      { type: 'video', url: 'https://www.youtube.com/watch?v=qlH4-oHnBb8', title: 'Memory Management in Operating Systems' },
      { type: 'video', url: 'https://www.youtube.com/watch?v=pJ6qrCB8pDw', title: 'Paging in Operating Systems' }
    ],
    articleResources: [
      { type: 'article', url: 'https://www.tutorialspoint.com/operating_system/os_memory_management.htm', title: 'OS Memory Management' }
    ]
  },
  'Virtual Memory': {
    videoResources: [
      { type: 'video', url: 'https://www.youtube.com/watch?v=qlH4-oHnBb8', title: 'Virtual Memory in Operating Systems' },
      { type: 'video', url: 'https://www.youtube.com/watch?v=2quKyPnUShQ', title: 'Virtual Memory Explained' }
    ],
    articleResources: [
      { type: 'article', url: 'https://www.geeksforgeeks.org/virtual-memory-in-operating-system/', title: 'Virtual Memory in OS' }
    ]
  },
  'File Systems': {
    videoResources: [
      { type: 'video', url: 'https://www.youtube.com/watch?v=KN8YgJnShPM', title: 'File Systems in Operating System' },
      { type: 'video', url: 'https://www.youtube.com/watch?v=HbgzrKJvDRw', title: 'Different Types of File Systems' }
    ],
    articleResources: [
      { type: 'article', url: 'https://www.tutorialspoint.com/operating_system/os_file_system.htm', title: 'File Systems in OS' }
    ]
  },
  'I/O Management': {
    videoResources: [
      { type: 'video', url: 'https://www.youtube.com/watch?v=F18RiREDkwE', title: 'I/O Management in Operating Systems' },
      { type: 'video', url: 'https://www.youtube.com/watch?v=arLZVxpG1eo', title: 'I/O Hardware and Software' }
    ],
    articleResources: [
      { type: 'article', url: 'https://www.geeksforgeeks.org/input-output-management-in-operating-system/', title: 'I/O Management in OS' }
    ]
  }
};

// Quiz data
const quizData = {
  'React Fundamentals': {
    title: 'React Fundamentals',
    description: 'Test your knowledge of React basics',
    timeLimit: 20,
    questions: [
      {
        questionText: 'What is React?',
        questionType: 'multiple-choice',
        options: [
          { text: 'A JavaScript library for building user interfaces', isCorrect: true },
          { text: 'A programming language', isCorrect: false },
          { text: 'A database management system', isCorrect: false },
          { text: 'A server-side framework', isCorrect: false }
        ],
        points: 1
      },
      {
        questionText: 'What is JSX?',
        questionType: 'multiple-choice',
        options: [
          { text: 'A JavaScript extension for writing HTML-like syntax', isCorrect: false },
          { text: 'JavaScript XML', isCorrect: true },
          { text: 'A type of database', isCorrect: false },
          { text: 'A React component', isCorrect: false }
        ],
        points: 1
      },
      {
        questionText: 'What is the virtual DOM?',
        questionType: 'multiple-choice',
        options: [
          { text: 'A direct copy of the real DOM', isCorrect: false },
          { text: 'A lightweight JavaScript representation of the DOM', isCorrect: true },
          { text: 'A browser feature', isCorrect: false },
          { text: 'A type of React component', isCorrect: false }
        ],
        points: 1
      },
      {
        questionText: 'Which hook is used for side effects in functional components?',
        questionType: 'multiple-choice',
        options: [
          { text: 'useState', isCorrect: false },
          { text: 'useReducer', isCorrect: false },
          { text: 'useEffect', isCorrect: true },
          { text: 'useContext', isCorrect: false }
        ],
        points: 1
      }
    ]
  },
  'JavaScript ES6+': {
    title: 'JavaScript ES6+',
    description: 'Modern JavaScript features and usage',
    timeLimit: 25,
    questions: [
      {
        questionText: 'What is destructuring in JavaScript?',
        questionType: 'multiple-choice',
        options: [
          { text: 'Breaking down a website structure', isCorrect: false },
          { text: 'A way to extract values from objects and arrays', isCorrect: true },
          { text: 'A method to delete variables', isCorrect: false },
          { text: 'A way to convert objects to JSON', isCorrect: false }
        ],
        points: 1
      },
      {
        questionText: 'What does the spread operator (...) do?',
        questionType: 'multiple-choice',
        options: [
          { text: 'Creates a copy of an array or object', isCorrect: true },
          { text: 'Spreads errors across the application', isCorrect: false },
          { text: 'Creates a new function', isCorrect: false },
          { text: 'Implements inheritance in classes', isCorrect: false }
        ],
        points: 1
      }
    ]
  }  
};

// Courses and related data
const seedCourses = async (users) => {
  const instructorUser = users.find(user => user.role === 'instructor');
  const studentUser = users.find(user => user.role === 'student');

  // Syllabus data for courses
  const syllabusData = {
    'Web Development': {
      nodes: [
        { id: 'wd-1', data: { label: 'HTML Basics', description: 'Learn the fundamentals of HTML markup' } },
        { id: 'wd-2', data: { label: 'CSS Fundamentals', description: 'Style your web pages with CSS' } },
        { id: 'wd-3', data: { label: 'JavaScript Core', description: 'Make your pages interactive with JavaScript' } },
        { id: 'wd-4', data: { label: 'DOM Manipulation', description: 'Interact with page elements dynamically' } },
        { id: 'wd-5', data: { label: 'Frontend Framework (React/Vue/Angular)', description: 'Build scalable UIs with modern frameworks' } },
        { id: 'wd-6', data: { label: 'State Management', description: 'Manage application state effectively' } },
        { id: 'wd-7', data: { label: 'Node.js Backend', description: 'Server-side JavaScript development' } },
        { id: 'wd-8', data: { label: 'Express.js Framework', description: 'Build web APIs with Express' } },
        { id: 'wd-9', data: { label: 'Databases (SQL/NoSQL)', description: 'Store and retrieve data efficiently' } },
        { id: 'wd-10', data: { label: 'Authentication & Authorization', description: 'Secure your web applications' } },
      ],
      edges: [
        { source: 'wd-1', target: 'wd-2', data: { label: 'Next' } },
        { source: 'wd-2', target: 'wd-3', data: { label: 'Next' } },
        { source: 'wd-3', target: 'wd-4', data: { label: 'Next' } },
        { source: 'wd-4', target: 'wd-5', data: { label: 'Next' } },
        { source: 'wd-5', target: 'wd-6', data: { label: 'Next' } },
        { source: 'wd-3', target: 'wd-7', data: { label: 'Alternative' } },
        { source: 'wd-7', target: 'wd-8', data: { label: 'Next' } },
        { source: 'wd-8', target: 'wd-9', data: { label: 'Next' } },
        { source: 'wd-9', target: 'wd-10', data: { label: 'Next' } },
      ]
    },
    'Operating Systems': {
      nodes: [
        { id: 'os-1', data: { label: 'Introduction & History', description: 'Evolution of operating systems and basic concepts' } },
        { id: 'os-2', data: { label: 'Process Management', description: 'How OS manages and schedules processes' } },
        { id: 'os-3', data: { label: 'Threads & Concurrency', description: 'Multi-threaded programming and synchronization' } },
        { id: 'os-4', data: { label: 'CPU Scheduling Algorithms', description: 'Different approaches to CPU scheduling' } },
        { id: 'os-5', data: { label: 'Memory Management (Paging, Segmentation)', description: 'How memory is allocated and managed' } },
        { id: 'os-6', data: { label: 'Virtual Memory', description: 'Extending physical memory using disk space' } },
        { id: 'os-7', data: { label: 'File Systems', description: 'Organization and management of files' } },
        { id: 'os-8', data: { label: 'I/O Management', description: 'Handling input/output operations efficiently' } },
      ],
      edges: [
        { source: 'os-1', target: 'os-2', data: { label: 'Next' } },
        { source: 'os-2', target: 'os-3', data: { label: 'Next' } },
        { source: 'os-2', target: 'os-4', data: { label: 'Related' } },
        { source: 'os-3', target: 'os-4', data: { label: 'Next' } },
        { source: 'os-4', target: 'os-5', data: { label: 'Next' } },
        { source: 'os-5', target: 'os-6', data: { label: 'Next' } },
        { source: 'os-6', target: 'os-7', data: { label: 'Next' } },
        { source: 'os-7', target: 'os-8', data: { label: 'Next' } },
      ]
    }
  };

  // Create course topics with resources
  const createTopicsWithResources = (subject) => {
    const nodes = syllabusData[subject].nodes;
    return nodes.map((node, index) => {
      const topicName = node.data.label;
      const resources = [];
      
      // Add video resources
      if (resourceData[topicName] && resourceData[topicName].videoResources) {
        resourceData[topicName].videoResources.forEach(video => {
          resources.push({
            resourceId: uuidv4(),
            type: 'video',
            url: video.url,
            title: video.title,
            description: `Video resource for ${topicName}`,
            duration: Math.floor(Math.random() * 30) + 10 // Random duration between 10-40 minutes
          });
        });
      }
      
      // Add article resources
      if (resourceData[topicName] && resourceData[topicName].articleResources) {
        resourceData[topicName].articleResources.forEach(article => {
          resources.push({
            resourceId: uuidv4(),
            type: 'article',
            url: article.url,
            title: article.title,
            description: `Article resource for ${topicName}`,
            duration: Math.floor(Math.random() * 10) + 5 // Random duration between 5-15 minutes
          });
        });
      }
      
      return {
        topicId: node.id,
        name: topicName,
        description: node.data.description || `Learn about ${topicName}`,
        order: index + 1,
        resources: resources
      };
    });
  };

  // Create courses
  const courses = [
    {
      courseId: 'web-dev-101',
      owner: instructorUser._id,
      title: 'Web Development Fundamentals',
      subject: 'Web Development',
      description: 'Learn the basics of web development from HTML to full-stack applications',
      isPrivate: false,
      accessList: [
        {
          user: studentUser._id,
          accessLevel: 'view'
        }
      ],
      syllabus: syllabusData['Web Development'],
      topics: createTopicsWithResources('Web Development'),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      courseId: 'os-fundamentals',
      owner: instructorUser._id,
      title: 'Operating Systems Core Concepts',
      subject: 'Operating Systems',
      description: 'Understand how operating systems work under the hood',
      isPrivate: true,
      accessList: [],
      syllabus: syllabusData['Operating Systems'],
      topics: createTopicsWithResources('Operating Systems'),
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  const createdCourses = await Course.insertMany(courses);
  console.log(`${createdCourses.length} courses seeded`);

  // Update user with created courses
  await User.findByIdAndUpdate(instructorUser._id, {
    $push: { createdCourses: { $each: createdCourses.map(course => course._id) } }
  });

  await User.findByIdAndUpdate(studentUser._id, {
    $push: { enrolledCourses: createdCourses[0]._id }
  });

  return createdCourses;
};

// Create assignments for courses
const seedAssignments = async (courses) => {
  const webDevCourse = courses.find(course => course.subject === 'Web Development');
  const osCourse = courses.find(course => course.subject === 'Operating Systems');

  const assignments = [
    {
      courseId: webDevCourse._id,
      title: 'HTML Portfolio Page',
      description: 'Create a personal portfolio page using HTML and CSS',
      instructions: 'Build a portfolio page with at least 3 sections: About Me, Projects, and Contact. Use proper semantic HTML elements and CSS styling.',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      points: 100,
      attachments: []
    },
    {
      courseId: webDevCourse._id,
      title: 'JavaScript Interactive Quiz',
      description: 'Create an interactive quiz using JavaScript',
      instructions: 'Build a multiple-choice quiz on any topic with at least 5 questions. The quiz should provide immediate feedback and calculate the final score.',
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      points: 150,
      attachments: []
    },
    {
      courseId: osCourse._id,
      title: 'Process Scheduler Simulation',
      description: 'Create a simulation of a process scheduler',
      instructions: 'Implement a simple process scheduler that demonstrates at least two scheduling algorithms (e.g., FCFS, SJF, Round Robin).',
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
      points: 200,
      attachments: []
    }
  ];

  const createdAssignments = await Assignment.insertMany(assignments);
  console.log(`${createdAssignments.length} assignments seeded`);
  return createdAssignments;
};

// Create quizzes for courses
const seedQuizzes = async (courses) => {
  const webDevCourse = courses.find(course => course.subject === 'Web Development');
  
  const quizzes = [
    {
      courseId: webDevCourse._id,
      title: quizData['React Fundamentals'].title,
      description: quizData['React Fundamentals'].description,
      timeLimit: quizData['React Fundamentals'].timeLimit,
      passingScore: 70,
      questions: quizData['React Fundamentals'].questions
    },
    {
      courseId: webDevCourse._id,
      title: quizData['JavaScript ES6+'].title,
      description: quizData['JavaScript ES6+'].description,
      timeLimit: quizData['JavaScript ES6+'].timeLimit,
      passingScore: 60,
      questions: quizData['JavaScript ES6+'].questions
    }
  ];

  const createdQuizzes = await Quiz.insertMany(quizzes);
  console.log(`${createdQuizzes.length} quizzes seeded`);
  return createdQuizzes;
};

// Create notes for users
const seedNotes = async (users, courses) => {
  const studentUser = users.find(user => user.role === 'student');
  const webDevCourse = courses.find(course => course.subject === 'Web Development');

  const notes = [
    {
      courseId: webDevCourse._id,
      topicId: 'wd-1',
      userId: studentUser._id,
      title: 'HTML Tags to Remember',
      content: `# Important HTML Tags
- \`<div>\` - Container for other elements
- \`<span>\` - Inline container
- \`<h1>\` through \`<h6>\` - Headings
- \`<p>\` - Paragraph
- \`<a>\` - Anchor/link
- \`<ul>\`, \`<ol>\`, \`<li>\` - Lists
- \`<table>\`, \`<tr>\`, \`<td>\` - Tables
- \`<form>\`, \`<input>\`, \`<button>\` - Forms`,
      tags: ['html', 'tags', 'basics']
    },
    {
      courseId: webDevCourse._id,
      topicId: 'wd-2',
      userId: studentUser._id,
      title: 'CSS Selectors Cheat Sheet',
      content: `# CSS Selectors
- Element selector: \`div { }\`
- Class selector: \`.class-name { }\`
- ID selector: \`#id-name { }\`
- Descendant selector: \`div p { }\`
- Child selector: \`div > p { }\`
- Adjacent sibling: \`h1 + p { }\`
- Attribute selector: \`[type="text"] { }\`
- Pseudo-classes: \`:hover\`, \`:focus\`, \`:first-child\``,
      tags: ['css', 'selectors', 'styling']
    }
  ];

  const createdNotes = await Note.insertMany(notes);
  console.log(`${createdNotes.length} notes seeded`);
  return createdNotes;
};

// Create user progress
const seedUserProgress = async (users, courses, assignments, quizzes) => {
    const studentUser = users.find(user => user.role === 'student');
    const webDevCourse = courses.find(course => course.subject === 'Web Development');
    const webDevAssignment = assignments.find(assignment => assignment.courseId.toString() === webDevCourse._id.toString());
    const reactQuiz = quizzes.find(quiz => quiz.title === 'React Fundamentals');
  
    const userProgress = {
      userId: studentUser._id,
      courseProgress: [
        {
          courseId: webDevCourse._id,
          completedTopics: ['wd-1', 'wd-2'],
          currentTopic: 'wd-3',
          completedAssignments: [
            {
              assignmentId: webDevAssignment._id,
              submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
              grade: 85,
              feedback: 'Good work on the HTML structure. Could improve CSS styling.'
            }
          ],
          completedQuizzes: [
            {
              quizId: reactQuiz._id,
              score: 75,
              completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
              attempts: 1
            }
          ],
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
          lastAccessed: new Date(),
          points: 250
        }
      ],
      achievements: [
        {
          name: 'First Assignment Completed',
          earnedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          description: 'Completed your first assignment!'
        },
        {
          name: 'Quiz Master',
          earnedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          description: 'Scored over 70% on a quiz!'
        }
      ],
      totalPoints: 250
    };
  
    const createdUserProgress = await UserProgress.create(userProgress);
    console.log('User progress seeded');
    return createdUserProgress;
  };
  
  // Create submissions for assignments
  const seedSubmissions = async (users, assignments) => {
    const studentUser = users.find(user => user.role === 'student');
    const htmlAssignment = assignments.find(assignment => assignment.title === 'HTML Portfolio Page');
  
    const submissions = [
      {
        assignmentId: htmlAssignment._id,
        userId: studentUser._id,
        content: `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>My Portfolio</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
              header { background-color: #333; color: white; padding: 20px; text-align: center; }
              section { padding: 20px; margin: 20px; }
              .project { border: 1px solid #ddd; padding: 15px; margin-bottom: 15px; }
              footer { background-color: #333; color: white; text-align: center; padding: 10px; }
            </style>
          </head>
          <body>
            <header>
              <h1>John's Portfolio</h1>
              <p>Web Developer & Designer</p>
            </header>
            
            <section id="about">
              <h2>About Me</h2>
              <p>I am a passionate web developer learning HTML, CSS, and JavaScript.</p>
            </section>
            
            <section id="projects">
              <h2>My Projects</h2>
              <div class="project">
                <h3>Personal Blog</h3>
                <p>A responsive blog website built with HTML and CSS.</p>
              </div>
              <div class="project">
                <h3>Weather App</h3>
                <p>A simple weather application using JavaScript.</p>
              </div>
            </section>
            
            <section id="contact">
              <h2>Contact Me</h2>
              <p>Email: john@example.com</p>
              <p>LinkedIn: linkedin.com/in/johndoe</p>
            </section>
            
            <footer>
              <p>&copy; 2025 John Doe</p>
            </footer>
          </body>
          </html>
        `,
        attachments: [],
        status: 'graded',
        grade: 85,
        feedback: 'Good work on the HTML structure. Could improve CSS styling.',
        submittedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
        gradedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      }
    ];
  
    const createdSubmissions = await Submission.insertMany(submissions);
    console.log(`${createdSubmissions.length} submissions seeded`);
    return createdSubmissions;
  };
  
  // Run the seeding
  const seedDatabase = async () => {
    try {
      await clearCollections();
      const users = await seedUsers();
      const courses = await seedCourses(users);
      const assignments = await seedAssignments(courses);
      const quizzes = await seedQuizzes(courses);
      const notes = await seedNotes(users, courses);
      const userProgress = await seedUserProgress(users, courses, assignments, quizzes);
      const submissions = await seedSubmissions(users, assignments);
  
      console.log('Database seeding completed successfully');
      mongoose.connection.close();
    } catch (error) {
      console.error('Error seeding database:', error);
      mongoose.connection.close();
      process.exit(1);
    }
  };
  
  seedDatabase();