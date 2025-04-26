import React from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import RegisterPage from './pages/register';
import ProtectedRoute from './components/ProtectedRoute';
import StudentDashboard from './pages/studentDashboard';
import AssignmentsPage from './pages/assignmentsPage';
import LearningDashboard from './pages/LearningDashboard';
import NotesPage from './pages/notesPage';
import QuizesPage from './pages/quizesPage';
import SyllabusPage from './pages/syllabusPage';
import DashboardHome from './pages/dashboardHome';
import DebugPage from './pages/DebugPage';
import useCourseStore from './store/courseStore';
import GlobalUserBar from './components/GlobalUserBar';

// NotFound component for unmatched routes
const NotFound = () => {
  const routes = [
    { path: '/register', label: 'Register' },
    { path: '/dashboard', label: 'Dashboard Home' },
    { path: '/dashboard/assignments', label: 'Assignments' },
    { path: '/dashboard/learning', label: 'Learning' },
    { path: '/dashboard/notes', label: 'Notes' },
    { path: '/dashboard/quizzes', label: 'Quizzes' },
    { path: '/dashboard/syllabus', label: 'Syllabus' },
  ];
  return (
    <div className="h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-2xl p-6 text-center">
        <h1 className="text-4xl font-bold text-red-500 mb-4">404</h1>
        <p className="text-gray-700 mb-6">Oops! Page not found.</p>
        <p className="text-gray-600 mb-4">Here are some helpful links:</p>
        <ul className="space-y-2">
          {routes.map((r) => (
            <li key={r.path}>
              <Link to={r.path} className="text-blue-600 hover:underline">
                {r.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const getDefaultCourseId = () => {
  // Try to get the first course from the store (if available)
  const courses = JSON.parse(localStorage.getItem('courses'));
  if (courses && courses.length > 0) {
    return courses[0].courseId || courses[0].id || courses[0]._id;
  }
  // fallback: null or hardcoded
  return null;
};

const AppRoutes = () => {
  return (
    <>
      <GlobalUserBar />
      <Routes>
        {/* Redirect root to login or dashboard */}
        <Route path="/" element={<Navigate to="/register" replace />} />
        {/* Public route: register only */}
        <Route path="/register" element={<RegisterPage />} />
        {/* All other routes are protected */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <StudentDashboard />
            </ProtectedRoute>
          }
        >
          <Route path="debug" element={<DebugPage />} />
          <Route index element={<DashboardHome />} />
          <Route path="quizzes" element={<QuizesPage />} />
          <Route path="assignments" element={<AssignmentsPage />} />
          <Route path="learning" element={<LearningDashboard courseId={getDefaultCourseId()} />} />
          <Route path="notes" element={<NotesPage />} />
          <Route path="syllabus" element={<SyllabusPage />} />
        </Route>
        {/* Catch-all: protect everything else */}
        <Route
          path="*"
          element={
            <ProtectedRoute>
              <NotFound />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
};

export default AppRoutes;