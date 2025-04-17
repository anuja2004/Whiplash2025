// src/pages/dashboardHome.jsx
import React from 'react';

const DashboardHome = () => {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Welcome to Your Dashboard</h2>
      <p className="mb-4">Select an option from the navigation to view specific content.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        <div className="bg-blue-50 p-4 rounded-lg shadow">
          <h3 className="font-bold mb-2">Recent Activity</h3>
          <p>You completed 3 quizzes this week</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg shadow">
          <h3 className="font-bold mb-2">Progress</h3>
          <p>You're 75% through your AI/ML course</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg shadow">
          <h3 className="font-bold mb-2">Upcoming</h3>
          <p>Web Dev project due in 2 days</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;