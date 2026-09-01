import mongoose from 'mongoose';
import { Schema } from 'mongoose';

// The consolidated sub-schema for a participant application
// Combines the best from files 2 and 3
const participantSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true
  }
}, { _id: true });

const mentorshipSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    index: true // From file 3
  },
  description: {
    type: String,
    required: true
  },
  targetAudience: {
    type: String,
    required: true,
    index: true // From file 3
  },
  // Mapped to alumni fields for consistency
  alumniId: {
    type: Schema.Types.ObjectId,
    ref: 'Alumni',
    required: true
  },
  fullName: {
    type: String,
    required: true,
    index: true // From file 3
  },
  companyName: {
    type: String,
    required: true
  },
  jobPosition: {
    type: String,
    required: true
  },
  date: { // Represents the start date or event date
    type: Date,
    required: true
  },
  // Program Details
  mode: {
    type: String,
    enum: ['Online', 'Offline', 'Hybrid'], // From file 3
    required: true
  },
  limit: {
    type: Number,
    required: true,
    min: 1
  },
  studyYear: {
    type: String,
    required: true,
    index: true // From file 3
  },
  department: {
    type: String,
    required: true,
    index: true // From file 3
  },
  // Status flags
  isApproved: {
    type: Boolean,
    required: true, // From file 3, more robust
    default: false,
    index: true // From file 3
  },
  isMarkedAsComplete: {
    type: Boolean,
    default: false
  },
  // Array of participants using the consolidated sub-schema
  participants: [participantSchema],
}, {
  // Common Schema Options
  timestamps: true, // Auto-manages createdAt and updatedAt
  collection: 'mentorships', // Explicitly set the collection name
  toJSON: { virtuals: true }, // Enable virtuals in JSON output
  toObject: { virtuals: true } // Enable virtuals in Object output
});

// --- Indexes from File 3 ---
// Add compound text index for searching across multiple fields
mentorshipSchema.index({
  title: 'text',
  description: 'text',
  targetAudience: 'text'
});

// --- Virtual Properties from File 3 ---
mentorshipSchema.virtual('currentParticipants').get(function() {
  return this.participants.length;
});

mentorshipSchema.virtual('limitParsed').get(function() {
  return `${this.participants.length}/${this.limit}`;
});

mentorshipSchema.virtual('isFull').get(function() {
  return this.participants.length >= this.limit;
});

const Mentorship = mongoose.model('Mentorship', mentorshipSchema);

export default Mentorship;