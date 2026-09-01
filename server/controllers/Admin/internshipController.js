import Internship from '../../models/Internship.js';
import { generateInternshipEmailTemplate, sendInternshipEmails } from "../../services/email/sendInternshipEmail.js";

// Get all programs
export const getAllInternshipPrograms = async (req, res) => {
  try {
    const programs = await Internship.find();
    
    // Transform data to include only the required fields
    const transformedPrograms = programs.map(program => ({
      _id: program._id,
      title: program.title,
      companyName: program.company,
      description: program.description,
      mode: program.mode,
      location: program.location,
      duration: program.duration,
      stipend: program.stipend,
      limit: program.limit,
      deadline: program.deadline,
      prerequisites: program.prerequisites,
      requiredSkills: program.requiredSkills,
      alumniId: program.alumniId,
      alumniName: program.alumniName,
      alumniCompany: program.alumniCompany,
      alumniPosition: program.alumniPosition,
      isApproved: program.isApproved,
      isMarkAsComplete: program.isMarkAsComplete,
      participants: program.participants.map(p => p.email)
    }));

    res.status(200).json({
      success: true,
      count: transformedPrograms.length,
      data: transformedPrograms
    });
  } catch (error) {
    console.error('Error fetching programs:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Approve program
export const approveInternshipProgram = async (req, res) => {
  try {
    const program = await Internship.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    );

    if (!program) {
      return res.status(404).json({
        success: false,
        error: 'Program not found'
      });
    }

    // Transform for frontend compatibility with required fields
    const transformedProgram = {
      _id: program._id,
      title: program.title,
      companyName: program.company,
      description: program.description,
      mode: program.mode,
      location: program.location,
      duration: program.duration,
      stipend: program.stipend,
      limit: program.limit,
      deadline: program.deadline,
      prerequisites: program.prerequisites,
      requiredSkills: program.requiredSkills,
      alumniId: program.alumniId,
      alumniName: program.alumniName,
      alumniCompany: program.alumniCompany,
      alumniPosition: program.alumniPosition,
      isApproved: program.isApproved,
      isMarkAsComplete: program.isMarkAsComplete,
    };

    res.status(200).json({
      success: true,
      data: transformedProgram
    });
  } catch (error) {
    console.error('Error approving program:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Mark program as complete
export const markInternshipProgramComplete = async (req, res) => {
  try {
    const program = await Internship.findByIdAndUpdate(
      req.params.id,
      { isMarkAsComplete: true },
      { new: true }
    );

    if (!program) {
      return res.status(404).json({
        success: false,
        error: 'Program not found'
      });
    }

    // Transform for frontend compatibility with required fields
    const transformedProgram = {
      _id: program._id,
      title: program.title,
      companyName: program.company,
      description: program.description,
      mode: program.mode,
      location: program.location,
      duration: program.duration,
      stipend: program.stipend,
      limit: program.limit,
      deadline: program.deadline,
      prerequisites: program.prerequisites,
      requiredSkills: program.requiredSkills,
      alumniId: program.alumniId,
      alumniName: program.alumniName,
      alumniCompany: program.alumniCompany,
      alumniPosition: program.alumniPosition,
      isApproved: program.isApproved,
      isMarkAsComplete: program.isMarkAsComplete,
    };

    res.status(200).json({
      success: true,
      data: transformedProgram
    });
  } catch (error) {
    console.error('Error marking program complete:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Delete a program
export const deleteInternshipProgram = async (req, res) => {
  try {
    const program = await Internship.findByIdAndDelete(req.params.id);

    if (!program) {
      return res.status(404).json({
        success: false,
        error: 'Program not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Program deleted successfully'
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Send email to internship participants
// Send email to internship participants
export const sendEmailToInternshipParticipants = async (req, res) => {
  try {
    const { internshipId } = req.params;
    const { formUrl, subject } = req.body;

    // Validate required fields
    if (!formUrl) {
      return res.status(400).json({
        success: false,
        error: 'Google Form URL is required'
      });
    }

    // Find the internship
    const internship = await Internship.findById(internshipId);
    if (!internship) {
      return res.status(404).json({
        success: false,
        error: 'Internship not found'
      });
    }

    // Check if internship has participants
    if (!internship.participants || internship.participants.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No participants found for this internship'
      });
    }

    // Send emails using email service
    const emailResult = await sendInternshipEmails(
      internship.participants,
      internship,
      formUrl,
      subject
    );

    // Log the results
    console.log(`Email campaign completed for internship ${internship.title}:`);
    console.log(`Successful: ${emailResult.successful}, Failed: ${emailResult.failed}`);

    // Return response
    res.status(200).json({
      success: true,
      message: `Emails sent successfully to ${emailResult.successful} out of ${emailResult.totalRecipients} participants`,
      data: {
        internshipTitle: internship.title,
        totalParticipants: emailResult.totalRecipients,
        successful: emailResult.successful,
        failed: emailResult.failed,
        results: process.env.NODE_ENV === 'development' ? emailResult.results : undefined
      }
    });

  } catch (error) {
    console.error('Error sending emails:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send emails',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};