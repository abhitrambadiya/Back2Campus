// models/Admin.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  // OTP fields for password reset or verification
  otpToken: String,
  otpExpire: Date,
}, {
  timestamps: true, // Automatically manages `createdAt` and `updatedAt`
  collection: 'admins' // Explicitly set the collection name
});

// Pre-save hook to hash password before saving
adminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare a password
adminSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to generate and hash an OTP token
adminSchema.methods.getOTPToken = async function() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.otpToken = await bcrypt.hash(otp, 10);
  this.otpExpire = Date.now() + 10 * 60 * 1000; // Expires in 10 minutes
  return otp;
};

// Method to match an OTP
adminSchema.methods.matchOTP = async function(enteredOTP) {
  return await bcrypt.compare(enteredOTP, this.otpToken);
};

export default mongoose.model('Admin', adminSchema);