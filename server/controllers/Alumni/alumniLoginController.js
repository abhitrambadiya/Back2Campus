// controllers/alumni/alumniController.js
import Alumni from '../../models/Alumni.js';
import { generateToken } from '../../middleware/alumniMiddleware.js';
import { sendForgotPasswordEmail } from '../../services/email/alumniForgotPassword.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v2 as cloudinary } from 'cloudinary';

// Add Cloudinary configuration (add to your environment variables)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// @desc    Login alumni
// @route   POST /api/alumni/login
// @access  Public
export const loginAlumni = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for alumni user
    const alumni = await Alumni.findOne({ email });

    if (!alumni) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if password matches
    const isMatch = await alumni.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.status(200).json({
      _id: alumni._id,
      fullName: alumni.fullName,
      email: alumni.email,
      token: generateToken(alumni._id),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Send OTP for password reset
// @route   POST /api/alumni/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const alumni = await Alumni.findOne({ email });

    if (!alumni) {
      return res.status(404).json({ message: 'Alumni not found' });
    }

    // Generate OTP
    const otp = await alumni.getOTPToken();
    await alumni.save();

    // Call the new service function to send the email
    await sendForgotPasswordEmail(alumni.email, otp);

    res.status(200).json({ message: 'OTP sent to email' });
  } catch (error) {
    console.error(error);
    
    // Reset OTP fields
    if (error.alumni) {
      error.alumni.otpToken = undefined;
      error.alumni.otpExpire = undefined;
      await error.alumni.save();
    }
    
    res.status(500).json({ message: 'Could not send OTP email' });
  }
};

// @desc    Verify OTP and get access to reset password
// @route   POST /api/alumni/verify-otp
// @access  Public
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const alumni = await Alumni.findOne({
      email,
      otpExpire: { $gt: Date.now() }
    });

    if (!alumni) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Check if OTP matches
    const isMatch = await alumni.matchOTP(otp);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // OTP is valid, send temporary token for password reset
    const tempToken = generateToken(alumni._id);

    res.status(200).json({ success: true, tempToken });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Reset password
// @route   PUT /api/alumni/reset-password
// @access  Private (requires temp token)
export const resetPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    
    const alumni = await Alumni.findById(req.alumni._id);

    if (!alumni) {
      return res.status(404).json({ message: 'Alumni not found' });
    }

    const saltRounds = 10;
    const hashed = await bcrypt.hash(newPassword, saltRounds);

    await Alumni.findByIdAndUpdate(
      req.alumni._id,
      { password: hashed, otpToken: undefined, otpExpire: undefined },
      { new: true } // optional
    );
    
    // Clear OTP fields
    alumni.otpToken = undefined;
    alumni.otpExpire = undefined;
    
    await alumni.save();

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAlumniProfile = async (req, res) => {
  try {
    // req.alumni already has the user details from the protect middleware
    const alumni = req.alumni;
    
    if (!alumni) {
      return res.status(404).json({ message: 'Alumni not found' });
    }

    res.status(200).json({
      _id: alumni._id,
      fullName: alumni.fullName,
      email: alumni.email,
      department: alumni.department,
      jobPosition: alumni.jobPosition,
      passOutYear: alumni.passOutYear,
      companyName: alumni.companyName,
      profileImage: alumni.profileImage
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    
    // Extract user ID from JWT token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_ALUMNI);
    const userId = decoded.id;

    // Extract profile data from request body
    const {
      email,
      phoneNumber,
      skills,
      linkedInURL,
      jobPosition,
      companyName,
      profileImage
    } = req.body;

    // Validation
    if (!email || !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Email and phone number are required'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // LinkedIn URL validation (optional)
    if (linkedInURL && linkedInURL.trim() !== '') {
      try {
        const url = new URL(linkedInURL.trim());
        
        if (!['linkedin.com', 'www.linkedin.com'].includes(url.hostname.toLowerCase())) {
          return res.status(400).json({
            success: false,
            message: 'URL must be from linkedin.com'
          });
        }
        
        const pathRegex = /^\/in\/[a-zA-Z0-9._-]{1,100}\/?$/;
        if (!pathRegex.test(url.pathname)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid LinkedIn profile URL format.'
          });
        }
        
        if (url.protocol !== 'https:') {
          return res.status(400).json({
            success: false,
            message: 'LinkedIn URL must use HTTPS'
          });
        }
        
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'Invalid URL format'
        });
      }
    }

    // Check if user exists
    const user = await Alumni.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if email is already taken by another user
    if (email !== user.email) {
      const existingUser = await Alumni.findOne({ 
        email: email, 
        _id: { $ne: userId } 
      });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email is already registered with another account'
        });
      }
    }

    // Prepare update data
    const updateData = {
      email: email.trim().toLowerCase(),
      phoneNumber: phoneNumber.trim(),
      skills: skills?.trim() || '',
      linkedInURL: linkedInURL?.trim() || '',
      jobPosition: jobPosition?.trim() || '',
      companyName: companyName?.trim() || '',
      updatedAt: new Date()
    };

    // Handle profile image upload to Cloudinary
    if (profileImage && profileImage.startsWith('data:image/')) {
      try {
        
        // FIXED: Validate base64 image format
        const validImageTypes = ['data:image/jpeg', 'data:image/jpg', 'data:image/png', 'data:image/webp'];
        const isValidImageType = validImageTypes.some(type => profileImage.startsWith(type));
        
        if (!isValidImageType) {
          return res.status(400).json({
            success: false,
            message: 'Invalid image format. Only JPEG, PNG, and WebP are supported.'
          });
        }

        // FIXED: Check base64 size (approximate file size)
        const base64Data = profileImage.split(',')[1];
        const sizeInBytes = (base64Data.length * 3) / 4;
        const sizeInMB = sizeInBytes / (1024 * 1024);
        
        if (sizeInMB > 10) { // 10MB limit
          return res.status(400).json({
            success: false,
            message: 'Image file is too large. Please select an image smaller than 10MB.'
          });
        }

        // Delete old profile image from Cloudinary if exists
        if (user.profileImage && user.profileImage.includes('cloudinary.com')) {
          try {
            // Extract public_id from existing Cloudinary URL
            const urlParts = user.profileImage.split('/');
            const publicIdWithExtension = urlParts[urlParts.length - 1];
            const publicId = `back2campus/alumni-profiles/${publicIdWithExtension.split('.')[0]}`;
            await cloudinary.uploader.destroy(publicId);
          } catch (deleteError) {
            console.error('Error deleting old image:', deleteError.message);
            // Continue with upload even if deletion fails
          }
        }

        // FIXED: Upload new image to Cloudinary with better configuration
        const uploadResult = await cloudinary.uploader.upload(profileImage, {
          folder: 'back2campus/alumni-profiles',
          transformation: [
            { 
              width: 400, 
              height: 400, 
              crop: 'fill', 
              gravity: 'face',
              quality: 'auto:good',
              fetch_format: 'auto'
            }
          ],
          public_id: `${userId}_${Date.now()}`, // Unique identifier
          overwrite: true, // Allow overwriting
          resource_type: 'auto', // Auto-detect resource type
        });
        updateData.profileImage = uploadResult.secure_url;

      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        
        // Provide more specific error messages
        if (uploadError.message.includes('Invalid image file')) {
          return res.status(400).json({
            success: false,
            message: 'Invalid image file. Please select a valid image.'
          });
        } else if (uploadError.message.includes('File size too large')) {
          return res.status(400).json({
            success: false,
            message: 'Image file is too large. Please select a smaller image.'
          });
        } else {
          return res.status(400).json({
            success: false,
            message: 'Failed to upload profile image. Please try again.'
          });
        }
      }
    }

    // Update user profile
    const updatedUser = await Alumni.findByIdAndUpdate(
      userId,
      updateData,
      { 
        new: true, 
        runValidators: true,
        select: '-password' // Exclude password from response
      }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'Failed to update profile'
      });
    }

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: updatedUser
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);

    // Handle JWT errors
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please login again.'
      });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    // Handle duplicate key error (email)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email is already registered with another account'
      });
    }

    // Handle Cloudinary errors
    if (error.message && error.message.includes('cloudinary')) {
      return res.status(400).json({
        success: false,
        message: 'Image upload failed. Please try again.'
      });
    }

    // Generic error
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again.'
    });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_ALUMNI);
    const userId = decoded.id;

    const user = await Alumni.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile fetched successfully',
      data: {
        user: user
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};