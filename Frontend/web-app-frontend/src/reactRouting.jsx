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

const AppRoutes = () => {
  return (
    <Routes>
      <Route path='/register' element={<RegisterPage />} />
      <Route path='/dashboard' element={<StudentDashboard />} />
      <Route path='/dashboard/assignments' element={<AssignmentsPage />} />
      <Route path='/dashboard/learning' element={<LearningDashboard />} />
      <Route path='/dashboard/notes' element={<NotesPage />} />
      <Route path='/dashboard/quizzes' element={<QuizesPage />} />
      <Route path='/dashboard/syllabus' element={<SyllabusPage />} />
    </Routes>
  );
};

export default AppRoutes;
