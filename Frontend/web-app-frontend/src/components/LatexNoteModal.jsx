import React, { useState } from 'react';
import Modal from 'react-modal';
import { X } from 'lucide-react';
import Latex from 'react-latex-next';
import 'katex/dist/katex.min.css';

Modal.setAppElement('#root');

const LatexNoteModal = ({ isOpen, onClose, onSave }) => {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [preview, setPreview] = useState(false);

  const handleSave = () => {
    if (title.trim() && content.trim()) {
      onSave(title, content);
      setContent('');
      setTitle('');
      setPreview(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Write Note"
      overlayClassName="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
      className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8 relative mx-2"
    >
      <button
        className="absolute top-4 right-4 text-gray-400 hover:text-black"
        onClick={onClose}
      >
        <X className="h-6 w-6" />
      </button>
      <h2 className="text-2xl font-bold mb-6">Write a Note (supports LaTeX)</h2>
      <div className="mb-4">
        <input
          className="w-full border border-gray-300 rounded-xl p-3 mb-3 focus:outline-none focus:ring-2 focus:ring-black"
          placeholder="Note Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          maxLength={80}
        />
        <textarea
          className="w-full border border-gray-300 rounded-xl p-3 h-40 focus:outline-none focus:ring-2 focus:ring-black font-mono"
          placeholder="Write your note here... Use $...$ for inline LaTeX or $$...$$ for display LaTeX."
          value={content}
          onChange={e => setContent(e.target.value)}
        />
      </div>
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          className={`px-4 py-2 rounded-xl ${preview ? 'bg-gray-200' : 'bg-black text-white'}`}
          onClick={() => setPreview(false)}
        >
          Edit
        </button>
        <button
          type="button"
          className={`px-4 py-2 rounded-xl ${preview ? 'bg-black text-white' : 'bg-gray-200'}`}
          onClick={() => setPreview(true)}
        >
          Preview
        </button>
      </div>
      {preview && (
        <div className="border rounded-xl p-4 bg-gray-50 min-h-[80px] mb-4">
          <Latex>{content || 'Nothing to preview.'}</Latex>
        </div>
      )}
      <button
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl w-full mt-2 text-lg font-semibold transition-colors shadow-sm"
        onClick={handleSave}
        disabled={!title.trim() || !content.trim()}
      >
        Save Note
      </button>
    </Modal>
  );
};

export default LatexNoteModal;
