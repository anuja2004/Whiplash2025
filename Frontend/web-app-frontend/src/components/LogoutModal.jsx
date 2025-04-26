import React from 'react';

const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  // Ensure modal is always centered, responsive, and closes on backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-xs sm:max-w-md p-6 sm:p-8 relative animate-fade-in mx-2 overflow-y-auto max-h-[95vh] flex flex-col items-center"
        onClick={e => e.stopPropagation()}
      >
        <button className="absolute top-3 right-4 text-gray-400 hover:text-gray-700 text-2xl" onClick={onClose}>
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-6 text-center">Confirm Logout</h2>
        <p className="text-gray-700 mb-8 text-center">Are you sure you want to log out of your account?</p>
        <div className="flex gap-4 w-full justify-center">
          <button
            className="px-6 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-red-500 text-white font-semibold shadow hover:scale-105 transition-all"
            onClick={onConfirm}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;
