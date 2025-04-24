// src/store/courseStore.js
import { create } from 'zustand';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const useCourseStore = create((set, get) => ({
  // State
  courses: [],
  currentCourse: null,
  currentTopic: null,
  currentTopicResources: [],
  isLoading: false,
  error: null,
  
  // Actions
  fetchCourses: async () => {
    set({ isLoading: true, error: null });
    console.log('[fetchCourses] Loading student courses...');
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE}/student/courses`, {
        headers: { 'x-auth-token': token }
      });
      set({ courses: response.data.courses, isLoading: false });
      localStorage.setItem('courses', JSON.stringify(response.data.courses));
      console.log('[fetchCourses] Courses loaded:', response.data.courses);
    } catch (error) {
      console.error('[fetchCourses] Error fetching courses:', error);
      set({ 
        error: error.response?.data?.message || 'Failed to fetch courses', 
        isLoading: false 
      });
    }
  },
  
  setCurrentCourse: (course) => {
    set({ 
      currentCourse: course,
      currentTopic: course?.topics?.length > 0 ? course.topics[0] : null
    });
  },
  
  // Set the current topic globally
  setCurrentTopic: (topic) => {
    set({ currentTopic: topic });
  },
  
  // Fetch course details including all topics and resources
  fetchCourseDetails: async (courseId) => {
    set({ isLoading: true, error: null });
    console.log('[fetchCourseDetails] Loading course details for:', courseId);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE}/student/courses/${courseId}`,
        { headers: { 'x-auth-token': token } }
      );
      // Only update if response is valid
      if (response.data && response.data.topics) {
        set({ 
          currentCourse: response.data,
          currentTopic: response.data.topics.length > 0 ? response.data.topics[0] : null,
          isLoading: false 
        });
        console.log('[fetchCourseDetails] Course loaded:', response.data);
      } else {
        set({ error: 'Invalid course data', isLoading: false });
        console.error('[fetchCourseDetails] Invalid course data:', response.data);
      }
    } catch (error) {
      console.error('[fetchCourseDetails] Error fetching course details:', error);
      set({ 
        error: error.response?.data?.message || 'Failed to fetch course details', 
        isLoading: false 
      });
    }
  },
  // Get resources of specific type for current topic (e.g., assignments)
  getResourcesByType: (type) => {
    const { currentTopic } = get();
    if (!currentTopic) return [];
    
    return currentTopic.resources.filter(resource => resource.type === type);
  },
  
  // Course assignments across all topics
  getCourseAssignments: () => {
    const { currentCourse } = get();
    if (!currentCourse?.topics) return [];
    
    let assignments = [];
    currentCourse.topics.forEach(topic => {
      const topicAssignments = topic.resources
        .filter(resource => resource.type === 'assignment')
        .map(assignment => ({
          ...assignment,
          topicName: topic.name,
          topicId: topic.topicId
        }));
      
      assignments = [...assignments, ...topicAssignments];
    });
    
    return assignments;
  },

  notes: [],
  fetchNotes: async (courseId, topicId) => {
    set({ isLoading: true, error: null });
    console.log('[fetchNotes] Loading notes for course:', courseId, 'topic:', topicId);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE}/student/courses/${courseId}/topics/${topicId}/notes`, {
        headers: { 'x-auth-token': token }
      });
      set({ notes: response.data.notes, isLoading: false });
      console.log('[fetchNotes] Notes loaded:', response.data.notes);
    } catch (error) {
      console.error('[fetchNotes] Error fetching notes:', error);
      set({ 
        error: error.response?.data?.message || 'Failed to fetch notes', 
        isLoading: false 
      });
    }
  },
  // Add note with title fallback
  addNote: async (courseId, topicId, content, title = 'Note') => {
    set({ isLoading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_BASE}/student/courses/${courseId}/topics/${topicId}/notes`,
        { title, content },
        { headers: { 'x-auth-token': token } }
      );
      // Refetch notes after adding
      await get().fetchNotes(courseId, topicId);
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to add note',
        isLoading: false,
      });
    }
  },
  // Assignments fetched from backend
  assignments: [],
  fetchAssignments: async (courseId) => {
    set({ isLoading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE}/student/courses/${courseId}/assignments`, {
        headers: { 'x-auth-token': token }
      });
      set({ assignments: response.data.assignments, isLoading: false });
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to fetch assignments',
        isLoading: false
      });
    }
  },
}));

export default useCourseStore;