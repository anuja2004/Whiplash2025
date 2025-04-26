import React from 'react'

const AvatarDropdownMenu = ({ onProfile, onSettings, onLogout, onAvatar, onTheme }) => {
  return (
    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl z-50 border border-gray-100 animate-fade-in">
      <button
        className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-t-xl"
        onClick={onProfile}
      >
        My Profile
      </button>
      <button
        className="w-full text-left px-4 py-2 hover:bg-gray-100"
        onClick={onSettings}
      >
        Settings
      </button>
      <button
        className="w-full text-left px-4 py-2 hover:bg-gray-100"
        onClick={onAvatar}
      >
        Change Avatar
      </button>
      <button
        className="w-full text-left px-4 py-2 hover:bg-gray-100"
        onClick={onTheme}
      >
        Change Theme
      </button>
      <button
        className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 rounded-b-xl border-t border-gray-100"
        onClick={onLogout}
      >
        Logout
      </button>
    </div>
  )
}

export default AvatarDropdownMenu
