import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';

const StudentDashboard = () => {
  const [open, setOpen] = useState(false);
  const [topic, setTopic] = useState('');
  const [frequency, setFrequency] = useState('');

  const frequencies = ['Daily', 'Weekly', 'Monthly'];

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleSave = () => {
    console.log('Topic:', topic, 'Frequency:', frequency);
    handleClose();
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-full">
      {/* Left Sidebar */}
      <div className="w-full md:w-1/3 bg-gray-100 p-4">
        <h2 className="text-lg font-bold mb-4">Calendar</h2>
        <div className="h-40 bg-white rounded-xl shadow mb-4">[Calendar Placeholder]</div>

        <h2 className="text-lg font-bold mb-2">My Courses</h2>
        <ul className="space-y-2">
          <li className="bg-white p-2 rounded shadow">AI/ML</li>
          <li className="bg-white p-2 rounded shadow">Web Dev</li>
        </ul>
      </div>

      {/* Right Content */}
      <div className="w-full md:w-2/3 p-6">
        <h1 className="text-2xl font-bold mb-4">What do you want to learn? 🤔</h1>
        <input
          type="text"
          placeholder="Search or Add a New Topic..."
          className="w-full p-2 border border-gray-300 rounded mb-4 cursor-pointer"
          onClick={handleOpen}
          readOnly
        />
        <button
          className="bg-black text-white py-2 px-4 rounded"
          onClick={handleOpen}
        >
          Search
        </button>

        {/* Nested Routes */}
        <div className="mt-6">
          <Outlet />
        </div>
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-semibold mb-4">Add Learning Topic</h2>

            <label className="block mb-2 font-medium text-sm">Topic or Subject</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full border border-gray-300 rounded p-2 mb-4"
              placeholder="Enter topic name"
            />

            <label className="block mb-2 font-medium text-sm">Study Frequency</label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="w-full border border-gray-300 rounded p-2 mb-4"
            >
              <option value="" disabled>Select Frequency</option>
              {frequencies.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>

            <button
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded w-full"
              onClick={handleSave}
            >
              Save
            </button>

            <button
              className="mt-3 text-sm text-gray-500 hover:text-gray-700 w-full"
              onClick={handleClose}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
