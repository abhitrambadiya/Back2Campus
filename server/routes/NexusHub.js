import express from 'express';
import { getConfirmedEvents } from '../controllers/NexusHub/studentEvent.js';
import { applicationController } from '../controllers/NexusHub/applicationMentorship.js';
import { applicationInternshipController } from '../controllers/NexusHub/applicationInternship.js';
import { getAllAlumni, createAlumni, getAlumni, updateAlumni, deleteAlumni } from '../controllers/NexusHub/alumniController.js';
import { getHallOfFame } from '../controllers/NexusHub/HallOfFame.js';
import { internshipController } from '../controllers/NexusHub/internship.js';
import { mentorshipController } from '../controllers/NexusHub/mentorship.js';

const router = express.Router();
router.get('/events', getConfirmedEvents);
router.post('/applications/mentorships/:mentorshipId/apply', applicationController.applyToMentorship); // Apply to mentorship
router.post('/applications/validate-prn', applicationController.validatePRN); // Validate PRN and retrieve student details
router.post('/applications/internships/:internshipId/apply', applicationInternshipController.applyToInternship); // Apply to mentorship
router.post('/applications/validate-prn', applicationInternshipController.validatePRN); // Validate PRN and retrieve student details
router.route("/explorealumni").get(getAllAlumni).post(createAlumni);
router.route("/explorealumni/:id").get(getAlumni).put(updateAlumni).delete(deleteAlumni);
router.get('/hall-of-fame', getHallOfFame);
router.get('/internships', internshipController.getAllInternships); // GET all approved internships
router.get('/internship/:id', internshipController.getInternshipById); // GET internship by ID
router.get('/internship/search', internshipController.searchInternships); // GET search internships
router.post('/internship/:id/apply', internshipController.trackApplication); // POST track application click and get Google Form link
router.get('/internships/metadata/location', internshipController.getLocations); // Get available departments (for filters)
router.get('/mentorships', mentorshipController.getMentorships); // Get all mentorships with pagination & filtering
router.get('/mentorships/:id', mentorshipController.getMentorshipById); // Get single mentorship by ID
router.post('/mentorships', mentorshipController.createMentorship); // Create new mentorship
router.get('/mentorships/metadata/departments', mentorshipController.getDepartments); // Get available departments (for filters)
router.get('/mentorships/metadata/studyyears', mentorshipController.getStudyYears); // Get available study years (for filters)

export default router;