import Event from '../../models/eventModel.js';
import Application from '../../models/applicationModel.js';
import Alumni from '../../models/Alumni.js'; // Import the Alumni model

/**
 * @desc    Get all events available for application (status PENDING)
 * @route   GET /api/alumni/events/apply
 * @access  Alumni
 */
export const getPendingEvents = async (req, res) => {
  try {
    const events = await Event.find({ status: 'PENDING' }).sort({ date: 1 });
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Apply for an event
 * @route   POST /api/alumni/events/:id/apply
 * @access  Alumni (Protected)
 */
export const applyForEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const { description } = req.body; // Only need the description from the form

    // --- FIX: Get user details securely from the token (via 'protect' middleware) ---
    const alumni = await Alumni.findById(req.alumni._id);

    if (!alumni) {
      return res.status(404).json({ message: 'Alumni profile not found.' });
    }

    const event = await Event.findById(eventId);
    if (!event || event.status !== 'PENDING') {
      return res.status(404).json({ message: 'Event not available for application.' });
    }

    // --- NEW: Check if alumni has already applied for this event ---
    const existingApplication = await Application.findOne({
      event: eventId,
      'alumniDetails.email': alumni.email // Using email as unique identifier
    });

    if (existingApplication) {
      return res.status(400).json({ 
        message: 'You have already applied for this event.',
        applicationId: existingApplication._id
      });
    }

    // Create a new application with real user data
    const application = new Application({
      event: eventId,
      alumniDetails: {
        name: alumni.fullName,
        email: alumni.email,
        batch: alumni.passOutYear,
        description: description // The justification from the form
      }
    });
    await application.save();
    
    res.status(201).json({ message: 'Application submitted successfully', application });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};