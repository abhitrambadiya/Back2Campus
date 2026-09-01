import express from 'express';
import rateLimit from 'express-rate-limit';
import { getMapAlumniData } from '../controllers/LandingPage/alumniMap.controller.js';
import { getSuccessStories } from '../controllers/LandingPage/alumniSuccessStoriesController.js';
import { submitContact } from '../controllers/LandingPage/contactController.js';
import emailController from '../controllers/LandingPage/emailController.js';

const router = express.Router();

// Configure rate limiting
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Limit each IP to 5 requests per window
  message: {
    success: false,
    message: 'Too many submission attempts. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

router.get('/alumni-map', getMapAlumniData); // GET /api/landingpage/alumni-map - Get alumni data for map visualization
router.get('/success-stories', getSuccessStories); // GET /api/landingpage/success-stories - Get alumni success story for map visualization
router.post('/submit', contactLimiter, submitContact); // POST /api/landingpage/submit - Submit Contact Form
router.post('/subscribe', emailController.subscribe); // POST /api/landingpage/submit - Submit Subscribe

export default router;