import React, { useRef, useState } from 'react'

const AvatarUploadModal = ({ isOpen, onClose, onUpload }) => {
  const fileInputRef = useRef(null)
  const [preview, setPreview] = useState(null)
  const [file, setFile] = useState(null)

  if (!isOpen) return null

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setPreview(reader.result)
      reader.readAsDataURL(file)
    }
  }

  const handleUpload = () => {
    if (file && preview) {
      onUpload(file, preview)
      setPreview(null)
      setFile(null)
      onClose()
    }
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30" onClick={handleBackdropClick}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative animate-fade-in" onClick={e => e.stopPropagation()}>
        <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={onClose}>
          &times;
        </button>
        <h2 className="text-xl font-bold mb-4">Change Avatar</h2>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="mb-4"
        />
        {preview && <img src={preview} alt="Preview" className="w-24 h-24 rounded-full object-cover mx-auto mb-4" />}
        <button
          className="w-full bg-black text-white py-2 rounded-xl mt-2 disabled:opacity-60"
          onClick={handleUpload}
          disabled={!file}
        >
          Upload
        </button>
      </div>
    </div>
  )
}

export default AvatarUploadModal
