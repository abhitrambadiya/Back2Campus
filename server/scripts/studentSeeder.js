// studentSeeder.js

import mongoose from "mongoose";
import Student from "../models/Student.js";
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, '../.env'),
});

const MONGO_URI = process.env.MONGODB_URI;

if (!MONGO_URI) {
  console.error("❌ MONGODB_URI is missing from .env");
  process.exit(1);
}

// ----------------------------------------------------
// Fixed Demo Student
// ----------------------------------------------------

const demoStudent = {
  fullName: "Demo Student",
  prn: "2324000001",
  department: "CSE",
  studyYear: "TY",
  email: "demouser@example.com",
};

// ----------------------------------------------------
// Additional Dummy Students
// ----------------------------------------------------

const dummyStudents = [
  {
    fullName: "Ananya Patil",
    prn: "2425001001",
    department: "AIML",
    studyYear: "FY",
    email: "ananya.patil@example.com",
  },
  {
    fullName: "Vedant Deshmukh",
    prn: "2425001002",
    department: "CSE",
    studyYear: "FY",
    email: "vedant.deshmukh@example.com",
  },
  {
    fullName: "Riya Jadhav",
    prn: "2324001101",
    department: "ENTC",
    studyYear: "SY",
    email: "riya.jadhav@example.com",
  },
  {
    fullName: "Atharva Shinde",
    prn: "2324001102",
    department: "MECH",
    studyYear: "SY",
    email: "atharva.shinde@example.com",
  },
  {
    fullName: "Sneha Pawar",
    prn: "2223001201",
    department: "AIML",
    studyYear: "TY",
    email: "sneha.pawar@example.com",
  },
  {
    fullName: "Omkar Joshi",
    prn: "2223001202",
    department: "CSE",
    studyYear: "TY",
    email: "omkar.joshi@example.com",
  },
  {
    fullName: "Vaishnavi Chavan",
    prn: "2122001301",
    department: "CIVIL",
    studyYear: "B. Tech",
    email: "vaishnavi.chavan@example.com",
  },
  {
    fullName: "Pranav Kadam",
    prn: "2122001302",
    department: "MECH",
    studyYear: "B. Tech",
    email: "pranav.kadam@example.com",
  },
];

// Combine demo + dummy students
const students = [demoStudent, ...dummyStudents];

// ----------------------------------------------------
// Seeder
// ----------------------------------------------------

const seedStudents = async () => {
  try {
    await mongoose.connect(MONGO_URI);

    console.log("✅ MongoDB Connected");

    // Optional: clear existing students
    // await Student.deleteMany({});

    await Student.insertMany(students, {
      ordered: false,
    });

    console.log(`✅ ${students.length} students inserted successfully!`);

    console.log("\n🎓 Demo Student:");
    console.log(`Name: ${demoStudent.fullName}`);
    console.log(`PRN: ${demoStudent.prn}`);
    console.log(`Email: ${demoStudent.email}`);
    console.log(`Department: ${demoStudent.department}`);
    console.log(`Year: ${demoStudent.studyYear}`);

  } catch (error) {
    console.error("❌ Error inserting students:", error);
  } finally {
    await mongoose.connection.close();
    console.log("🔗 MongoDB Connection Closed");
  }
};

seedStudents();