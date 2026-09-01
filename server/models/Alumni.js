import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import mongoosePaginate from 'mongoose-paginate-v2';

const alumniSchema = new mongoose.Schema({
  // From File 1
  prn: {
    type: String,
    unique: true, // Only if prn is always unique, otherwise remove
    trim: true,
  },
  // Combination of fields from all files
  fullName: {
    type: String,
    required: [true, 'Full name is required'], // Using validation from File 5
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'], // Using validation from File 5
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ] // From File 5
  },
  password: {
    type: String,
    required: true // All files with password had this
  },
  phoneNumber: {
    type: String
  },
  department: {
    type: String,
    required: [true, 'Department is required'], // From File 5
    enum: ['AIML', 'CSE', 'ENTC', 'MECH', 'CIVIL']
  },
  passOutYear: {
    type: Number,
    required: [true, 'Pass out year is required'] // From File 5
  },
  // Job and Company Info
  jobPosition: {
    type: String
  },
  companyName: {
    type: String
  },
  // Location Info
  location: {
    type: String,
    index: true // From File 3
  },
  latitude: {
    type: Number
  },
  longitude: {
    type: Number
  },
  // Story and Achievements
  successStory: {
    type: String
  },
  specialAchievements: {
    type: String
  },
  linkedInURL: {
    type: String
  },
  // Other fields
  hallOfFame: {
    type: Boolean,
    default: false // Assuming default should be false
  },
  skills: {
    type: String
  },
  avatar: {
    type: String,
    default: function() {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(this.fullName)}&background=6366F1&color=fff`;
    } // From File 5
  },
  profileImage: {
    type: String,
    index: true
  },
  // Authentication and Verification
  role: {
    type: String,
    default: 'Alumni' // From File 1
  },
  isVerified: {
    type: Boolean,
    default: false // From File 1
  },
  otpToken: String, // From File 2
  otpExpire: Date, // From File 2
}, {
  // Common Schema Options
  timestamps: true, // From Files 2, 3, 4, 5. This handles createdAt and updatedAt automatically.
  collection: 'alumnis' // From Files 1, 3, 5. It's good practice to be explicit.
});

// --- Pre-save hook from File 1 ---
// This should be outside the schema definition but before model creation
// Pre-save hook to hash password
alumniSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
alumniSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error(error);
  }
};

// Match user entered password to hashed password in database
alumniSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash OTP token
alumniSchema.methods.getOTPToken = async function () {
  // Generate a 6 digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Hash OTP token
  this.otpToken = await bcrypt.hash(otp, 10);
  
  // Set expire time - 10 minutes
  this.otpExpire = Date.now() + 10 * 60 * 1000;

  return otp;
};

// Match OTP
alumniSchema.methods.matchOTP = async function (enteredOTP) {
  return await bcrypt.compare(enteredOTP, this.otpToken);
};

// Compound index for location-based queries
alumniSchema.index({ location: 1, latitude: 1, longitude: 1 });

// Create a virtual field to map between frontend and backend field names
alumniSchema.virtual('graduationYear').get(function() {
    return this.passOutYear;
});

alumniSchema.virtual('currentPosition').get(function() {
    return this.jobPosition;
});

alumniSchema.virtual('company').get(function() {
    return this.companyName;
});

alumniSchema.virtual('bio').get(function() {
    return this.successStory;
});

alumniSchema.virtual('linkedin').get(function() {
    return this.linkedInURL;
});

// Include virtuals when converting to JSON
alumniSchema.set('toJSON', { virtuals: true });
alumniSchema.set('toObject', { virtuals: true });
alumniSchema.plugin(mongoosePaginate);

// --- Export the final model ---
export default mongoose.model('Alumni', alumniSchema);