import express from 'express';
import multer from 'multer';
import { createEvent, getApplicationsForEvent, approveApplication, getAllEvents, deleteEvent, deleteApplication } from '../controllers/Admin/adminEvent.js';
import { addSingleAlumni } from '../controllers/Admin/alumniController.js';
import { bulkUploadAlumni } from '../controllers/Admin/alumniController.js';
import { loginAdmin, forgotPassword, verifyOTP, resetPassword, getAdminProfile}  from '../controllers/Admin/adminLoginController.js';
import { protect } from '../middleware/adminMiddleware.js';
import { adminDirectory, updateFeaturedStatus} from '../controllers/Admin/directoryController.js';
import { getAllPrograms, approveProgram, markProgramComplete, deleteProgram, sendEmailToParticipants } from '../controllers/Admin/mentorshipController.js';
import { getAllInternshipPrograms, approveInternshipProgram, markInternshipProgramComplete, deleteInternshipProgram, sendEmailToInternshipParticipants } from '../controllers/Admin/internshipController.js';
import { createAlumniMeet, getAllAlumniMeets, getRegisteredAlumni, sendEmailToAlumni, sendTestEmailController, verifyAdmin, registerForMeet, deleteAlumniMeet, unregisterFromMeet } from '../controllers/Admin/alumniMeetsController.js';
const router = express.Router();

// Multer setup for file uploads
const upload = multer({ dest: 'uploads/' });

/**
 * @route   POST /api/alumni/add
 * @desc    Add a single alumni record
 * @access  Admin
 */

// Public routes
router.get('/admin-directory', adminDirectory);
router.patch('/alumni/:id/featured', updateFeaturedStatus);
router.post('/login', loginAdmin);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOTP);
router.get('/profile', protect, getAdminProfile);
router.post('/bulk-upload', upload.single('csv'), bulkUploadAlumni); // Route for bulk alumni upload
router.post('/add', addSingleAlumni);
router.get('/internship', getAllInternshipPrograms);
router.put('/internship/:id/approve', approveInternshipProgram);
router.put('/internship/:id/complete', markInternshipProgramComplete);
router.delete('/internship/:id', deleteInternshipProgram);;
router.post('/internship/:internshipId/send-email', sendEmailToInternshipParticipants); // Send email to mentorship participants
router.get('/mentorship', getAllPrograms);
router.put('/mentorship/:id/approve', approveProgram);
router.put('/mentorship/:id/complete', markProgramComplete);
router.delete('/mentorship/:id', deleteProgram);;
router.post('/mentorship/:mentorshipId/send-email', sendEmailToParticipants); // Send email to mentorship participants
router.post('/alumni-meets', verifyAdmin, createAlumniMeet); // CREATE - Add new alumni meet event
router.get('/alumni-meets', verifyAdmin, getAllAlumniMeets); // READ - Get all alumni meets (upcoming and past)
router.get('/alumni-meets/:eventId/registered', verifyAdmin, getRegisteredAlumni); // READ - Get registered students for a specific event
router.post('/alumni-meets/send-test-email', verifyAdmin, sendTestEmailController);
router.post('/alumni-meets/:eventId/register', registerForMeet);
router.post('/alumni-meets/:eventId/send-email', verifyAdmin, sendEmailToAlumni);
// In your routes file:
router.delete('/alumni-meets/:eventId', verifyAdmin, deleteAlumniMeet);
router.delete('/alumni-meets/:eventId/unregister', unregisterFromMeet);
// Tanish routes
router.get('/events', getAllEvents);
router.post('/events', createEvent);
router.delete('/events/:id', deleteEvent);
router.get('/events/:id/applications', getApplicationsForEvent);
router.patch('/applications/:id/approve', approveApplication);
router.delete('/applications/:id', deleteApplication);

// Protected routes
router.put('/reset-password', protect, resetPassword);

router.post('/logout', (req, res) => {
  res.clearCookie('token', {
      httpOnly: true,
      secure: false,  // Set to true if using HTTPS
      sameSite: 'Lax'
  });

  res.status(200).json({ message: 'Logout successful' });
});

// Export the router
export default router;