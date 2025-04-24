import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const backdropVariants = {
  visible: { opacity: 1 },
  hidden: { opacity: 0 }
};

const modalVariants = {
  hidden: { y: '-100vh', opacity: 0 },
  visible: {
    y: '0',
    opacity: 1,
    transition: { delay: 0.1, type: 'spring', stiffness: 200 }
  },
  exit: { y: '100vh', opacity: 0 }
};

const AssignmentModal = ({ isOpen, onClose, assignment }) => {
  if (!assignment) return null;
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-40 bg-black bg-opacity-40 flex items-center justify-center"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full relative"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={e => e.stopPropagation()}
          >
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-black text-xl font-bold"
              onClick={onClose}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-2">{assignment.title}</h2>
            <div className="mb-2 text-gray-600">
              <span className="font-semibold">Due:</span> {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'N/A'}
            </div>
            <div className="mb-4 text-gray-800">
              <span className="font-semibold">Description:</span> {assignment.description}
            </div>
            <div className="mb-4 text-gray-800">
              <span className="font-semibold">Instructions:</span>
              <div className="mt-1 whitespace-pre-line text-gray-700">{assignment.instructions}</div>
            </div>
            <div className="flex gap-2 mt-4">
              <a
                href={assignment.link || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm"
              >
                View Assignment
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AssignmentModal;
