// routes/alumni/alumniRoutes.js
import express from 'express';
import { getPendingEvents, applyForEvent } from '../controllers/Alumni/alumniEvent.js';
import { loginAlumni, forgotPassword, verifyOTP, resetPassword, getAlumniProfile, updateProfile, getUserProfile } from '../controllers/Alumni/alumniLoginController.js';
import { getUpcomingMeets, registerEvent, getAlumniList, deleteMeet } from '../controllers/Alumni/alumniMeetcontroller.js';
import { createMentorship }from'../controllers/Alumni/mentorship.js';
import { createInternship }from'../controllers/Alumni/internship.js';
import { createDonation, getDonationHistory, getDonationStats, updateDonationStatus, createDonationOrder, verifyDonationPayment } from '../controllers/Alumni/donation.js';
import { protect } from '../middleware/alumniMiddleware.js';
import { authenticateAlumni } from "../middleware/authenticateAlumni.js";
const router = express.Router();

// Public routes
router.post('/login', loginAlumni);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOTP);
router.get('/profile', protect, getAlumniProfile);
router.put('/update', protect, updateProfile);
router.get('/me', protect, getUserProfile);

// Protected routes
router.put('/reset-password', protect, resetPassword);
router.post('/internships', protect, createInternship); // Alumni route to create internship
router.post('/mentorships', protect, createMentorship); // Alumni route to create mentorship
router.post('/donations', protect, createDonation); // Alumni route to create donation
router.get('/donations', protect, getDonationHistory); // Alumni route to get donation history
router.post('/donations/create-order', protect, createDonationOrder); // Create Razorpay order
router.post('/donations/verify-payment', protect, verifyDonationPayment); // Verify payment

router.get('/events', authenticateAlumni, getUpcomingMeets);
router.post('/events/:eventId/register', authenticateAlumni, registerEvent);

router.get('/events/apply', getPendingEvents);
router.post('/events/:id/apply', protect, applyForEvent);

// Public donation stats route
router.get('/donations/stats', getDonationStats);

router.post('/logout', (req, res) => {
  res.clearCookie('token', {
      httpOnly: true,
      secure: false,  // Set to true if using HTTPS
      sameSite: 'Lax'
  });

  res.status(200).json({ message: 'Logout successful' });
});

export default router;