import React from 'react'
import { Outlet } from 'react-router-dom'

const StudentDashboard = () => {
  return (
    <div className="flex h-screen w-full">
      {/* Left Side */}
      <div className="w-1/3 bg-gray-100 p-4">
        {/* Calendar + Course List here */}
        <h2 className="text-lg font-bold mb-4">Calendar</h2>
        <div className="h-40 bg-white rounded-xl shadow mb-4">[Calendar Placeholder]</div>

        <h2 className="text-lg font-bold mb-2">My Courses</h2>
        <ul className="space-y-2">
          <li className="bg-white p-2 rounded shadow">AI/ML</li>
          <li className="bg-white p-2 rounded shadow">Web Dev</li>
        </ul>
      </div>

      {/* Right Side */}
      <div className="w-2/3 p-6">
        <h1 className="text-2xl font-bold mb-4">What do you want to learn? 🤔</h1>
        <input
          type="text"
          placeholder="Search or Add a New Topic..."
          className="w-full p-2 border border-gray-300 rounded mb-4"
          onClick={() => console.log('Open modal')}
        />
        <button className="bg-black text-white py-2 px-4 rounded">Search</button>

        {/* Outlet for nested routes */}
        <div className="mt-6">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default StudentDashboard
