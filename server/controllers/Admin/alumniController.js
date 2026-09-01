import Alumni from '../../models/Alumni.js';
import { sendWelcomeEmail } from '../../services/email/welcomeAlumni.js';
import bcrypt from 'bcryptjs';
import axios from 'axios';
import nodemailer from 'nodemailer';
import fs from 'fs';
import csv from 'csv-parser';

// --- Email Transporter Setup ---
// This should ideally be in a separate config/util file if used across many controllers
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Ensure these are set in your .env file
    pass: process.env.EMAIL_PASS
  }
});

// --- Helper Functions ---
// These could also be moved to a `utils/` folder if they are generic and used elsewhere
const generatePassword = () => {
  const length = 10;
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
};

const getCoordinates = async (location) => {
  try {
    const response = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`);
    if (response.data && response.data.length > 0) {
      const { lat, lon } = response.data[0];
      return { latitude: parseFloat(lat), longitude: parseFloat(lon) };
    }
    return { latitude: null, longitude: null };
  } catch (error) {
    console.error(`Error getting coordinates for ${location}:`, error.message);
    return { latitude: null, longitude: null };
  }
};

/**
 * Add a single alumni record
 */
const addSingleAlumni = async (req, res) => {
  try {
    const {
      prn,
      fullName,
      email,
      password,
      phoneNumber,
      department,
      passOutYear,
      position,
      companyName,
      location,
      successStory,
      specialAchievements,
      linkedInURL,
      hallOfFame,
      skills,
    } = req.body;

    // Check if alumni with same PRN or email already exists
    const existingAlumni = await Alumni.findOne({
      $or: [{ prn }, { email }]
    });

    if (existingAlumni) {
      return res.status(400).json({
        success: false,
        message: existingAlumni.prn === prn 
          ? 'PRN already exists' 
          : 'Email already exists'
      });
    }

    // Get coordinates for the location
    const { latitude, longitude } = await getCoordinates(location);

    const hallOfFameBoolean = hallOfFame === 'true';

    // Create new alumni record
    const newAlumni = new Alumni({
      prn,
      fullName,
      email,
      password, // Will be hashed by pre-save hook
      phoneNumber: phoneNumber,
      department,
      passOutYear: parseInt(passOutYear),
      jobPosition: position,
      companyName: companyName,
      location,
      latitude,
      longitude,
      successStory: successStory,
      specialAchievements,
      linkedInURL,
      hallOfFame: hallOfFameBoolean,
      skills,
    });

    // Save alumni to database
    const savedAlumni = await newAlumni.save();

    // Send welcome email
    await sendWelcomeEmail(savedAlumni, password);

    res.status(201).json({
      success: true,
      message: 'Alumni added successfully',
      data: {
        id: savedAlumni._id,
        prn: savedAlumni.prn,
        fullName: savedAlumni.fullName,
        email: savedAlumni.email
      }
    });
  } catch (error) {
    console.error('Error adding alumni:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add alumni',
      error: error.message
    });
  }
};

export { addSingleAlumni };

// --- Controller Logic for Bulk Upload ---
export const bulkUploadAlumni = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const filePath = req.file.path;
  const alumniData = [];

  fs.createReadStream(filePath)
    .pipe(csv({ mapHeaders: ({ header }) => header.trim(), mapValues: ({ value }) => value.trim() }))
    .on('data', (row) => {
      // Basic validation to skip header row and empty rows
      if (row.fullName && row.email && !row.fullName.match(/fullName/i)) {
        alumniData.push(row);
      }
    })
    .on('end', async () => {
      let successCount = 0;
      let errorCount = 0;
      const results = [];

      for (const alumni of alumniData) {
        try {
          const password = generatePassword();
          const hashedPassword = await bcrypt.hash(password, 10);
          const { latitude, longitude } = await getCoordinates(alumni.location);

          // Use the cleaned-up Alumni model to create a new document
          const newAlumni = new Alumni({
            prn: alumni.prn,
            fullName: alumni.fullName,
            email: alumni.email,
            password: hashedPassword,
            phoneNumber: alumni.phoneNumber,
            department: alumni.department,
            passOutYear: parseInt(alumni.passOutYear),
            jobPosition: alumni.jobPosition,
            companyName: alumni.companyName,
            location: alumni.location,
            latitude,
            longitude,
            successStory: alumni.successStory,
            specialAchievements: alumni.specialAchievements,
            linkedInURL: alumni.linkedInURL,
            hallOfFame: alumni.hallOfFame.toLowerCase() === 'true', // Handle boolean conversion
            skills: alumni.skills,
            isVerified: true,
          });

          await newAlumni.save();
          successCount++;
          results.push({ status: 'success', email: alumni.email });

          // Send welcome email
          await sendWelcomeEmail(newAlumni, password);
        } catch (err) {
          errorCount++;
          console.error(`Error processing alumni ${alumni.email}:`, err);
          results.push({ status: 'error', email: alumni.email, message: err.message });
        }
      }

      fs.unlinkSync(filePath); // Clean up uploaded file
      res.json({
        message: 'Bulk upload processing complete.',
        summary: { successCount, errorCount },
        results
      });
    })
    .on('error', (error) => {
      fs.unlinkSync(filePath);
      res.status(500).json({ message: 'CSV Processing Error', error: error.message });
    });
};