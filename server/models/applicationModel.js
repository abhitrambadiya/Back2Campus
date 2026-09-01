import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  alumniDetails: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    batch: { type: String, required: true },
    description: { type: String, required: true },
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  }
}, { timestamps: true });

export default mongoose.model('Application', applicationSchema);
