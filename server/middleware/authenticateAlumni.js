import Alumni from '../models/Alumni.js';
import jwt from 'jsonwebtoken';

export const authenticateAlumni = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'Access denied. No token provided.' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_ALUMNI);
    
    // Fetch the alumni details from database
    const alumni = await Alumni.findById(decoded.id);
    
    if (!alumni) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token. Alumni not found.' 
      });
    }

    req.alumni = alumni; // Add alumni data to request object
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ 
      success: false,
      message: 'Invalid token.' 
    });
  }
};