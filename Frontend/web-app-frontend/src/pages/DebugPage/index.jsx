// src/pages/DebugPage.jsx
import React, { useEffect } from 'react';
import useCourseStore from '../../store/courseStore';

const DebugPage = () => {
  const {
    courses,
    currentCourse,
    currentTopic,
    isLoading,
    error,
    fetchCourses,
    fetchCourseDetails
  } = useCourseStore();

  useEffect(() => {
    // You can also call this manually in UI
    fetchCourses();
  }, []);

  const currentUser = JSON.parse(localStorage.getItem('user')); // or use useAuthStore()
<pre>{JSON.stringify(currentUser, null, 2)}</pre>


  return (
    <div style={{ padding: '2rem' }}>
      <h1>🛠️ Debug Page</h1>

        <h2>Current User:</h2>
        <pre>{JSON.stringify(currentUser, null, 2)}</pre>

      {isLoading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      <h2>All Courses:</h2>
      <pre>{JSON.stringify(courses, null, 2)}</pre>

      <h2>Current Course:</h2>
      <pre>{JSON.stringify(currentCourse, null, 2)}</pre>

      <h2>Current Topic:</h2>
      <pre>{JSON.stringify(currentTopic, null, 2)}</pre>

      <button onClick={() => fetchCourseDetails(courses[0].courseId)}>
  📘 Fetch First Course Details
</button>
    </div>
  );
};

export default DebugPage;
