import Mentorship from '../../models/Mentorship.js';
import { generateMentorshipEmailTemplate, sendMentorshipEmails } from "../../services/email/sendMentorshipEmail.js";

// Get all programs
export const getAllPrograms = async (req, res) => {
  try {
    const programs = await Mentorship.find();
    
    // Transform data to include only the required fields
    const transformedPrograms = programs.map(program => ({
      _id: program._id,
      title: program.title,
      description: program.description,
      fullName: program.fullName,
      jobPosition: program.jobPosition,
      companyName: program.companyName,
      mode: program.mode,
      date: program.date,
      targetAudience: program.targetAudience,
      studyYear: program.studyYear,
      department: program.department,
      limit: program.limit,
      isApproved: program.isApproved,
      isMarkedAsComplete: program.isMarkedAsComplete,
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
export const approveProgram = async (req, res) => {
  try {
    const program = await Mentorship.findByIdAndUpdate(
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
      description: program.description,
      fullName: program.fullName,
      jobPosition: program.jobPosition,
      companyName: program.companyName,
      mode: program.mode,
      date: program.date,
      targetAudience: program.targetAudience,
      studyYear: program.studyYear,
      department: program.department,
      limit: program.limit,
      isApproved: program.isApproved,
      isMarkedAsComplete: program.isMarkedAsComplete
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
export const markProgramComplete = async (req, res) => {
  try {
    const program = await Mentorship.findByIdAndUpdate(
      req.params.id,
      { isMarkedAsComplete: true },
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
      description: program.description,
      fullName: program.fullName,
      jobPosition: program.jobPosition,
      companyName: program.companyName,
      mode: program.mode,
      date: program.date,
      targetAudience: program.targetAudience,
      studyYear: program.studyYear,
      department: program.department,
      limit: program.limit,
      isApproved: program.isApproved,
      isMarkedAsComplete: program.isMarkedAsComplete
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
export const deleteProgram = async (req, res) => {
  try {
    const program = await Mentorship.findByIdAndDelete(req.params.id);

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

// Send email to mentorship participants
// Send email to mentorship participants
export const sendEmailToParticipants = async (req, res) => {
  try {
    const { mentorshipId } = req.params;
    const { formUrl, subject } = req.body;

    // Validate required fields
    if (!formUrl) {
      return res.status(400).json({
        success: false,
        error: 'Google Form URL is required'
      });
    }

    // Find the mentorship
    const mentorship = await Mentorship.findById(mentorshipId);
    if (!mentorship) {
      return res.status(404).json({
        success: false,
        error: 'Mentorship not found'
      });
    }

    // Check if mentorship has participants
    if (!mentorship.participants || mentorship.participants.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No participants found for this mentorship'
      });
    }

    // Send emails using email service
    const emailResult = await sendMentorshipEmails(
      mentorship.participants,
      mentorship,
      formUrl,
      subject
    );

    // Log the results
    console.log(`Email campaign completed for mentorship ${mentorship.title}:`);
    console.log(`Successful: ${emailResult.successful}, Failed: ${emailResult.failed}`);

    // Return response
    res.status(200).json({
      success: true,
      message: `Emails sent successfully to ${emailResult.successful} out of ${emailResult.totalRecipients} participants`,
      data: {
        mentorshipTitle: mentorship.title,
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