import React from 'react';

const ProfileModal = ({ isOpen, onClose, user }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative animate-fade-in">
        <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={onClose}>
          &times;
        </button>
        <h2 className="text-xl font-bold mb-4">My Profile</h2>
        <div className="flex flex-col gap-2">
          <div><span className="font-semibold">Name:</span> {user?.name || 'N/A'}</div>
          <div><span className="font-semibold">Email:</span> {user?.email || 'N/A'}</div>
          <div><span className="font-semibold">Role:</span> {user?.role || 'N/A'}</div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
