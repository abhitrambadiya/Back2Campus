import AlumniMeet from '../../models/AlumniMeet.js';
import { sendEmailToRegisteredAlumni, sendTestEmail } from '../../services/email/alumniMeet.js';

// Middleware to verify admin authentication (placeholder)
// You should implement your real admin authentication logic here.
export const verifyAdmin = (req, res, next) => {
  // Example: Check if the user is authenticated and has an 'admin' role
  // if (req.user && req.user.role === 'admin') {
  //   next();
  // } else {
  //   res.status(403).json({ message: 'Forbidden: Admin access required' });
  // }
  next();
};

// CREATE - Add new alumni meet event
export const createAlumniMeet = async (req, res) => {
  try {
    const { eventName, date, time, venue, description, maxCapacity = 100 } = req.body;

    if (!eventName || !date || !time || !venue || !description) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const eventDate = new Date(date);
    if (eventDate < new Date().setHours(0, 0, 0, 0)) {
      return res.status(400).json({ message: 'Event date cannot be in the past' });
    }

    const newMeet = new AlumniMeet({
      eventName,
      date: eventDate,
      time,
      venue,
      description,
      maxCapacity,
      createdBy: req.admin?.id || 'admin_placeholder',
      registeredAlumni: []
    });

    const savedMeet = await newMeet.save();
    res.status(201).json({ message: 'Alumni meet event created successfully', event: savedMeet });
  } catch (error) {
    console.error('Error creating alumni meet:', error);
    res.status(500).json({ message: 'Failed to create alumni meet event', error: error.message });
  }
};

// READ - Get all alumni meets (upcoming and past)
export const getAllAlumniMeets = async (req, res) => {
  try {
    const currentDate = new Date();
    const upcomingMeets = await AlumniMeet.find({ date: { $gte: currentDate } }).sort({ date: 1 });
    const pastMeets = await AlumniMeet.find({ date: { $lt: currentDate } }).sort({ date: -1 });
    res.json({ upcomingMeets, pastMeets });
  } catch (error) {
    console.error('Error fetching alumni meets:', error);
    res.status(500).json({ message: 'Failed to fetch alumni meets', error: error.message });
  }
};

// READ - Get registered students for a specific event
export const getRegisteredAlumni = async (req, res) => {
  try {
    const { eventId } = req.params;
    const meet = await AlumniMeet.findById(eventId).populate('registeredAlumni.alumniId', 'fullName email passOutYear');
    
    if (!meet) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const registeredStudents = meet.registeredAlumni.map(reg => ({
      ...reg.alumniId.toObject(),
      registeredAt: reg.registeredAt
    }));

    res.json({
      eventName: meet.eventName,
      registeredCount: meet.registeredCount,
      registeredStudents
    });
  } catch (error) {
    console.error('Error fetching registered students:', error);
    res.status(500).json({ message: 'Failed to fetch registered students', error: error.message });
  }
};

export const registerForMeet = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { alumniId } = req.body;

    const meet = await AlumniMeet.findById(eventId);
    if (!meet) {
      return res.status(404).json({ message: 'Alumni meet not found' });
    }

    // Check if alumni is already registered
    const alreadyRegistered = meet.registeredAlumni.some(
      reg => reg.alumniId.toString() === alumniId
    );

    if (alreadyRegistered) {
      return res.status(400).json({ message: 'Already registered for this event' });
    }

    // Check capacity
    if (meet.registeredAlumni.length >= meet.maxCapacity) {
      return res.status(400).json({ message: 'Event is at full capacity' });
    }

    // Add alumni to registered list
    meet.registeredAlumni.push({ alumniId });
    await meet.save();

    res.status(200).json({ message: 'Successfully registered for the alumni meet' });
  } catch (error) {
    console.error('Error registering for meet:', error);
    res.status(500).json({ message: 'Failed to register for meet', error: error.message });
  }
};

// SEND EMAIL to all registered alumni
export const sendEmailToAlumni = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { subject, message, googleFormLink } = req.body;

    const meet = await AlumniMeet.findById(eventId).populate('registeredAlumni.alumniId', 'email');
    
    if (!meet) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Call the email service function
    const result = await sendEmailToRegisteredAlumni(meet, subject, message, googleFormLink);
    
    res.status(200).json(result);

  } catch (error) {
    console.error('ERROR IN CONTROLLER:', error);
    res.status(500).json({ message: 'Failed to send emails', error: error.message });
  }
};

// SEND TEST EMAIL
export const sendTestEmailController = async (req, res) => {
  try {
    const { testEmail, subject, message } = req.body;

    // Call the email service function
    const result = await sendTestEmail(testEmail, subject, message);
    
    res.status(200).json(result);

  } catch (error) {
    console.error('Error in test email controller:', error);
    res.status(500).json({ message: 'Failed to send test email', error: error.message });
  }
};

// DELETE - Delete an alumni meet event
export const deleteAlumniMeet = async (req, res) => {
  try {
    const { eventId } = req.params;

    // Find the alumni meet event
    const meet = await AlumniMeet.findById(eventId);
    
    if (!meet) {
      return res.status(404).json({ message: 'Alumni meet event not found' });
    }

    // Optional: Check if the event has registered alumni and warn
    if (meet.registeredAlumni.length > 0) {
      // You might want to add a query parameter like ?force=true to confirm deletion
      const { force } = req.query;
      
      if (!force) {
        return res.status(400).json({ 
          message: `Cannot delete event with ${meet.registeredAlumni.length} registered alumni. Use ?force=true to confirm deletion.`,
          registeredCount: meet.registeredAlumni.length
        });
      }
    }

    // Delete the event
    await AlumniMeet.findByIdAndDelete(eventId);

    res.status(200).json({ 
      message: 'Alumni meet event deleted successfully',
      deletedEvent: {
        id: meet._id,
        eventName: meet.eventName,
        date: meet.date
      }
    });

  } catch (error) {
    console.error('Error deleting alumni meet:', error);
    res.status(500).json({ message: 'Failed to delete alumni meet event', error: error.message });
  }
};

// DELETE - Remove an alumni from event registration
export const unregisterFromMeet = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { alumniId } = req.body;

    const meet = await AlumniMeet.findById(eventId);
    if (!meet) {
      return res.status(404).json({ message: 'Alumni meet not found' });
    }

    // Check if alumni is registered
    const registrationIndex = meet.registeredAlumni.findIndex(
      reg => reg.alumniId.toString() === alumniId
    );

    if (registrationIndex === -1) {
      return res.status(400).json({ message: 'Alumni is not registered for this event' });
    }

    // Remove alumni from registered list
    meet.registeredAlumni.splice(registrationIndex, 1);
    await meet.save();

    res.status(200).json({ 
      message: 'Successfully unregistered from the alumni meet',
      remainingRegistrations: meet.registeredAlumni.length
    });

  } catch (error) {
    console.error('Error unregistering from meet:', error);
    res.status(500).json({ message: 'Failed to unregister from meet', error: error.message });
  }
};
