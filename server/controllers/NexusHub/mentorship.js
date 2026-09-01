import Mentorship from '../../models/Mentorship.js';
import ApiResponse from '../../utils/apiResponse.js';

// Get mentorships with pagination, filtering and search
// Get mentorships with pagination, filtering and search
export const getMentorships = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 3, 
      department, 
      studyYear,
      search,
      mode
    } = req.query;
    
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    
    // Build query object
    const query = {
      isApproved: true,
      isMarkedAsComplete: false // Add this condition
    };
    
    // Add filters if provided
    if (department && department !== 'All') query.department = department;
    if (studyYear) query.studyYear = studyYear;
    if (mode) query.mode = mode;
    
    // Add text search if provided
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { targetAudience: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Calculate skip for pagination
    const skip = (pageNum - 1) * limitNum;
    
    // Execute query
    const mentorships = await Mentorship.find(query)
      .select('-participants.justification') // Exclude detailed participant data
      .sort({ date: -1 }) // Sort by date descending
      .skip(skip)
      .limit(limitNum);
    
    // Get total count for pagination
    const total = await Mentorship.countDocuments(query);
    
    // Transform mentorship data to include limit virtual
    const formattedMentorships = mentorships.map(mentorship => {
      const mentorshipObj = mentorship.toObject({ virtuals: true });
      return mentorshipObj;
    });
    
    // Send response with pagination metadata
    res.json(ApiResponse.success('Mentorships retrieved successfully', formattedMentorships, {
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      }
    }));
  } catch (error) {
    next(error);
  }
};

// Get single mentorship by ID
export const getMentorshipById = async (req, res, next) => {
  try {
    const mentorship = await Mentorship.findById(req.params.id);
    
    if (!mentorship) {
      return res.status(404).json(
        ApiResponse.error('Mentorship not found')
      );
    }
    
    res.json(ApiResponse.success(
      'Mentorship retrieved successfully',
      mentorship.toObject({ virtuals: true })
    ));
  } catch (error) {
    next(error);
  }
};

// Create new mentorship
export const createMentorship = async (req, res, next) => {
  try {
    const { 
      title, description, targetAudience, studyYear, department,
      fullName, jobPosition, companyName, date, limit, mode 
    } = req.body;
    
    const mentorship = new Mentorship({
      title,
      description,
      targetAudience,
      studyYear,
      department,
      fullName,
      jobPosition,
      companyName,
      date,
      limit,
      mode,
      participants: []
    });
    
    await mentorship.save();
    
    res.status(201).json(
      ApiResponse.success('Mentorship created successfully', mentorship.toObject({ virtuals: true }))
    );
  } catch (error) {
    next(error);
  }
};

// Get available departments (for filters)
export const getDepartments = async (req, res, next) => {
  try {
    const departments = await Mentorship.distinct('department');
    res.json(ApiResponse.success('Departments retrieved successfully', departments));
  } catch (error) {
    next(error);
  }
};

// Get available study years (for filters)
export const getStudyYears = async (req, res, next) => {
  try {
    const studyYears = await Mentorship.distinct('studyYear');
    res.json(ApiResponse.success('Study years retrieved successfully', studyYears));
  } catch (error) {
    next(error);
  }
};

export const mentorshipController = {
  getMentorships,
  createMentorship,
  getMentorshipById,
  getDepartments,
  getStudyYears,
};