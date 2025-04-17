import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import RegisterPage from './pages/register';
import StudentDashboard from './pages/studentDashboard';
import AssignmentsPage from './pages/assignmentsPage';
import LearningDashboard from './pages/LearningDashboard';
import NotesPage from './pages/notesPage';
import QuizesPage from './pages/quizesPage';
import SyllabusPage from './pages/syllabusPage';
import DashboardHome from './pages/dashboardHome';

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

const AppRoutes = () => {
  return (
    <Routes>
      {/* Fallback route for 404 */}
      <Route path="*" element={<NotFound />} />

      {/* Public routes */}
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/learningDashboard" element={<LearningDashboard />} />

      {/* Protected dashboard with nested routes */}
      <Route path="/dashboard" element={<StudentDashboard />}> 
        {/* Default index route */}
        <Route index element={<DashboardHome />} />
        <Route path="assignments" element={<AssignmentsPage />} />
        <Route path="learning" element={<LearningDashboard />} />
        <Route path="notes" element={<NotesPage />} />
        <Route path="quizzes" element={<QuizesPage />} />
        <Route path="syllabus" element={<SyllabusPage />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
