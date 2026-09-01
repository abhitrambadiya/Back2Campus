// controllers/admin/adminController.js
import Admin from '../../models/Admin.js';
import { generateToken } from '../../middleware/adminMiddleware.js';
import { sendForgotPasswordEmail } from '../../services/email/adminForgotPassword.js';
import bcrypt from 'bcryptjs';

export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for admin user
    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if password matches
    const isMatch = await admin.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.status(200).json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      department: admin.department,
      token: generateToken(admin._id),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Generate OTP
    const otp = await admin.getOTPToken();
    await admin.save();

    // Call the new service function to send the email
    await sendForgotPasswordEmail(admin.email, otp);

    res.status(200).json({ message: 'OTP sent to email' });
  } catch (error) {
    console.error(error);
    
    // Reset OTP fields
    if (error.admin) {
      error.admin.otpToken = undefined;
      error.admin.otpExpire = undefined;
      await error.admin.save();
    }
    
    res.status(500).json({ message: 'Could not send OTP email' });
  }
};

// @desc    Verify OTP and get access to reset password
// @route   POST /api/admin/verify-otp
// @access  Public
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const admin = await Admin.findOne({
      email,
      otpExpire: { $gt: Date.now() }
    });

    if (!admin) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Check if OTP matches
    const isMatch = await admin.matchOTP(otp);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // OTP is valid, send temporary token for password reset
    const tempToken = generateToken(admin._id);

    res.status(200).json({ success: true, tempToken });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Reset password
// @route   PUT /api/admin/reset-password
// @access  Private (requires temp token)
export const resetPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    
    const admin = await Admin.findById(req.admin._id);

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    const saltRounds = 10;
    const hashed = await bcrypt.hash(newPassword, saltRounds);

    await Admin.findByIdAndUpdate(
      req.admin._id,
      { password: hashed, otpToken: undefined, otpExpire: undefined },
      { new: true } // optional
    );
    
    // Clear OTP fields
    admin.otpToken = undefined;
    admin.otpExpire = undefined;
    
    await admin.save();

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get current admin profile
// @route   GET /api/admin/profile
// @access  Private
export const getAdminProfile = async (req, res) => {
  try {
    // req.admin already has the user details from the protect middleware
    const admin = req.admin;
    
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.status(200).json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      department: admin.department
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};