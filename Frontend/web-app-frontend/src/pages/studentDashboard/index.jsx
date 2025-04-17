import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './customCalendar.css';

const StudentDashboard = () => {
  const [open, setOpen] = useState(false);
  const [topic, setTopic] = useState('');
  const [frequency, setFrequency] = useState('');
  const [date, setDate] = useState(new Date());

  const frequencies = ['Daily', 'Weekly', 'Monthly'];

  // Demo Events
  const importantEvents = [
    { date: new Date(2025, 3, 15), label: 'AI/ML Mid Exam' },
    { date: new Date(2025, 3, 18), label: 'Web Dev Project Review' },
    { date: new Date(2025, 3, 20), label: 'Hackathon' },
    { date: new Date(), label: 'Today: Prep for DBMS' }
  ];

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleSave = () => {
    console.log('Topic:', topic, 'Frequency:', frequency, 'Selected Date:', date);
    handleClose();
  };

  // Check if a date has an event
  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      const isEvent = importantEvents.some(ev =>
        ev.date.toDateString() === date.toDateString()
      );
      if (isEvent) return 'highlight';
    }
    return null;
  };

  // Active link style for navigation
  const navLinkStyle = ({ isActive }) => {
    return isActive 
      ? "bg-blue-100 text-blue-700 p-2 rounded font-medium flex items-center"
      : "text-gray-700 hover:bg-gray-100 p-2 rounded flex items-center";
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-full">
      {/* Left Sidebar */}
      <div className="w-full md:w-1/3 bg-gray-100 p-4 overflow-y-auto">
        <h2 className="text-lg font-bold mb-4">📅 Calendar</h2>
        <div className="bg-white rounded-xl shadow mb-4 p-2">
          <Calendar
            onChange={setDate}
            value={date}
            tileClassName={tileClassName}
          />
        </div>

        <h3 className="text-md font-semibold mb-2">📌 Upcoming Events:</h3>
        <ul className="space-y-2 mb-6">
          {importantEvents.map((event, idx) => (
            <li key={idx} className="bg-white p-2 rounded shadow text-sm">
              <strong>{event.date.toDateString()}</strong>: {event.label}
            </li>
          ))}
        </ul>

        <h2 className="text-lg font-bold mb-2">📚 My Courses</h2>
        <ul className="space-y-2">
          <li className="bg-white p-2 rounded shadow">AI/ML</li>
          <li className="bg-white p-2 rounded shadow">Web Dev</li>
        </ul>
        
        {/* Dashboard Navigation */}
        <div className="mt-6">
          <h2 className="text-lg font-bold mb-2">🧭 Navigation</h2>
          <nav className="space-y-1">
            <NavLink to="/dashboard" end className={navLinkStyle}>
              🏠 Dashboard Home
            </NavLink>
            <NavLink to="/dashboard/assignments" className={navLinkStyle}>
              📝 Assignments
            </NavLink>
            <NavLink to="/dashboard/learning" className={navLinkStyle}>
              🧠 Learning
            </NavLink>
            <NavLink to="/dashboard/notes" className={navLinkStyle}>
              📓 Notes
            </NavLink>
            <NavLink to="/dashboard/quizzes" className={navLinkStyle}>
              ✅ Quizzes
            </NavLink>
            <NavLink to="/dashboard/syllabus" className={navLinkStyle}>
              📑 Syllabus
            </NavLink>
          </nav>
        </div>
      </div>

      {/* Right Content */}
      <div className="w-full md:w-2/3 p-6">
        <h1 className="text-2xl font-bold mb-4">What do you want to learn? 🤔</h1>
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            placeholder="Search or Add a New Topic..."
            className="w-full p-2 border border-gray-300 rounded cursor-pointer"
            onClick={handleOpen}
            readOnly
          />
          <button
            className="bg-black text-white py-2 px-4 rounded"
            onClick={handleOpen}
          >
            Search
          </button>
        </div>

        {/* This is where nested routes will render */}
        <div className="mt-2 bg-white rounded-lg shadow p-4">
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
                <option key={option} value={option}>{option}</option>
              ))}
            </select>

            <label className="block mb-2 font-medium text-sm">Start Date</label>
            <Calendar
              onChange={setDate}
              value={date}
            />

            <button
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded w-full mt-4"
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