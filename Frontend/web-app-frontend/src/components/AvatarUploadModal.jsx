import React, { useRef, useState } from 'react'

const AvatarUploadModal = ({ isOpen, onClose, onUpload }) => {
  const fileInputRef = useRef()
  const [preview, setPreview] = useState(null)
  const [file, setFile] = useState(null)

  if (!isOpen) return null

  const handleFileChange = (e) => {
    const f = e.target.files[0]
    if (f) {
      setFile(f)
      const reader = new FileReader()
      reader.onload = (ev) => setPreview(ev.target.result)
      reader.readAsDataURL(f)
    }
  }

  const handleUpload = () => {
    if (file) {
      onUpload(file, preview)
      setFile(null)
      setPreview(null)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-80 flex flex-col items-center">
        <h2 className="font-bold text-lg mb-4">Upload Avatar</h2>
        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="mb-4" />
        {preview && <img src={preview} alt="Preview" className="w-24 h-24 rounded-full object-cover mb-4" />}
        <div className="flex gap-2 mt-2">
          <button
            className="px-4 py-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:scale-105 transition"
            onClick={handleUpload}
            disabled={!file}
          >
            Upload
          </button>
          <button
            className="px-4 py-1 rounded-full bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default AvatarUploadModal
