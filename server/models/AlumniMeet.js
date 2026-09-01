// models/admin/AlumniMeet.js (FIXED VERSION)
import mongoose from 'mongoose';

const alumniMeetSchema = new mongoose.Schema({
  eventName: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  venue: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  maxCapacity: {
    type: Number,
    default: 100
  },
  registeredAlumni: [{
    alumniId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Alumni',
      required: true
    },
    email: {
      type: String,
      required: true  // Added email field
    },
    registeredAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Virtual for registration count
alumniMeetSchema.virtual('registeredCount').get(function() {
  return this.registeredAlumni.length;
});

// Virtual to check if event is full
alumniMeetSchema.virtual('isFull').get(function() {
  return this.registeredAlumni.length >= this.maxCapacity;
});

// Virtual to check if event is past
alumniMeetSchema.virtual('isPast').get(function() {
  const eventDateTime = new Date(this.date);
  return eventDateTime < new Date();
});

// To include virtuals in JSON output
alumniMeetSchema.set('toJSON', { virtuals: true });
alumniMeetSchema.set('toObject', { virtuals: true });

const AlumniMeet = mongoose.model('AlumniMeet', alumniMeetSchema);
export default AlumniMeet;