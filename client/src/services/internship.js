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

// API service for internships
export const internshipService = {
  // Get internships with pagination and filtering
  getInternships: async (page = 1, limit = 3, filters = {}) => {
  try {
     const { location, search, mode } = filters;
    
    // Build query string
    let queryParams = `?page=${page}&limit=${limit}`;
    if (location && location !== 'All') queryParams += `&location=${location}`;
    if (search) queryParams += `&search=${search}`;
    if (mode) queryParams += `&mode=${mode}`;
    
    const response = await api.get(`/nexushub/internships${queryParams}`);
    
    // Process the response to ensure participant data is properly structured
    if (response.data && response.data.success && response.data.data) {
      const internships = response.data.data.map(internship => ({
        ...internship,
        participants: internship.participants || [], // Ensure participants array exists
        currentParticipants: internship.participants?.length || 0,
        maxParticipants: internship.maxParticipants || internship.limit,
        spotsRemaining: (internship.maxParticipants || internship.limit) - (internship.participants?.length || 0)
      }));
      
      return {
        ...response.data,
        data: internships
      };
    }
    
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
},
  
  // Get single internship by ID
  getInternshipById: async (id) => {
    try {
      const response = await api.get(`/nexushub/internships/${id}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  // Get available departments for filtering
  getLocations: async () => {
  try {
    const response = await api.get('/nexushub/internships/metadata/location');
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}
};

// API service for applications
export const applicationService = {
  // Update this method to work with internship applications
  applyToInternship: async (internshipId, applicationData) => {
    try {
      const response = await fetch(`${API_URL}/nexushub/applications/internships/${internshipId}/apply`, {
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
