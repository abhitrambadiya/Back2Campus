// controllers/internshipController.js
import AddInternship from '../../models/Internship.js';

// Create a new internship opportunity
export const createInternship = async (req, res) => {
  try {
    const {
      title,
      company,
      mode,
      duration,
      stipend,
      limit,
      description,
      prerequisites,
      requiredSkills,
      deadline,
      alumniName,
      alumniCompany,
      alumniPosition
    } = req.body;

    const deadlineDate = new Date(deadline);

if (!deadline || Number.isNaN(deadlineDate.getTime())) {
  return res.status(400).json({
    success: false,
    message: "Please provide a valid application deadline",
  });
}


    // Get the alumni ID from the authenticated user
    const alumniId = req.alumni._id;

    // Create the new internship
    const internship = new AddInternship({
      title,
      company,
      mode,
      duration,
      stipend,
      limit: parseInt(limit, 10),
      description,
      prerequisites,
      requiredSkills,
      deadline: deadlineDate,
      alumniId,
      alumniName,
      alumniCompany,
      alumniPosition,
      isApproved: false,
      isMarkAsComplete: false,
      participants: []
    });

    await internship.save();

    return res.status(201).json({
      success: true,
      message: 'Internship opportunity created successfully',
      data: internship
    });
  } catch (error) {
    console.error('Error creating internship:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create internship opportunity',
      error: error.message
    });
  }
};