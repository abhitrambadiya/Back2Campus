import mongoose from 'mongoose';
import { Schema } from 'mongoose';

// The sub-schema for a participant
const participantSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true
  }
}, { _id: true });


const internshipSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true // From File 2
  },
  company: {
    type: String,
    required: true,
    trim: true // From File 2
  },
  description: {
    type: String,
    required: true
  },
  // Combination of mode and location for a more complete picture
  mode: {
    type: String,
    required: true,
    enum: ['Remote', 'On-site', 'Hybrid', 'Online', 'Offline'] // Merged enums from Files 1 and 2
  },
  location: {
    type: String,
    required: true, // From File 1, more robust than File 3's default
    default: 'Remote' // Also include File 3's default for convenience
  },
  duration: {
    type: String,
    required: true
  },
  stipend: {
    type: String,
    required: true
  },
  limit: { // From Files 2 and 3
    type: Number,
    required: true,
    min: 1
  },
  deadline: {
    type: Date,
    required: true
  },
  prerequisites: {
    type: String,
    required: true // More robust than File 3's non-required field
  },
  requiredSkills: {
    type: [String],
    required: true, // More robust than File 3's default empty array
    default: []
  },
  // Alumni info
  alumniId: {
    type: Schema.Types.ObjectId,
    ref: 'Alumni', // Using 'Alumni' as the reference model
    required: true
  },
  alumniName: {
    type: String,
    required: true
  },
  alumniCompany: {
    type: String,
    required: true
  },
  alumniPosition: {
    type: String,
    required: true
  },
  // Status flags
  isApproved: {
    type: Boolean,
    default: false
  },
  isMarkAsComplete: {
    type: Boolean,
    default: false
  },
  // Participants array with the structured sub-schema
  participants: [participantSchema]
}, {
  // Common Schema Options
  timestamps: true, // Auto-manages createdAt and updatedAt
  collection: 'internships', // Explicitly set the collection name
  toJSON: { virtuals: true }, // Enable virtuals in JSON output
  toObject: { virtuals: true } // Enable virtuals in Object output
});

// Add compound text index for searching across multiple fields
internshipSchema.index({
  title: 'text',
  description: 'text',
  targetAudience: 'text'
});

// --- Virtual Properties from File 3 ---
internshipSchema.virtual('currentParticipants').get(function() {
  return this.participants.length;
});

internshipSchema.virtual('limitParsed').get(function() {
  return `${this.participants.length}/${this.limit}`;
});

internshipSchema.virtual('isFull').get(function() {
  return this.participants.length >= this.limit;
});

const Internship = mongoose.model('Internship', internshipSchema);

export default Internship;