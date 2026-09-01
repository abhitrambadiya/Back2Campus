import mongoose from 'mongoose';
import Internship from '../../models/Internship.js';
import Student from '../../models/Student.js';
import ApiResponse from '../../utils/apiResponse.js';

// Apply to internship
// Apply to internship
export const applyToInternship = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { internshipId } = req.params;
    const { email } = req.body;
    
    // Validate email
    if (!email) {
      await session.abortTransaction();
      return res.status(400).json(
        ApiResponse.error('Email is required')
      );
    }
    
    // Find the internship with session for atomic operation
    const internship = await Internship.findById(internshipId).session(session);
    
    if (!internship) {
      await session.abortTransaction();
      return res.status(404).json(
        ApiResponse.error('Internship not found')
      );
    }
    
    // Check if internship is approved and not completed
    if (!internship.isApproved) {
      await session.abortTransaction();
      return res.status(400).json(
        ApiResponse.error('This internship program is not available for applications')
      );
    }
    
    if (internship.isMarkedAsComplete) {
      await session.abortTransaction();
      return res.status(400).json(
        ApiResponse.error('This internship program has been completed')
      );
    }
    
    // Check if user already applied
    const existingApplication = internship.participants.find(
      participant => participant.email === email
    );
    
    if (existingApplication) {
      await session.abortTransaction();
      return res.status(400).json(
        ApiResponse.error('You have already applied for this internship program')
      );
    }
    
    // Check if internship has reached its limit (CRITICAL CHECK)
    const currentParticipants = internship.participants.length;
    const maxParticipants = internship.maxParticipants || internship.limit;
    
    if (currentParticipants >= maxParticipants) {
      await session.abortTransaction();
      return res.status(400).json(
        ApiResponse.error('This internship program has reached its maximum capacity')
      );
    }
    
    // Add participant to the internship
    internship.participants.push({ 
      email,
      appliedAt: new Date()
    });
    
    await internship.save({ session });
    await session.commitTransaction();
    
    res.json(
      ApiResponse.success('Application submitted successfully', {
        internshipId: internship._id,
        participantCount: internship.participants.length,
        maxParticipants: maxParticipants,
        spotsRemaining: maxParticipants - internship.participants.length
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


export const applicationInternshipController = {
  applyToInternship,
  validatePRN,
};