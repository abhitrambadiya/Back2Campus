import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import compression from 'compression';

dotenv.config();
const app = express();
const allowedOrigins = [
  "https://back2campus.pages.dev",
  "http://localhost:5173"
];

// Increase payload limits for base64 images
const PAYLOAD_LIMIT = process.env.PAYLOAD_LIMIT || '50mb';
app.use(express.json({ limit: PAYLOAD_LIMIT }));
app.use(express.urlencoded({ limit: PAYLOAD_LIMIT, extended: true }));

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);

    // Allow only whitelisted web origins
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Otherwise block
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  optionsSuccessStatus: 200
}));
app.use(helmet());
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());
app.use(compression());
// const limiter = rateLimit({ // Rate Limiter
//   windowMs: 15 * 60 * 1000,
//   max: 100,
//   message: 'Too many requests from this IP, please try again later.'
// });
// app.use(limiter);

// import routes
import adminRoutes from "./routes/Admin.js";
import alumniRoutes from "./routes/Alumni.js";
import landingPageRoutes from "./routes/LandingPage.js";
import nexusHubRoutes from "./routes/NexusHub.js";

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB!"))
  .catch(err => console.error("MongoDB connection error:", err));

// Routes
app.use('/api/admin', adminRoutes); // Admin Routes
app.use('/api/alumni', alumniRoutes); // Alumni Routes
app.use('/api/landingpage', landingPageRoutes) // Landing Page Routes
app.use('/api/nexushub', nexusHubRoutes) // NexusHUB Routes

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Server is running'
  });
});
// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Resource not found' });
});
// Error Handling
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on http://localhost:${PORT}`));

