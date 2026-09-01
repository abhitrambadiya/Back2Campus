import Internship from '../../models/Internship.js';
import ApiResponse from '../../utils/apiResponse.js';

// Get all approved internships
export const getAllInternships = async (req, res, next) => {
 try {
    const { page = 1, limit = 3, location, search } = req.query;
    
    // Build query filters
    const query = {
      isApproved: true,
      isMarkAsComplete: false // Add this condition
    };
    
    if (location && location !== 'All') {
      query.location = location;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Fetch internships with pagination
    const internships = await Internship.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    
    const total = await Internship.countDocuments(query);
    const totalPages = Math.ceil(total / limit);
    
    res.json({
      success: true,
      data: internships,
      meta: {
        pagination: {
          pages: totalPages,
          currentPage: parseInt(page),
          total: total
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get single internship by ID
export const getInternshipById = async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id);
    
    if (!internship) {
      return res.status(404).json({ message: 'Internship not found' });
    }

    res.status(200).json(internship);
  } catch (error) {
    console.error('Error fetching internship:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Search internships by query parameters
export const searchInternships = async (req, res) => {
  try {
    const { query, location } = req.query;
    let searchQuery = { isApproved: true, isMarkAsComplete: false };
    
    if (query) {
      searchQuery.$or = [
        { title: { $regex: query, $options: 'i' } },
        { company: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ];
    }
    
    if (location && location !== 'All') {
      searchQuery.location = location;
    }
    
    const internships = await Internship.find(searchQuery);
    res.status(200).json(internships);
  } catch (error) {
    console.error('Error searching internships:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Track when a student clicks to apply (optional analytics)
export const trackApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const internship = await Internship.findById(id);
    
    if (!internship) {
      return res.status(404).json({ message: 'Internship not found' });
    }
    
    // Return the Google Form link for redirection
    res.status(200).json({ 
      googleFormLink: internship.googleFormLink,
      title: internship.title,
      company: internship.company
    });
  } catch (error) {
    console.error('Error tracking application:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getLocations = async (req, res, next) => {
  try {
    const locations = await Internship.distinct('location');
    res.json(ApiResponse.success('Locations retrieved successfully', locations));
  } catch (error) {
    next(error);
  }
};

export const internshipController = {
  getAllInternships,
  getInternshipById,
  searchInternships,
  trackApplication,
  getLocations
};