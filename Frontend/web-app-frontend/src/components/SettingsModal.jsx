import React from 'react';

const SettingsModal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative animate-fade-in">
        <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={onClose}>
          &times;
        </button>
        <h2 className="text-xl font-bold mb-4">Settings</h2>
        <div className="flex flex-col gap-4">
          {children || <div className="text-gray-500">Settings content goes here.</div>}
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
