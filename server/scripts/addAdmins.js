import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, '../.env'),
});

// MongoDB Connection
const MONGO_URI = process.env.MONGODB_URI;

// Admin Schema
const adminSchema = new mongoose.Schema(
  {
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

    // OTP fields
    otpToken: String,
    otpExpire: Date,
  },
  {
    timestamps: true,
    collection: 'admins',
  }
);

const Admin = mongoose.model('Admin', adminSchema);

// Admin Data
const admins = [
  {
    name: 'Abhi Trambadiya',
    email: 'dev.abhitrambadiya@gmail.com',
    password: 'abhi@admin',
    department: 'AIML',
  },
  {
    name: 'Demo User',
    email: 'demouser@example.com',
    password: 'demouser123',
    department: 'CSE',
  },
];

// Email Transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Add Admins
const addAdmins = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB Connected');

    for (const admin of admins) {
      const {
        name,
        email,
        password,
        department,
      } = admin;

      try {
        // Check if admin already exists
        const existingAdmin = await Admin.findOne({
          email: email.toLowerCase(),
        });

        if (existingAdmin) {
          console.log(
            `⚠️ Admin ${name} already exists. Skipping...`
          );
          continue;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create admin
        await Admin.create({
          name,
          email,
          password: hashedPassword,
          department,
        });

        console.log(`✅ Admin added: ${name}`);

        // Send welcome email
        const mailOptions = {
          from: `"Back2Campus" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: 'Welcome to the Admin Panel 🎉',
          html: `
            <div
              style="
                font-family: Arial, sans-serif;
                padding: 20px;
                border: 1px solid #ddd;
                border-radius: 10px;
                max-width: 500px;
                margin: auto;
              "
            >
              <h2
                style="
                  color: #4CAF50;
                  text-align: center;
                "
              >
                Welcome, ${name}!
              </h2>

              <p style="font-size: 16px;">
                You have been successfully added as an admin
                for the <strong>${department}</strong> department.
              </p>

              <p>
                <strong>Your login details:</strong>
              </p>

              <div
                style="
                  background: #f4f4f4;
                  padding: 10px;
                  border-radius: 5px;
                "
              >
                <p>
                  <strong>Email:</strong> ${email}
                </p>

                <p>
                  <strong>Password:</strong> ${password}
                </p>
              </div>

              <p
                style="
                  font-size: 14px;
                  color: #555;
                "
              >
                Please keep these details safe and do not
                share them with anyone.
              </p>

              <hr />

              <p
                style="
                  text-align: center;
                  font-size: 14px;
                  color: #777;
                "
              >
                Regards,<br />
                <strong>Team Back2Campus</strong>
              </p>
            </div>
          `,
        };

        await transporter.sendMail(mailOptions);

        console.log(`📧 Email sent to: ${email}`);

        // Small delay between emails
        await new Promise((resolve) =>
          setTimeout(resolve, 2000)
        );
      } catch (error) {
        console.error(
          `❌ Error processing ${name}:`,
          error.message
        );
      }
    }
  } catch (error) {
    console.error(
      '❌ MongoDB Connection Error:',
      error.message
    );
  } finally {
    await mongoose.connection.close();
    console.log('🔗 MongoDB Connection Closed');
  }
};

// Handle Ctrl+C
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log(
    '⚠️ MongoDB Connection Closed due to SIGINT'
  );
  process.exit(0);
});

// Run
addAdmins();