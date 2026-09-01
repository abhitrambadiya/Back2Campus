import mongoose from 'mongoose';
import Details from '../../models/Alumni.js';

export const getHallOfFame = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 12, 
      department = 'All', 
      search = ''
    } = req.query;

    // Only fetch featured alumni (hallOfFame: true)
    const query = {
      hallOfFame: true
    };

    // Department filter
    if (department && department !== 'All') {
      query.department = department.toUpperCase();
    }

    // Search filter
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { jobPosition: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } },
        { specialAchievements: { $regex: search, $options: 'i' } }
      ];
    }

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      select: 'fullName department passOutYear jobPosition companyName hallOfFame specialAchievements profilePhoto',
      sort: { 
        passOutYear: -1,
        fullName: 1
      },
      lean: true
    };

    const result = await Details.paginate(query, options);

    const response = {
      alumni: result.docs,
      pagination: {
        totalItems: result.totalDocs,
        totalPages: Math.ceil(result.totalDocs / options.limit),
        currentPage: result.page,
        itemsPerPage: result.limit,
        hasNextPage: result.hasNextPage,
        hasPrevPage: result.hasPrevPage
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching Hall of Fame:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch Hall of Fame data',
      error: error.message 
    });
  }
};