import React from 'react';

const SettingsModal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 relative animate-fade-in mx-2 overflow-y-auto max-h-[95vh]"
        onClick={e => e.stopPropagation()}
      >
        <button className="absolute top-3 right-4 text-gray-400 hover:text-gray-700 text-2xl" onClick={onClose}>
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-6">Settings</h2>
        <div className="flex flex-col gap-6">
          <div>
            <h3 className="font-semibold mb-2">Theme</h3>
            <div className="flex gap-2">
              <button className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Light</button>
              <button className="px-4 py-2 rounded bg-gray-800 text-white hover:bg-gray-700">Dark</button>
              <button className="px-4 py-2 rounded bg-gradient-to-r from-blue-500 to-purple-500 text-white">System</button>
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Notifications</h3>
            <label className="flex items-center gap-3">
              <input type="checkbox" className="form-checkbox" />
              <span>Email me about important updates</span>
            </label>
            <label className="flex items-center gap-3 mt-2">
              <input type="checkbox" className="form-checkbox" />
              <span>Push notifications for deadlines</span>
            </label>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Account</h3>
            <button className="text-red-600 hover:underline">Delete Account</button>
          </div>
          {children || <div className="text-gray-500">Additional settings content goes here.</div>}
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
