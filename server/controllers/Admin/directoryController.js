import Alumni from '../../models/Alumni.js';

export const adminDirectory = async (req, res) => {
  try {
    const directory = await Alumni.find(
      {}, // No filter – fetch all alumni
      {
        _id: 1, // Include _id for featured functionality
        fullName: 1,
        email: 1,
        prn: 1,
        department: 1,
        passOutYear: 1,
        jobPosition: 1,
        companyName: 1,
        location: 1,
        latitude: 1,
        longitude: 1,
        successStory: 1,
        linkedInURL: 1,
        phoneNumber: 1,
        skills: 1,
        role: 1,
        specialAchievements: 1,
        hallOfFame: 1, // Include hallOfFame field
        isVerified: 1,
        createdAt: 1,
        updatedAt: 1
      }
    );

    // Map the results to include id field for frontend compatibility
    const directoryWithIds = directory.map(alumni => ({
      ...alumni.toObject(),
      id: alumni._id.toString(), // Add id field for frontend
      hallOfFame: alumni.hallOfFame || false // Ensure hallOfFame defaults to false
    }));

    res.json(directoryWithIds);
  } catch (error) {
    console.error('Error fetching admin directory:', error);
    res.status(500).json({ error: "Failed to fetch directory" });
  }
};

// New function to update featured status
export const updateFeaturedStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { hallOfFame } = req.body;

    // Validate the hallOfFame value
    if (typeof hallOfFame !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'hallOfFame must be a boolean value'
      });
    }

    // Find and update the alumni record
    const updatedAlumni = await Alumni.findByIdAndUpdate(
      id,
      { 
        hallOfFame: hallOfFame,
        updatedAt: new Date() // Update the timestamp
      },
      { new: true, runValidators: true }
    );

    if (!updatedAlumni) {
      return res.status(404).json({
        success: false,
        message: 'Alumni not found'
      });
    }

    res.status(200).json({
      success: true,
      message: `Alumni ${hallOfFame ? 'added to' : 'removed from'} Hall of Fame successfully`,
      data: {
        id: updatedAlumni._id.toString(),
        fullName: updatedAlumni.fullName,
        hallOfFame: updatedAlumni.hallOfFame
      }
    });

  } catch (error) {
    console.error('Error updating featured status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};