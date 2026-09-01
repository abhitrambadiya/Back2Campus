import mongoose from 'mongoose';

const donationSchema = new mongoose.Schema({
  alumniName: {
    type: String,
    required: true
  },
  alumniEmail: {
    type: String,
    required: true
  },
  alumniCompany: {
    type: String,
    default: ''
  },
  alumniPosition: {
    type: String,
    default: ''
  },
  amount: {
    type: Number,
    required: true,
    min: 100 // Minimum donation amount
  },
  purpose: {
    type: String,
    required: true,
    enum: ['infrastructure', 'scholarship', 'research', 'library', 'sports', 'events', 'general']
  },
  message: {
    type: String,
    default: ''
  },
  anonymous: {
    type: Boolean,
    default: false
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['online', 'cheque']
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  paymentId: {
    type: String,
    default: ''
  },
  transactionId: {
    type: String,
    default: ''
  },
  donationDate: {
    type: Date,
    default: Date.now
  },
  processedDate: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for better query performance
donationSchema.index({ alumniEmail: 1, status: 1 });
donationSchema.index({ donationDate: -1 });
donationSchema.index({ purpose: 1 });

export default mongoose.model('Donation', donationSchema);
