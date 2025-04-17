// src/pages/LearningDashboard/index.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

// Sample course modules data - replace with your actual data structure
const courseModules = [
  {
    id: 1,
    title: "Introduction to React",
    videos: [
      { 
        id: 101, 
        title: "React Basics", 
        youtubeId: "w7ejDZ8SWv8", 
        duration: "30:00",
        points: 10
      },
      { 
        id: 102, 
        title: "Component Lifecycle", 
        youtubeId: "4ORZ1GmjaMc", 
        duration: "25:00",
        points: 10
      }
    ],
    quiz: { id: 201, title: "React Fundamentals Quiz", points: 20 },
    assignment: { id: 301, title: "Build a Simple React App", points: 30 }
  },
  {
    id: 2,
    title: "State Management in React",
    videos: [
      { 
        id: 103, 
        title: "useState Hook", 
        youtubeId: "O6P86uwfdR0", 
        duration: "22:00",
        points: 10
      },
      { 
        id: 104, 
        title: "useContext Hook", 
        youtubeId: "5LrDIWkK_Bc", 
        duration: "18:00",
        points: 10
      }
    ],
    quiz: { id: 202, title: "State Management Quiz", points: 20 },
    assignment: { id: 302, title: "Create a Todo App with Context", points: 30 }
  }
];

// YouTube video player component with progress tracking
const VideoPlayer = ({ video, onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);
  const playerRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    // Load YouTube IFrame API
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    // Initialize player when API is ready
    window.onYouTubeIframeAPIReady = () => {
      playerRef.current = new window.YT.Player(`player-${video.id}`, {
        height: '250',
        width: '100%',
        videoId: video.youtubeId,
        events: {
          onStateChange: onPlayerStateChange
        }
      });
    };

    // Load progress from localStorage
    const savedProgress = localStorage.getItem(`video-progress-${video.id}`);
    if (savedProgress) {
      setProgress(parseFloat(savedProgress));
    }

    const videoCompleted = localStorage.getItem(`video-completed-${video.id}`);
    if (videoCompleted === 'true') {
      setCompleted(true);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (window.YT && playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [video.id, video.youtubeId]);

  const onPlayerStateChange = (event) => {
    // YT.PlayerState.PLAYING = 1
    if (event.data === 1) {
      // Track progress while playing
      intervalRef.current = setInterval(() => {
        if (playerRef.current) {
          const currentTime = playerRef.current.getCurrentTime();
          const duration = playerRef.current.getDuration();
          const calculatedProgress = (currentTime / duration) * 100;
          
          setProgress(calculatedProgress);
          localStorage.setItem(`video-progress-${video.id}`, calculatedProgress);
          
          // Consider video completed at 90% progress
          if (calculatedProgress >= 90 && !completed) {
            setCompleted(true);
            localStorage.setItem(`video-completed-${video.id}`, 'true');
            onComplete(video.id, video.points);
            clearInterval(intervalRef.current);
          }
        }
      }, 1000);
    } else {
      // Not playing (paused, ended, etc.)
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
  };

  return (
    <div className="mb-4 border rounded-lg p-3 bg-white shadow-sm">
      <h3 className="text-lg font-medium mb-2">{video.title}</h3>
      <div className="aspect-video rounded overflow-hidden">
        <div id={`player-${video.id}`} className="w-full"></div>
      </div>
      <div className="mt-3">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-2 text-sm text-gray-600">
          <span>Duration: {video.duration}</span>
          <span>{completed ? '✅ Completed' : 'In Progress'}</span>
        </div>
      </div>
    </div>
  );
};

// Draggable Doubts Modal
const DoubtsModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const modalRef = useRef(null);

  useEffect(() => {
    // Load saved notes and position from localStorage
    const savedNotes = localStorage.getItem('learningNotes');
    if (savedNotes) setNotes(savedNotes);
    
    const savedPosition = localStorage.getItem('notesModalPosition');
    if (savedPosition) {
      try {
        setPosition(JSON.parse(savedPosition));
      } catch (e) {
        console.error("Error parsing saved position", e);
      }
    }
  }, []);

  const handleSaveNotes = () => {
    localStorage.setItem('learningNotes', notes);
  };

  const handleMouseDown = (e) => {
    if (modalRef.current) {
      const rect = modalRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const newPosition = {
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      };
      setPosition(newPosition);
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      localStorage.setItem('notesModalPosition', JSON.stringify(position));
    }
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <>
      <button 
        className="fixed bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg z-10 hover:bg-blue-700"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? '✕' : '❓'}
      </button>
      
      {isOpen && (
        <div 
          ref={modalRef}
          className="fixed bg-white p-4 rounded-lg shadow-lg z-20 w-72 border border-gray-300"
          style={{ 
            left: `${position.x}px`, 
            top: `${position.y}px`,
            cursor: isDragging ? 'grabbing' : 'grab'
          }}
        >
          <div 
            className="bg-gray-100 p-2 mb-3 cursor-grab rounded flex justify-between items-center"
            onMouseDown={handleMouseDown}
          >
            <span className="font-medium">My Doubts & Notes</span>
            <span className="text-xs text-gray-500">Drag to move</span>
          </div>
          <textarea 
            className="w-full p-2 border rounded h-32 mb-3"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Write your doubts and notes here..."
          ></textarea>
          <div className="flex justify-end">
            <button 
              className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
              onClick={handleSaveNotes}
            >
              Save Notes
            </button>
          </div>
        </div>
      )}
    </>
  );
};

const LearningDashboard = () => {
  const [completedVideos, setCompletedVideos] = useState([]);
  const [completedQuizzes, setCompletedQuizzes] = useState([]);
  const [completedAssignments, setCompletedAssignments] = useState([]);
  const [totalScore, setTotalScore] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(1);

  // Load progress from localStorage on component mount
  useEffect(() => {
    const savedVideos = localStorage.getItem('completedVideos');
    const savedQuizzes = localStorage.getItem('completedQuizzes');
    const savedAssignments = localStorage.getItem('completedAssignments');
    const savedScore = localStorage.getItem('totalScore');
    
    if (savedVideos) {
      try {
        setCompletedVideos(JSON.parse(savedVideos));
      } catch (e) {
        console.error("Error parsing completed videos", e);
      }
    }
    
    if (savedQuizzes) {
      try {
        setCompletedQuizzes(JSON.parse(savedQuizzes));
      } catch (e) {
        console.error("Error parsing completed quizzes", e);
      }
    }
    
    if (savedAssignments) {
      try {
        setCompletedAssignments(JSON.parse(savedAssignments));
      } catch (e) {
        console.error("Error parsing completed assignments", e);
      }
    }
    
    if (savedScore) {
      setTotalScore(parseInt(savedScore) || 0);
    }
  }, []);

  // Update localStorage and calculate level whenever progress changes
  useEffect(() => {
    // Calculate level based on score (50 points per level)
    const newLevel = Math.floor(totalScore / 50) + 1;
    setCurrentLevel(newLevel);
    
    // Save progress to localStorage
    localStorage.setItem('completedVideos', JSON.stringify(completedVideos));
    localStorage.setItem('completedQuizzes', JSON.stringify(completedQuizzes));
    localStorage.setItem('completedAssignments', JSON.stringify(completedAssignments));
    localStorage.setItem('totalScore', totalScore.toString());
  }, [completedVideos, completedQuizzes, completedAssignments, totalScore]);

  const handleVideoComplete = (videoId, points) => {
    if (!completedVideos.includes(videoId)) {
      setCompletedVideos([...completedVideos, videoId]);
      setTotalScore(totalScore + points);
    }
  };

  const handleQuizComplete = (quizId, points) => {
    if (!completedQuizzes.includes(quizId)) {
      setCompletedQuizzes([...completedQuizzes, quizId]);
      setTotalScore(totalScore + points);
    }
  };

  const handleAssignmentComplete = (assignmentId, points) => {
    if (!completedAssignments.includes(assignmentId)) {
      setCompletedAssignments([...completedAssignments, assignmentId]);
      setTotalScore(totalScore + points);
    }
  };

  // For demo purposes - simulate quiz/assignment completion
  const simulateCompletion = (type, id, points) => {
    if (type === 'quiz') {
      handleQuizComplete(id, points);
    } else if (type === 'assignment') {
      handleAssignmentComplete(id, points);
    }
  };

  // Calculate module completion percentage
  const calculateModuleProgress = (moduleId) => {
    const module = courseModules.find(m => m.id === moduleId);
    if (!module) return 0;
    
    const totalItems = module.videos.length + 2; // +2 for quiz and assignment
    let completedItems = 0;
    
    // Count completed videos in this module
    module.videos.forEach(video => {
      if (completedVideos.includes(video.id)) completedItems++;
    });
    
    // Check quiz and assignment completion
    if (completedQuizzes.includes(module.quiz.id)) completedItems++;
    if (completedAssignments.includes(module.assignment.id)) completedItems++;
    
    return Math.round((completedItems / totalItems) * 100);
  };

  return (
    <div>
      {/* Gamification Status Bar */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-500 text-white p-4 rounded-lg mb-6 shadow-lg">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="bg-yellow-300 text-gray-800 rounded-full h-12 w-12 flex items-center justify-center text-xl font-bold mr-4">
              {currentLevel}
            </div>
            <div>
              <h2 className="text-lg font-semibold">Level {currentLevel}</h2>
              <p className="text-sm">Keep learning to level up!</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{totalScore} Points</p>
            <p className="text-sm">Next level: {currentLevel * 50} points</p>
          </div>
        </div>
        {/* Progress bar to next level */}
        <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
          <div 
            className="bg-yellow-300 h-2 rounded-full" 
            style={{ width: `${(totalScore % 50) / 50 * 100}%` }}
          ></div>
        </div>
      </div>

      <h1 className="text-xl font-bold mb-4">Your Learning Path</h1>
      
      {/* Course Modules */}
      {courseModules.map(module => (
        <div key={module.id} className="mb-8 bg-gray-50 p-4 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">{module.title}</h2>
            <div className="flex items-center">
              <div className="mr-3">
                <span className="font-medium">{calculateModuleProgress(module.id)}% Complete</span>
                <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${calculateModuleProgress(module.id)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Videos */}
          <div className="mb-4">
            <h3 className="text-md font-medium mb-2">Videos</h3>
            {module.videos.map(video => (
              <VideoPlayer 
                key={video.id} 
                video={video} 
                onComplete={handleVideoComplete}
              />
            ))}
          </div>
          
          {/* Quiz & Assignment Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-3 bg-white shadow-sm">
              <h3 className="text-md font-medium mb-2">Quiz</h3>
              <div className="flex justify-between items-center">
                <p>{module.quiz.title}</p>
                {completedQuizzes.includes(module.quiz.id) ? (
                  <span className="text-green-500 font-medium">✅ Completed</span>
                ) : (
                  <div className="flex space-x-2">
                    <Link 
                      to={`/dashboard/quizzes?id=${module.quiz.id}`}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm"
                    >
                      Take Quiz
                    </Link>
                    {/* Demo button for simulation */}
                    <button 
                      className="bg-gray-200 text-gray-700 px-2 py-1 rounded hover:bg-gray-300 text-xs"
                      onClick={() => simulateCompletion('quiz', module.quiz.id, module.quiz.points)}
                    >
                      (Demo: Complete)
                    </button>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-2">Worth {module.quiz.points} points</p>
            </div>
            
            <div className="border rounded-lg p-3 bg-white shadow-sm">
              <h3 className="text-md font-medium mb-2">Assignment</h3>
              <div className="flex justify-between items-center">
                <p>{module.assignment.title}</p>
                {completedAssignments.includes(module.assignment.id) ? (
                  <span className="text-green-500 font-medium">✅ Completed</span>
                ) : (
                  <div className="flex space-x-2">
                    <Link 
                      to={`/dashboard/assignments?id=${module.assignment.id}`}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm"
                    >
                      View Assignment
                    </Link>
                    {/* Demo button for simulation */}
                    <button 
                      className="bg-gray-200 text-gray-700 px-2 py-1 rounded hover:bg-gray-300 text-xs"
                      onClick={() => simulateCompletion('assignment', module.assignment.id, module.assignment.points)}
                    >
                      (Demo: Complete)
                    </button>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-2">Worth {module.assignment.points} points</p>
            </div>
          </div>
        </div>
      ))}
      
      {/* Draggable Doubts Modal */}
      <DoubtsModal />
    </div>
  );
};

export default LearningDashboard;