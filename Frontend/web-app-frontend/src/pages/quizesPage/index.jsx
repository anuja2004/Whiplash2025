// src/pages/quizesPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

// This would be used for real API calls in the future
const api = axios.create({
  baseURL: 'https://api.example.com',
});

// Dummy topics with their respective quizzes
const dummyTopics = [
  { id: 1, title: 'React Fundamentals', description: 'Test your knowledge of React basics', questionsCount: 30, timeLimit: 20 },
  { id: 2, title: 'JavaScript ES6+', description: 'Modern JavaScript features and usage', questionsCount: 30, timeLimit: 25 },
  { id: 3, title: 'Data Structures', description: 'Common data structures and operations', questionsCount: 30, timeLimit: 30 },
  { id: 4, title: 'Algorithms', description: 'Popular algorithms and their applications', questionsCount: 30, timeLimit: 35 },
  { id: 5, title: 'Web Development', description: 'HTML, CSS and modern web technologies', questionsCount: 30, timeLimit: 25 },
];

// Dummy questions for React Fundamentals
const dummyQuizQuestions = {
  1: [
    {
      id: 1,
      question: 'What is React?',
      options: [
        'A JavaScript library for building user interfaces',
        'A programming language',
        'A database management system',
        'A server-side framework'
      ],
      correctAnswer: 0
    },
    {
      id: 2,
      question: 'What is JSX?',
      options: [
        'A JavaScript extension for writing HTML-like syntax',
        'JavaScript XML',
        'A type of database',
        'A React component'
      ],
      correctAnswer: 1
    },
    {
      id: 3,
      question: 'What is the virtual DOM?',
      options: [
        'A direct copy of the real DOM',
        'A lightweight JavaScript representation of the DOM',
        'A browser feature',
        'A type of React component'
      ],
      correctAnswer: 1
    },
    {
      id: 4,
      question: 'Which hook is used for side effects in functional components?',
      options: [
        'useState',
        'useReducer',
        'useEffect',
        'useContext'
      ],
      correctAnswer: 2
    },
    {
      id: 5,
      question: 'What does the useState hook return?',
      options: [
        'A state object',
        'A setter function',
        'An array with the state value and a setter function',
        'A boolean value'
      ],
      correctAnswer: 2
    },
    {
      id: 6,
      question: 'Which hook is used for accessing context in functional components?',
      options: ['useContext', 'useRef', 'useEffect', 'useState'],
      correctAnswer: 0
    },
    {
      id: 7,
      question: 'Which method is used to pass data from parent to child components?',
      options: ['props', 'state', 'setState', 'context'],
      correctAnswer: 0
    },
    {
      id: 8,
      question: 'Which hook is used to optimize performance and memoize values?',
      options: ['useMemo', 'useState', 'useCallback', 'useEffect'],
      correctAnswer: 0
    },
    {
      id: 9,
      question: 'What does React.StrictMode help with?',
      options: [
        'Optimize React code for production',
        'Find potential problems in an application',
        'Avoid using hooks',
        'Reduce bundle size'
      ],
      correctAnswer: 1
    },
    {
      id: 10,
      question: 'What is a controlled component in React?',
      options: [
        'A component with internal state',
        'A component that does not accept props',
        'A component whose form data is handled by React state',
        'A component with lifecycle methods'
      ],
      correctAnswer: 2
    },
    {
      id: 11,
      question: 'What does the key prop do in a list?',
      options: [
        'Uniquely identifies elements for performance',
        'Styles each element',
        'Connects elements to the backend',
        'Renders forms'
      ],
      correctAnswer: 0
    },
    {
      id: 12,
      question: 'How do you lift state up in React?',
      options: [
        'Move the state to the nearest common ancestor',
        'Use props drilling',
        'Use Redux',
        'Use Context API'
      ],
      correctAnswer: 0
    },
    {
      id: 13,
      question: 'What is the default behavior of useEffect?',
      options: [
        'Runs after every render',
        'Runs before rendering',
        'Runs only on initial render',
        'Runs when state is initialized'
      ],
      correctAnswer: 0
    },
    {
      id: 14,
      question: 'Which hook is used for accessing the previous props or state?',
      options: ['useRef', 'useMemo', 'useCallback', 'useReducer'],
      correctAnswer: 0
    },
    {
      id: 15,
      question: 'What is a React fragment?',
      options: [
        'A comment block in JSX',
        'A component wrapper that doesn’t add extra nodes to DOM',
        'A lifecycle method',
        'A custom hook'
      ],
      correctAnswer: 1
    },
    {
      id: 16,
      question: 'What is the use of useCallback?',
      options: [
        'To memoize callback functions',
        'To create global variables',
        'To access lifecycle',
        'To fetch API data'
      ],
      correctAnswer: 0
    },
    {
      id: 17,
      question: 'Which hook lets you persist values across renders without causing re-renders?',
      options: ['useRef', 'useState', 'useEffect', 'useMemo'],
      correctAnswer: 0
    },
    {
      id: 18,
      question: 'What does setState() do in React?',
      options: [
        'Resets the entire application',
        'Updates the state and re-renders the component',
        'Deletes the state',
        'Fetches data'
      ],
      correctAnswer: 1
    },
    {
      id: 19,
      question: 'What is prop drilling?',
      options: [
        'Passing props down through many levels of components',
        'Creating reusable components',
        'Sharing state between components',
        'Initializing state'
      ],
      correctAnswer: 0
    },
    {
      id: 20,
      question: 'Which of these can cause unnecessary re-renders?',
      options: ['Not memoizing components', 'Proper use of keys', 'Using props', 'Static imports'],
      correctAnswer: 0
    },
    {
      id: 21,
      question: 'Which of the following is NOT a hook?',
      options: ['useData', 'useEffect', 'useContext', 'useState'],
      correctAnswer: 0
    },
    {
      id: 22,
      question: 'Which lifecycle is useEffect similar to?',
      options: ['componentDidMount', 'shouldComponentUpdate', 'render', 'constructor'],
      correctAnswer: 0
    },
    {
      id: 23,
      question: 'Can hooks be used inside class components?',
      options: ['No', 'Yes', 'Only useEffect', 'Only in React Native'],
      correctAnswer: 0
    },
    {
      id: 24,
      question: 'How do you update a value in state without mutation?',
      options: ['Use spread operator', 'Assign directly', 'Use global variable', 'Call return'],
      correctAnswer: 0
    },
    {
      id: 25,
      question: 'Which tool is used for debugging React components?',
      options: ['React Developer Tools', 'Redux Logger', 'Node Inspector', 'Chrome DevTools only'],
      correctAnswer: 0
    },
    {
      id: 26,
      question: 'What is lazy loading in React?',
      options: [
        'Loading components only when needed',
        'Loading state after render',
        'Delaying useEffect',
        'Suspending rendering'
      ],
      correctAnswer: 0
    },
    {
      id: 27,
      question: 'What does Suspense help with in React?',
      options: [
        'Handling async component loading',
        'State management',
        'Server communication',
        'Reducing re-renders'
      ],
      correctAnswer: 0
    },
    {
      id: 28,
      question: 'How do you conditionally render components?',
      options: ['Using ternary or &&', 'Using if statement directly', 'Using switch inside return', 'You cannot'],
      correctAnswer: 0
    },
    {
      id: 29,
      question: 'Which file format is typically used to define components?',
      options: ['.jsx', '.txt', '.php', '.json'],
      correctAnswer: 0
    },
    {
      id: 30,
      question: 'Which of the following is true about state?',
      options: [
        'State updates re-render the component',
        'State can only be used in class components',
        'State is global by default',
        'State must be passed as props'
      ],
      correctAnswer: 0
    }
  ]
};


// Would use these functions in real implementation
const fetchTopics = async () => {
  try {
    const response = await api.get('/quiz/topics');
    return response.data;
  } catch (error) {
    console.error('Error fetching topics:', error);
    return [];
  }
};

const fetchQuizByTopicId = async (topicId) => {
  try {
    const response = await api.get(`/quiz/topics/${topicId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching quiz for topic ${topicId}:`, error);
    return null;
  }
};

// Topic Selection Component
const TopicSelection = ({ topics, onSelectTopic }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {topics.map((topic) => (
        <div 
          key={topic.id} 
          className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer border border-gray-200"
          onClick={() => onSelectTopic(topic.id)}
        >
          <h3 className="font-bold text-lg mb-2">{topic.title}</h3>
          <p className="text-gray-600 mb-3">{topic.description}</p>
          <div className="flex justify-between text-sm">
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {topic.questionsCount} Questions
            </span>
            <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded">
              {topic.timeLimit} Minutes
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

// Quiz Component
const Quiz = ({ topicId, questions, timeLimit, onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(timeLimit * 60); // Convert to seconds
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (isFinished) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          setIsFinished(true);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isFinished]);

  const handleSelectAnswer = (questionId, answerIndex) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: answerIndex
    });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleFinish = () => {
    setIsFinished(true);
    
    // Calculate score
    let score = 0;
    questions.forEach((question) => {
      if (selectedAnswers[question.id] === question.correctAnswer) {
        score++;
      }
    });
    
    onComplete({
      topicId,
      score,
      totalQuestions: questions.length,
      timeSpent: timeLimit * 60 - timeLeft,
      userAnswers: selectedAnswers, // Added to track user answers
      questions: questions // Pass questions for analysis
    });
  };

  // Format time left as MM:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage
  const progressPercentage = (Object.keys(selectedAnswers).length / questions.length) * 100;

  if (isFinished) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold mb-4">Time's up!</h2>
        <p className="mb-4">Your quiz has been submitted.</p>
        <button 
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          onClick={() => onComplete(null)}
        >
          Return to Topics
        </button>
      </div>
    );
  }

  const question = questions[currentQuestion];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="text-xl font-bold">Question {currentQuestion + 1} of {questions.length}</div>
        <div className="bg-red-100 text-red-800 px-4 py-2 rounded-lg font-bold">
          Time: {formatTime(timeLeft)}
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
        <div 
          className="bg-green-600 h-2.5 rounded-full" 
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>

      {/* Question */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">{question.question}</h3>
        <div className="space-y-3">
          {question.options.map((option, index) => (
            <div 
              key={index}
              className={`p-3 border rounded-lg cursor-pointer transition-all ${
                selectedAnswers[question.id] === index 
                  ? 'bg-blue-100 border-blue-500' 
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => handleSelectAnswer(question.id, index)}
            >
              <div className="flex items-center">
                <div className={`w-6 h-6 flex items-center justify-center rounded-full mr-3 ${
                  selectedAnswers[question.id] === index 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200'
                }`}>
                  {['A', 'B', 'C', 'D'][index]}
                </div>
                <div>{option}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between mt-6">
        <button
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
          className={`px-4 py-2 rounded ${
            currentQuestion === 0 
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
              : 'bg-gray-800 text-white hover:bg-gray-700'
          }`}
        >
          Previous
        </button>
        
        {currentQuestion < questions.length - 1 ? (
          <button
            onClick={handleNext}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleFinish}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Submit Quiz
          </button>
        )}
      </div>
    </div>
  );
};

// Results Component with Enhanced Analysis
const QuizResults = ({ results, onReturnToTopics }) => {
  const { score, totalQuestions, timeSpent, userAnswers, questions, topicId } = results;
  const percentage = Math.round((score / totalQuestions) * 100);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [activeTab, setActiveTab] = useState('summary');
  
  // Get topic information
  const topic = dummyTopics.find(t => t.id === topicId);
  
  // Determine grade based on percentage
  let grade, gradeColor;
  if (percentage >= 90) {
    grade = 'A';
    gradeColor = 'text-green-600';
  } else if (percentage >= 80) {
    grade = 'B';
    gradeColor = 'text-blue-600';
  } else if (percentage >= 70) {
    grade = 'C';
    gradeColor = 'text-yellow-600';
  } else if (percentage >= 60) {
    grade = 'D';
    gradeColor = 'text-orange-600';
  } else {
    grade = 'F';
    gradeColor = 'text-red-600';
  }

  // Format time spent
  const formatTimeSpent = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes} min ${remainingSeconds} sec`;
  };

  // Calculate stats for analysis
  const correctAnswers = questions.filter(q => userAnswers[q.id] === q.correctAnswer).length;
  const incorrectAnswers = questions.filter(q => 
    userAnswers[q.id] !== undefined && userAnswers[q.id] !== q.correctAnswer
  ).length;
  const unanswered = questions.filter(q => userAnswers[q.id] === undefined).length;

  // Group questions by correctness for analysis
  const incorrectQuestions = questions.filter(q => 
    userAnswers[q.id] !== undefined && userAnswers[q.id] !== q.correctAnswer
  );
  
  // Calculate knowledge gaps by analyzing incorrect answers
  const knowledgeGaps = {};
  
  // For this simple example, we'll just track how many questions were wrong
  if (topicId === 1) { // React Fundamentals
    incorrectQuestions.forEach(q => {
      if (q.id === 1 || q.id === 2) knowledgeGaps['React Basics'] = (knowledgeGaps['React Basics'] || 0) + 1;
      if (q.id === 3) knowledgeGaps['Virtual DOM'] = (knowledgeGaps['Virtual DOM'] || 0) + 1;
      if (q.id === 4 || q.id === 5) knowledgeGaps['React Hooks'] = (knowledgeGaps['React Hooks'] || 0) + 1;
    });
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-6">{topic?.title} Quiz Results</h2>
      
      {/* Tabs for Summary and Analysis */}
      <div className="flex border-b mb-6">
        <button 
          className={`px-4 py-2 font-medium ${activeTab === 'summary' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('summary')}
        >
          Summary
        </button>
        <button 
          className={`px-4 py-2 font-medium ${activeTab === 'analysis' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('analysis')}
        >
          Detailed Analysis
        </button>
      </div>

      {activeTab === 'summary' && (
        <>
          <div className="flex justify-center mb-8">
            <div className="relative">
              <svg className="w-32 h-32">
                <circle 
                  className="text-gray-200" 
                  strokeWidth="8" 
                  stroke="currentColor" 
                  fill="transparent" 
                  r="58" 
                  cx="64" 
                  cy="64" 
                />
                <circle 
                  className="text-blue-600" 
                  strokeWidth="8" 
                  stroke="currentColor" 
                  fill="transparent" 
                  r="58" 
                  cx="64" 
                  cy="64" 
                  strokeDasharray="364.4"
                  strokeDashoffset={364.4 - (364.4 * percentage) / 100} 
                  strokeLinecap="round" 
                />
              </svg>
              <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                <span className="text-3xl font-bold">{percentage}%</span>
              </div>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex justify-between py-2 border-b">
              <span className="font-semibold">Score:</span>
              <span>{score} / {totalQuestions}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="font-semibold">Grade:</span>
              <span className={`font-bold ${gradeColor}`}>{grade}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="font-semibold">Time Spent:</span>
              <span>{formatTimeSpent(timeSpent)}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="font-semibold">Correct Answers:</span>
              <span className="text-green-600">{correctAnswers}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="font-semibold">Incorrect Answers:</span>
              <span className="text-red-600">{incorrectAnswers}</span>
            </div>
            {unanswered > 0 && (
              <div className="flex justify-between py-2 border-b">
                <span className="font-semibold">Unanswered:</span>
                <span className="text-amber-600">{unanswered}</span>
              </div>
            )}
          </div>

          {Object.keys(knowledgeGaps).length > 0 && (
            <div className="mb-8">
              <h3 className="font-semibold text-lg mb-3">Areas for Improvement:</h3>
              <ul className="list-disc pl-5 space-y-2">
                {Object.entries(knowledgeGaps).map(([area, count]) => (
                  <li key={area}>
                    <span className="font-medium">{area}</span>: You missed {count} question{count > 1 ? 's' : ''} in this area
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      {activeTab === 'analysis' && (
        <div className="mb-8">
          <h3 className="font-semibold text-lg mb-4">Question Analysis</h3>
          <div className="space-y-6">
            {questions.map((question, index) => {
              const userAnswer = userAnswers[question.id];
              const isCorrect = userAnswer === question.correctAnswer;
              const isUnanswered = userAnswer === undefined;
              
              return (
                <div 
                  key={question.id}
                  className={`p-4 border rounded-lg ${
                    isUnanswered ? 'bg-gray-50' : (isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200')
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Question {index + 1}</h4>
                    <span 
                      className={`px-2 py-1 rounded text-sm font-medium ${
                        isUnanswered 
                          ? 'bg-gray-200 text-gray-700' 
                          : (isCorrect ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800')
                      }`}
                    >
                      {isUnanswered ? 'Unanswered' : (isCorrect ? 'Correct' : 'Incorrect')}
                    </span>
                  </div>
                  
                  <p className="mb-3">{question.question}</p>
                  
                  <div className="space-y-2 mb-3">
                    {question.options.map((option, optIndex) => (
                      <div 
                        key={optIndex}
                        className={`p-2 border rounded ${
                          optIndex === question.correctAnswer 
                            ? 'bg-green-100 border-green-300' 
                            : (optIndex === userAnswer && optIndex !== question.correctAnswer)
                              ? 'bg-red-100 border-red-300'
                              : 'bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center">
                          <div className={`w-6 h-6 flex items-center justify-center rounded-full mr-2 ${
                            optIndex === question.correctAnswer 
                              ? 'bg-green-500 text-white' 
                              : (optIndex === userAnswer && optIndex !== question.correctAnswer)
                                ? 'bg-red-500 text-white'
                                : 'bg-gray-200'
                          }`}>
                            {['A', 'B', 'C', 'D'][optIndex]}
                          </div>
                          <div>{option}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {(!isCorrect || isUnanswered) && question.explanation && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                      <p className="text-sm font-medium text-blue-800">Explanation:</p>
                      <p className="text-sm mt-1">{question.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {Object.keys(knowledgeGaps).length > 0 && (
            <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <h3 className="font-semibold text-lg mb-3">Recommended Study Areas:</h3>
              <ul className="list-disc pl-5 space-y-2">
                {Object.entries(knowledgeGaps).map(([area, count]) => (
                  <li key={area}>
                    <span className="font-medium">{area}</span>: Review this topic to improve your understanding
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="text-center mt-8">
        <button 
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          onClick={onReturnToTopics}
        >
          Return to Topics
        </button>
      </div>
    </div>
  );
};

// Main QuizesPage Component
const QuizesPage = () => {
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [quizResults, setQuizResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // In a real implementation, you would fetch topics from an API
  const [topics, setTopics] = useState(dummyTopics);

  const handleSelectTopic = async (topicId) => {
    setLoading(true);
    
    // In a real implementation, you would fetch questions from an API
    // For now, use our dummy data
    setTimeout(() => {
      const questions = dummyQuizQuestions[topicId] || [];
      setQuizQuestions(questions);
      setSelectedTopic(topics.find(t => t.id === topicId));
      setLoading(false);
    }, 800); // Simulate loading
  };

  const handleCompleteQuiz = (results) => {
    if (results) {
      setQuizResults(results);
    } else {
      // If no results (quiz was canceled), just go back to topic selection
      setSelectedTopic(null);
      setQuizQuestions([]);
    }
  };

  const handleReturnToTopics = () => {
    setSelectedTopic(null);
    setQuizQuestions([]);
    setQuizResults(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg">Loading quiz questions...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Quiz Center</h1>
      
      {!selectedTopic && !quizResults && (
        <>
          <p className="mb-6">Select a topic to start a quiz. Each quiz has multiple-choice questions with a time limit.</p>
          <TopicSelection topics={topics} onSelectTopic={handleSelectTopic} />
        </>
      )}

      {selectedTopic && quizQuestions.length > 0 && !quizResults && (
        <>
          <div className="mb-6">
            <h2 className="text-xl font-bold">{selectedTopic.title} Quiz</h2>
            <p className="text-gray-600">Time Limit: {selectedTopic.timeLimit} minutes</p>
          </div>
          
          <Quiz 
            topicId={selectedTopic.id} 
            questions={quizQuestions}
            timeLimit={selectedTopic.timeLimit}
            onComplete={handleCompleteQuiz}
          />
        </>
      )}

      {quizResults && (
        <QuizResults 
          results={quizResults}
          onReturnToTopics={handleReturnToTopics}
        />
      )}
    </div>
  );
};

export default QuizesPage;