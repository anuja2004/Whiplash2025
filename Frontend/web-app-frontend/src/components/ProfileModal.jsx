import React from 'react';

const ProfileModal = ({ isOpen, onClose, user }) => {
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
        <h2 className="text-2xl font-bold mb-6">My Profile</h2>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4 mb-4">
            <img
              src={user?.avatarUrl || '/default-avatar.png'}
              alt="Avatar"
              className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
            />
            <div>
              <div className="font-semibold text-lg">{user?.name || 'N/A'}</div>
              <div className="text-gray-500 text-sm">{user?.role || 'Student'}</div>
            </div>
          </div>
          <div><span className="font-semibold">Email:</span> {user?.email || 'N/A'}</div>
          <div><span className="font-semibold">Joined:</span> {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</div>
          <div className="mt-4">
            <h3 className="font-semibold mb-2">About Me</h3>
            <p className="text-gray-600">This is your profile. You can add more fields here as needed.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
