// src/pages/quizesPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import useCourseStore from '../../store/courseStore';

// Main QuizesPage Component
const QuizesPage = () => {
  const { currentCourse } = useCourseStore();
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizResults, setQuizResults] = useState(null);

  useEffect(() => {
    if (currentCourse && currentCourse.topics) {
      setTopics(currentCourse.topics);
    } else {
      setTopics([]);
    }
  }, [currentCourse]);

  const handleSelectTopic = async (topic) => {
    setSelectedTopic(topic);
    setLoading(true);
    setError(null);
    try {
      // Fetch ALL quizzes for the course
      const token = localStorage.getItem('token');
      const API_BASE = 'http://localhost:5000/api';
      const response = await axios.get(
        `${API_BASE}/student/courses/${currentCourse.courseId}/quizzes`,
        { headers: { 'x-auth-token': token } }
      );
      // Filter quizzes for this topic
      const allQuizzes = response.data.quizzes || [];
      const topicQuizzes = allQuizzes.filter(q => q.topicId === topic.topicId);
      // If quizzes contain questions array, flatten
      let quizQuestions = [];
      topicQuizzes.forEach(quiz => {
        if (Array.isArray(quiz.questions)) {
          quizQuestions = quizQuestions.concat(quiz.questions.map(q => ({ ...q, quizTitle: quiz.title })));
        }
      });
      setQuizQuestions(quizQuestions);
      setQuizStarted(true);
    } catch {
      setError('Failed to fetch quiz questions.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuizComplete = (results) => {
    setQuizResults(results);
    setQuizStarted(false);
  };

  const handleReturnToTopics = () => {
    setQuizResults(null);
    setQuizStarted(false);
    setSelectedTopic(null);
    setQuizQuestions([]);
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Quizzes</h1>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {!quizStarted && !quizResults && (
        <TopicSelection topics={topics} onSelectTopic={handleSelectTopic} />
      )}
      {loading && <div className="text-center py-6"><span className="loader"></span> Loading quiz...</div>}
      {quizStarted && quizQuestions.length === 0 && !loading && (
        <div className="text-gray-500 text-center mt-4">
          No quiz available for this topic.<br/>
          <button
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() => {
              // Show all quizzes for the course (not just this topic)
              setQuizQuestions((prev) => {
                if (prev.length > 0) return prev;
                // fallback: fetch all quizzes for the course
                const token = localStorage.getItem('token');
                const API_BASE = 'http://localhost:5000/api';
                axios.get(`${API_BASE}/student/courses/${currentCourse.courseId}/quizzes`,
                  { headers: { 'x-auth-token': token } }
                ).then(response => {
                  let allQuestions = [];
                  (response.data.quizzes || []).forEach(quiz => {
                    if (Array.isArray(quiz.questions)) {
                      allQuestions = allQuestions.concat(quiz.questions.map(q => ({ ...q, quizTitle: quiz.title })));
                    }
                  });
                  setQuizQuestions(allQuestions);
                });
                return [];
              });
            }}
          >
            Show All Quizzes
          </button>
        </div>
      )}
      {quizStarted && quizQuestions.length > 0 && (
        <Quiz
          topicId={selectedTopic.topicId}
          questions={quizQuestions}
          timeLimit={selectedTopic.timeLimit || 20}
          onComplete={handleQuizComplete}
        />
      )}
      {quizResults && (
        <QuizResults results={quizResults} onReturnToTopics={handleReturnToTopics} />
      )}
    </div>
  );
};

export default QuizesPage;

// Topic Selection Component
const TopicSelection = ({ topics, onSelectTopic }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {topics.map((topic) => (
        <div 
          key={topic.topicId} 
          className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer border border-gray-200"
          onClick={() => onSelectTopic(topic)}
        >
          <h3 className="font-bold text-lg mb-2">{topic.topicName}</h3>
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
      if (selectedAnswers[question.questionId] === question.correctAnswer) {
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
        <h3 className="text-lg font-semibold mb-4">{question.questionText || question.question}</h3>
        <div className="space-y-3">
          {question.options.map((option, index) => (
            <div 
              key={index}
              className={`p-3 border rounded-lg cursor-pointer transition-all ${
                selectedAnswers[question.questionId] === index 
                  ? 'bg-blue-100 border-blue-500' 
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => handleSelectAnswer(question.questionId, index)}
            >
              <div className="flex items-center">
                <div className={`w-6 h-6 flex items-center justify-center rounded-full mr-3 ${
                  selectedAnswers[question.questionId] === index 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200'
                }`}>
                  {['A', 'B', 'C', 'D'][index]}
                </div>
                <div>{typeof option === 'object' ? option.text : option}</div>
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
  const correctAnswers = questions.filter(q => userAnswers[q.questionId] === q.correctAnswer).length;
  const incorrectAnswers = questions.filter(q => 
    userAnswers[q.questionId] !== undefined && userAnswers[q.questionId] !== q.correctAnswer
  ).length;
  const unanswered = questions.filter(q => userAnswers[q.questionId] === undefined).length;

  // Group questions by correctness for analysis
  const incorrectQuestions = questions.filter(q => 
    userAnswers[q.questionId] !== undefined && userAnswers[q.questionId] !== q.correctAnswer
  );
  
  // Calculate knowledge gaps by analyzing incorrect answers
  const knowledgeGaps = {};
  
  // For this simple example, we'll just track how many questions were wrong
  if (topicId === 1) { // React Fundamentals
    incorrectQuestions.forEach(q => {
      if (q.questionId === 1 || q.questionId === 2) knowledgeGaps['React Basics'] = (knowledgeGaps['React Basics'] || 0) + 1;
      if (q.questionId === 3) knowledgeGaps['Virtual DOM'] = (knowledgeGaps['Virtual DOM'] || 0) + 1;
      if (q.questionId === 4 || q.questionId === 5) knowledgeGaps['React Hooks'] = (knowledgeGaps['React Hooks'] || 0) + 1;
    });
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-6">Quiz Results</h2>
      
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
              const userAnswer = userAnswers[question.questionId];
              const isCorrect = userAnswer === question.correctAnswer;
              const isUnanswered = userAnswer === undefined;
              
              return (
                <div 
                  key={question.questionId}
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
                  
                  <p className="mb-3">{question.questionText || question.question}</p>
                  
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
                          <div>{typeof option === 'object' ? option.text : option}</div>
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