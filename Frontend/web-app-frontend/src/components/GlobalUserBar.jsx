import React, { useState, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import AvatarUploadModal from './AvatarUploadModal'
import AvatarDropdownMenu from './AvatarDropdownMenu'
import ProfileModal from './ProfileModal'
import SettingsModal from './SettingsModal'

const getInitials = (name, email) => {
  if (name) return name.split(' ').map(n => n[0]).join('').toUpperCase()
  if (email) return email[0].toUpperCase()
  return '?'
}

const colorThemes = [
  'from-blue-500 to-purple-500',
  'from-green-400 to-teal-500',
  'from-yellow-400 to-orange-500',
  'from-pink-500 to-red-500',
  'from-indigo-500 to-blue-400',
]

const GlobalUserBar = () => {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState(() => localStorage.getItem('avatarUrl'))
  const [themeIdx, setThemeIdx] = useState(() => Number(localStorage.getItem('avatarThemeIdx')) || 0)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const dropdownRef = useRef()

  React.useEffect(() => {
    const handleClick = (e) => {
      if (dropdownOpen && dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [dropdownOpen])

  if (!currentUser) return null

  const handleUpload = (file, preview) => {
    setAvatarUrl(preview)
    localStorage.setItem('avatarUrl', preview)
  }

  const handleThemeChange = () => {
    const next = (themeIdx + 1) % colorThemes.length
    setThemeIdx(next)
    localStorage.setItem('avatarThemeIdx', next)
  }

  return (
    <div className="fixed top-4 right-6 z-50 flex items-center bg-white/80 shadow-lg rounded-full px-4 py-2 gap-3 border border-gray-200 backdrop-blur-md">
      <div className="relative group" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen((v) => !v)}
          className={`w-10 h-10 rounded-full bg-gradient-to-br ${colorThemes[themeIdx]} flex items-center justify-center text-white font-bold text-xl overflow-hidden border-2 border-white shadow transition-all duration-200`}
          title="User menu"
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover rounded-full" />
          ) : (
            getInitials(currentUser?.name, currentUser?.email)
          )}
        </button>
        {dropdownOpen && (
          <AvatarDropdownMenu
            onProfile={() => { setShowProfile(true); setDropdownOpen(false); }}
            onSettings={() => { setShowSettings(true); setDropdownOpen(false); }}
            onAvatar={() => { setShowModal(true); setDropdownOpen(false); }}
            onTheme={() => { handleThemeChange(); setDropdownOpen(false); }}
            onLogout={() => { logout(); navigate('/register'); setDropdownOpen(false); }}
          />
        )}
      </div>
      <div className="flex flex-col items-start ml-2">
        <span className="font-bold text-gray-800 text-sm">{currentUser?.name || currentUser?.email}</span>
        <span className="text-gray-400 text-xs">{currentUser.role && currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}</span>
      </div>
      <button
        className="ml-2 px-3 py-1 bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-full shadow hover:scale-105 transition-all font-semibold text-xs"
        onClick={() => { logout(); navigate('/register') }}
      >
        Logout
      </button>
      <AvatarUploadModal isOpen={showModal} onClose={() => setShowModal(false)} onUpload={handleUpload} />
      <ProfileModal isOpen={showProfile} onClose={() => setShowProfile(false)} user={currentUser} />
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  )
}

export default GlobalUserBar
