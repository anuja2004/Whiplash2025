// src/reactRouting.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import RegisterPage from './pages/register';
import StudentDashboard from './pages/studentDashboard';
import AssignmentsPage from './pages/assignmentsPage';
import LearningDashboard from './pages/LearningDashboard';
import NotesPage from './pages/notesPage';
import QuizesPage from './pages/quizesPage';
import SyllabusPage from './pages/syllabusPage';
import DashboardHome from './pages/dashboardHome'; // Create this component for the dashboard index route
// import CoursePage from './pages/coursePage';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path='/register' element={<RegisterPage />} />
      <Route path='/learningDashboard' element={<LearningDashboard />} />
      {/* Parent route with nested child routes */}
      <Route path='/dashboard' element={<StudentDashboard />}>
        {/* Index route - shown by default when parent route matches */}
        <Route index element={<DashboardHome />} />
        
        {/* Child routes - will render inside the Outlet in StudentDashboard */}
        <Route path='assignments' element={<AssignmentsPage />} />
        <Route path='learning' element={<LearningDashboard />} />
        <Route path='notes' element={<NotesPage />} />
        <Route path='quizzes' element={<QuizesPage />} />
        <Route path='syllabus' element={<SyllabusPage />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;