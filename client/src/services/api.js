// src/services/api.js
import axios from 'axios';

// Create axios instance with base URL and default headers
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// API service for mentorships
export const mentorshipService = {
  // Get mentorships with pagination and filtering
  getMentorships: async (page = 1, limit = 3, filters = {}) => {
  try {
    const { department, studyYear, search, mode } = filters;
    
    // Build query string
    let queryParams = `?page=${page}&limit=${limit}`;
    if (department && department !== 'All') queryParams += `&department=${department}`;
    if (studyYear) queryParams += `&studyYear=${studyYear}`;
    if (search) queryParams += `&search=${search}`;
    if (mode) queryParams += `&mode=${mode}`;
    
    const response = await api.get(`/nexushub/mentorships${queryParams}`);
    
    // Process the response to ensure participant data is properly structured
    if (response.data && response.data.success && response.data.data) {
      const mentorships = response.data.data.map(mentorship => ({
        ...mentorship,
        participants: mentorship.participants || [], // Ensure participants array exists
        currentParticipants: mentorship.participants?.length || 0,
        maxParticipants: mentorship.maxParticipants || mentorship.limit,
        spotsRemaining: (mentorship.maxParticipants || mentorship.limit) - (mentorship.participants?.length || 0)
      }));
      
      return {
        ...response.data,
        data: mentorships
      };
    }
    
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
},
  
  // Get single mentorship by ID
  getMentorshipById: async (id) => {
    try {
      const response = await api.get(`/nexushub/mentorships/${id}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  // Get available departments for filtering
  getDepartments: async () => {
    try {
      const response = await api.get('/nexushub/mentorships/metadata/departments');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  // Get available study years for filtering
  getStudyYears: async () => {
    try {
      const response = await api.get('/nexushub/mentorships/metadata/studyyears');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
};

// API service for applications
export const applicationService = {
  // Update this method to work with mentorship applications
  applyToMentorship: async (mentorshipId, applicationData) => {
    try {
      const response = await fetch(`${API_URL}/nexushub/applications/mentorships/${mentorshipId}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(applicationData),
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error('Failed to submit application');
    }
  },

  // Keep the validatePRN method if you still need it for other purposes
  // In your applicationService
// In your api.js - make sure it looks like this:
validatePRN: async (prn) => {
  try {
    const response = await fetch(`${API_URL}/nexushub/applications/validate-prn`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prn }),
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error('Failed to validate PRN');
  }
},
};

// Error handler function
const handleApiError = (error) => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    return {
      success: false,
      message: error.response.data.message || 'An error occurred',
      status: error.response.status,
      data: error.response.data
    };
  } else if (error.request) {
    // The request was made but no response was received
    return {
      success: false,
      message: 'No response from server. Please check your internet connection.',
      status: 0
    };
  } else {
    // Something happened in setting up the request that triggered an Error
    return {
      success: false,
      message: error.message || 'An unknown error occurred',
      status: 0
    };
  }
};

export default api;
