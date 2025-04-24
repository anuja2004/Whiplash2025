import React, { useEffect, useState } from 'react';
import useCourseStore from '../../store/courseStore';
import LatexNoteModal from '../../components/LatexNoteModal';

const NotesPage = () => {
  const { currentCourse, currentTopic, notes, fetchNotes, addNote, isLoading, error } = useCourseStore();
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (currentCourse && currentTopic) {
      fetchNotes(currentCourse.courseId, currentTopic.topicId);
    }
  }, [currentCourse, currentTopic, fetchNotes]);

  const handleSaveNote = async (title, content) => {
    await addNote(currentCourse.courseId, currentTopic.topicId, content, title);
    setModalOpen(false);
  };

  if (!currentCourse || !currentTopic) {
    return <div>Please select a course and topic.</div>;
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Notes for {currentTopic.name}</h2>
      {isLoading && <p>Loading notes...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <ul className="mb-6">
        {notes && notes.length > 0 ? (
          notes.map((note) => (
            <li key={note._id} className="mb-2 p-3 rounded bg-gray-100">
              <div className="font-semibold mb-1">{note.title}</div>
              <div className="prose max-w-none">
                {/* Render LaTeX if present */}
                <span>{note.content}</span>
              </div>
            </li>
          ))
        ) : (
          <li className="text-gray-400">No notes yet.</li>
        )}
      </ul>

      <button
        className="bg-black text-white px-4 py-2 rounded mb-4"
        onClick={() => setModalOpen(true)}
      >
        + Write a Note
      </button>

      <LatexNoteModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveNote}
      />
    </div>
  );
};

export default NotesPage;