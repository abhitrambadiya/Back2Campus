import mongoose from 'mongoose';
import Mentorship from '../../models/Mentorship.js';
import Student from '../../models/Student.js';
import ApiResponse from '../../utils/apiResponse.js';

// Apply to mentorship
// Apply to mentorship
export const applyToMentorship = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { mentorshipId } = req.params;
    const { email } = req.body;
    
    // Validate email
    if (!email) {
      await session.abortTransaction();
      return res.status(400).json(
        ApiResponse.error('Email is required')
      );
    }
    
    // Find the mentorship with session for atomic operation
    const mentorship = await Mentorship.findById(mentorshipId).session(session);
    
    if (!mentorship) {
      await session.abortTransaction();
      return res.status(404).json(
        ApiResponse.error('Mentorship not found')
      );
    }
    
    // Check if mentorship is approved and not completed
    if (!mentorship.isApproved) {
      await session.abortTransaction();
      return res.status(400).json(
        ApiResponse.error('This mentorship program is not available for applications')
      );
    }
    
    if (mentorship.isMarkedAsComplete) {
      await session.abortTransaction();
      return res.status(400).json(
        ApiResponse.error('This mentorship program has been completed')
      );
    }
    
    // Check if user already applied
    const existingApplication = mentorship.participants.find(
      participant => participant.email === email
    );
    
    if (existingApplication) {
      await session.abortTransaction();
      return res.status(400).json(
        ApiResponse.error('You have already applied for this mentorship program')
      );
    }
    
    // Check if mentorship has reached its limit (CRITICAL CHECK)
    const currentParticipants = mentorship.participants.length;
    const maxParticipants = mentorship.maxParticipants || mentorship.limit;
    
    if (currentParticipants >= maxParticipants) {
      await session.abortTransaction();
      return res.status(400).json(
        ApiResponse.error('This mentorship program has reached its maximum capacity')
      );
    }
    
    // Add participant to the mentorship
    mentorship.participants.push({ 
      email,
      appliedAt: new Date()
    });
    
    await mentorship.save({ session });
    await session.commitTransaction();
    
    res.json(
      ApiResponse.success('Application submitted successfully', {
        mentorshipId: mentorship._id,
        participantCount: mentorship.participants.length,
        maxParticipants: maxParticipants,
        spotsRemaining: maxParticipants - mentorship.participants.length
      })
    );
    
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

// Validate PRN and return student details
export const validatePRN = async (req, res, next) => {
  try {
    const { prn } = req.body; // ✅ This is correct
    
    if (!prn) {
      return res.status(400).json(
        ApiResponse.error('PRN is required')
      );
    }
    
    // Find student by PRN
    const student = await Student.findOne({ prn: prn });
    
    if (!student) {
      return res.status(404).json(
        ApiResponse.error('Invalid PRN. Student not found.')
      );
    }
    
    // Return student data
    res.json(ApiResponse.success('PRN validated successfully', {
      fullName: student.fullName,
      department: student.department,
      studyYear: student.studyYear,
      email: student.email
    }));
  } catch (error) {
    next(error);
  }
};


export const applicationController = {
  applyToMentorship,
  validatePRN,
};