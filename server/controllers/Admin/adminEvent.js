import mongoose from 'mongoose';
import Event from '../../models/eventModel.js';
import Application from '../../models/applicationModel.js';
import { sendEventApprovalEmail } from '../../services/email/event.js';


// --- ADD THIS NEW FUNCTION ---
/**
 * @desc    Get all events
 * @route   GET /api/admin/events
 * @access  Admin
 */
export const getAllEvents = async (req, res) => {
  try {
    // Find all events and sort them by date in descending order
    const events = await Event.find({}).sort({ createdAt: -1 });
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Creates a new event
export const createEvent = async (req, res) => {
  try {
    const { name, type, date, time, venue, description } = req.body;
    const event = new Event({ name, type, date, time, venue, description });
    await event.save();
    res.status(201).json({ message: 'Event created successfully', event });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Gets all applications for a specific event
export const getApplicationsForEvent = async (req, res) => {
  try {
    const applications = await Application.find({ event: req.params.id });
    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Approves one application, confirms the event, and rejects other applications
export const approveApplication = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { id: applicationId } = req.params;
    const application = await Application.findById(applicationId).session(session);
    if (!application) throw new Error('Application not found.');

    application.status = 'approved';
    await application.save({ session });

    const eventId = application.event;
    const event = await Event.findByIdAndUpdate(eventId, { status: 'CONFIRMED', approvedApplication: applicationId }, { new: true, session });
    if (!event) throw new Error('Event not found.');

    await Application.updateMany({ event: eventId, _id: { $ne: applicationId } }, { $set: { status: 'rejected' } }, { session });
    await session.commitTransaction();

    const { name: alumniName, email: alumniEmail } = application.alumniDetails;
    await sendEventApprovalEmail(alumniEmail, alumniName, event);
    res.status(200).json({ message: 'Application approved and event confirmed.' });
  } catch (error) {
    await session.abortTransaction();
    console.error('Transaction aborted:', error);
    res.status(500).json({ message: 'Transaction failed', error: error.message });
  } finally {
    session.endSession();
  }
};

export const deleteEvent = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { id: eventId } = req.params;
    
    // Check if event exists
    const event = await Event.findById(eventId).session(session);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Delete all applications associated with this event
    await Application.deleteMany({ event: eventId }, { session });
    
    // Delete the event
    await Event.findByIdAndDelete(eventId).session(session);
    
    await session.commitTransaction();
    res.status(200).json({ message: 'Event and associated applications deleted successfully' });
    
  } catch (error) {
    await session.abortTransaction();
    console.error('Delete transaction failed:', error);
    res.status(500).json({ message: 'Failed to delete event', error: error.message });
  } finally {
    session.endSession();
  }
};

export const deleteApplication = async (req, res) => {
  try {
    const { id: applicationId } = req.params;
    
    const application = await Application.findByIdAndDelete(applicationId);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    res.status(200).json({ message: 'Application deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete application', error: error.message });
  }
};