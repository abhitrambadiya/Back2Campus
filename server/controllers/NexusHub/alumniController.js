// controllers/alumniController.js
import Alumni from '../../models/Alumni.js';

// Get all alumni with pagination
export const getAllAlumni = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const skip = (page - 1) * limit;
    
    // Filter parameters
    const searchQuery = req.query.search || '';
    const departmentFilter = req.query.department || '';
    const passOutYearFilter = req.query.passOutYear || '';
    
    // Build query object
    let query = {};
    
    // Apply search filter
    if (searchQuery) {
      query.$or = [
        { fullName: { $regex: searchQuery, $options: 'i' } },
        { companyName: { $regex: searchQuery, $options: 'i' } },
        { jobPosition: { $regex: searchQuery, $options: 'i' } },
        { location: { $regex: searchQuery, $options: 'i' } },
        { successStory: { $regex: searchQuery, $options: 'i' } }
      ];
    }
    
    // Apply department filter
    if (departmentFilter && departmentFilter !== 'All') {
      query.department = departmentFilter;
    }
    
    // Apply pass out year filter
    if (passOutYearFilter) {
      if (passOutYearFilter === 'Before 2019') {
        query.passOutYear = { $lt: 2019 };
      } else if (passOutYearFilter !== 'All') {
        query.passOutYear = parseInt(passOutYearFilter);
      }
    }
    
    // Get filtered alumni with pagination
    const alumni = await Alumni.find(query)
      .sort({ passOutYear: -1 })
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination
    const totalAlumni = await Alumni.countDocuments(query);
    
    res.status(200).json({
      success: true,
      totalAlumni,
      totalPages: Math.ceil(totalAlumni / limit),
      currentPage: page,
      alumni
    });
  } catch (error) {
    console.error('Error fetching alumni:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Create new alumni
export const createAlumni = async (req, res) => {
  try {
    const alumni = await Alumni.create(req.body);
    res.status(201).json({
      success: true,
      data: alumni
    });
  } catch (error) {
    console.error('Error creating alumni:', error);
    res.status(400).json({ 
      success: false, 
      message: 'Invalid data', 
      error: error.message 
    });
  }
};

// Get single alumni by ID
export const getAlumni = async (req, res) => {
  try {
    const alumni = await Alumni.findById(req.params.id);
    
    if (!alumni) {
      return res.status(404).json({
        success: false,
        message: 'Alumni not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: alumni
    });
  } catch (error) {
    console.error('Error fetching alumni:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Update alumni
export const updateAlumni = async (req, res) => {
  try {
    const alumni = await Alumni.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    if (!alumni) {
      return res.status(404).json({
        success: false,
        message: 'Alumni not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: alumni
    });
  } catch (error) {
    console.error('Error updating alumni:', error);
    res.status(400).json({ 
      success: false, 
      message: 'Invalid data', 
      error: error.message 
    });
  }
};

// Delete alumni
export const deleteAlumni = async (req, res) => {
  try {
    const alumni = await Alumni.findByIdAndDelete(req.params.id);
    
    if (!alumni) {
      return res.status(404).json({
        success: false,
        message: 'Alumni not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Alumni deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting alumni:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};