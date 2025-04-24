import React, { useEffect, useState } from 'react';
import useCourseStore from '../../store/courseStore';
import AssignmentModal from '../../components/AssignmentModal';

const AssignmentsPage = () => {
  const {
    currentCourse,
    fetchCourseDetails,
    assignments,
    fetchAssignments,
    isLoading,
    error
  } = useCourseStore();

  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (!currentCourse) {
      const courses = JSON.parse(localStorage.getItem('courses'));
      if (courses && courses.length > 0) {
        fetchCourseDetails(courses[0].courseId || courses[0].id || courses[0]._id);
      }
    } else {
      fetchAssignments(currentCourse.courseId || currentCourse.id || currentCourse._id);
    }
    // eslint-disable-next-line
  }, [currentCourse]);

  if (!currentCourse) {
    return <div className="p-4">Loading course...</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Assignments for {currentCourse.title || currentCourse.name}</h2>
      {isLoading && <p>Loading assignments...</p>}
      {error && <p className="text-red-500">{error}</p>}
      <ul className="space-y-4">
        {assignments && assignments.length > 0 ? (
          assignments.map((assignment) => (
            <li
              key={assignment._id || assignment.id}
              className="p-4 bg-white rounded shadow cursor-pointer hover:bg-blue-50 transition-all"
              onClick={() => {
                setSelectedAssignment(assignment);
                setModalOpen(true);
              }}
            >
              <div className="flex justify-between items-center mb-2">
                <div>
                  <span className="font-semibold text-lg">{assignment.title}</span>
                </div>
                <span className="text-sm text-gray-700">Due: {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div className="mb-2 text-gray-800 line-clamp-2">{assignment.description || 'No description provided.'}</div>
              <div className="flex gap-2">
                <span className="text-xs bg-gray-200 rounded px-2 py-1">Click for details</span>
              </div>
            </li>
          ))
        ) : (
          <li className="text-gray-400">No assignments found for this course.</li>
        )}
      </ul>
      <AssignmentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        assignment={selectedAssignment}
      />
    </div>
  );
};

export default AssignmentsPage;