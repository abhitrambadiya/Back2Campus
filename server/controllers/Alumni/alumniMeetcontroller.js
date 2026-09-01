import AlumniMeet from '../../models/AlumniMeet.js';

export const getUpcomingMeets = async (req, res) => {
    try {
    const events = await AlumniMeet.find({
      date: { $gte: new Date() } // Only upcoming events
    }).sort({ date: 1 }); // Sort by date ascending

    // Transform the data to match frontend expectations
    const transformedEvents = events.map(event => ({
      id: event._id,
      eventName: event.eventName,
      date: event.date,
      time: event.time,
      venue: event.venue,
      description: event.description,
      organizer: event.organizer,
      maxCapacity: event.maxCapacity,
      registeredCount: event.registeredAlumni.length,
      registeredAlumni: event.registeredAlumni,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt
    }));

    res.status(200).json(transformedEvents);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch events' 
    });
  }
}

export const registerEvent = async (req, res) => {
    try {
    const { eventId } = req.params;
    const alumni = req.alumni; // From authentication middleware

    // Find the event
    const event = await AlumniMeet.findById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if event is in the past
    const eventDate = new Date(event.date);
    const now = new Date();
    if (eventDate < now) {
      return res.status(400).json({
        success: false,
        message: 'Cannot register for past events'
      });
    }

    // Check if event is full
    if (event.registeredAlumni.length >= event.maxCapacity) {
      return res.status(400).json({
        success: false,
        message: 'Event is full. Registration closed.'
      });
    }

    // Check if alumni is already registered
    const isAlreadyRegistered = event.registeredAlumni.some(
      registration => registration.alumniId.toString() === alumni._id.toString()
    );

    if (isAlreadyRegistered) {
      return res.status(400).json({
        success: false,
        message: 'You are already registered for this event'
      });
    }

    // Add alumni to registered list
    event.registeredAlumni.push({
      alumniId: alumni._id,
      email: alumni.email,
      registeredAt: new Date()
    });

    // Update the updatedAt field
    event.updatedAt = new Date();

    // Save the event
    await event.save();

    // Return updated event data
    const updatedEvent = {
      id: event._id,
      eventName: event.eventName,
      date: event.date,
      time: event.time,
      venue: event.venue,
      description: event.description,
      organizer: event.organizer,
      maxCapacity: event.maxCapacity,
      registeredCount: event.registeredAlumni.length,
      registeredAlumni: event.registeredAlumni,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt
    };

    res.status(200).json({
      success: true,
      message: `Successfully registered for "${event.eventName}"`,
      event: updatedEvent
    });

  } catch (error) {
    console.error('Error registering for event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register for event. Please try again.'
    });
  }
}

export const getAlumniList = async (req, res) => {
    try {
    const alumni = req.alumni;

    // Find all events where this alumni is registered
    const registeredEvents = await AlumniMeet.find({
      'registeredAlumni.alumniId': alumni._id
    }).sort({ date: 1 });

    // Transform the data
    const transformedEvents = registeredEvents.map(event => ({
      id: event._id,
      eventName: event.eventName,
      date: event.date,
      time: event.time,
      venue: event.venue,
      description: event.description,
      organizer: event.organizer,
      maxCapacity: event.maxCapacity,
      registeredCount: event.registeredAlumni.length,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt
    }));

    res.status(200).json(transformedEvents);
  } catch (error) {
    console.error('Error fetching registered events:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch registered events'
    });
  }
}

export const deleteMeet = async (req, res) => {
    try {
    const { eventId } = req.params;
    const alumni = req.alumni;

    // Find the event
    const event = await AlumniMeet.findById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if event is in the past
    const eventDate = new Date(event.date);
    const now = new Date();
    if (eventDate < now) {
      return res.status(400).json({
        success: false,
        message: 'Cannot unregister from past events'
      });
    }

    // Check if alumni is registered
    const registrationIndex = event.registeredAlumni.findIndex(
      registration => registration.alumniId.toString() === alumni._id.toString()
    );

    if (registrationIndex === -1) {
      return res.status(400).json({
        success: false,
        message: 'You are not registered for this event'
      });
    }

    // Remove alumni from registered list
    event.registeredAlumni.splice(registrationIndex, 1);
    event.updatedAt = new Date();

    // Save the event
    await event.save();

    res.status(200).json({
      success: true,
      message: `Successfully unregistered from "${event.eventName}"`
    });

  } catch (error) {
    console.error('Error unregistering from event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unregister from event. Please try again.'
    });
  }
}