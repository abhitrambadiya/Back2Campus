import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  venue: { type: String, required: true },
  description: { type: String, required: true },
  status: {
    type: String,
    enum: ['PENDING', 'CONFIRMED', 'CANCELLED'],
    default: 'PENDING'
  },
  approvedApplication: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    default: null
  }
}, { timestamps: true });

export default mongoose.model('Event', eventSchema);