import Event from '../../models/eventModel.js';

export const getConfirmedEvents = async (req, res) => {
  try {
    const events = await Event.find({ status: 'CONFIRMED' })
      .populate({
        path: 'approvedApplication',
        select: 'alumniDetails -_id'
      })
      .sort({ date: 1 });
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};