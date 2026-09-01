import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Adjust this path according to your project structure
import Alumni from "../models/Alumni.js";
dotenv.config({
  path: path.resolve(__dirname, '../.env'),
});

const MONGO_URI = process.env.MONGODB_URI;

if (!MONGO_URI) {
  console.error("❌ MONGODB_URI is missing from .env");
  process.exit(1);
}

// -----------------------------------------------------
// Indian Dummy Alumni Data
// -----------------------------------------------------

const firstNames = [
  "Aarav",
  "Vihaan",
  "Aditya",
  "Arjun",
  "Rohan",
  "Siddharth",
  "Atharva",
  "Pranav",
  "Nikhil",
  "Akash",
  "Rahul",
  "Kunal",
  "Omkar",
  "Yash",
  "Harsh",
  "Abhishek",
  "Sanket",
  "Vedant",
  "Shreyas",
  "Tanmay",
  "Ananya",
  "Aditi",
  "Sneha",
  "Priya",
  "Neha",
  "Ishita",
  "Riya",
  "Sakshi",
  "Pooja",
  "Shruti",
  "Tanvi",
  "Prachi",
  "Vaishnavi",
  "Meera",
  "Kavya",
  "Isha",
  "Rutuja",
  "Sayali",
  "Mrunal",
  "Anjali",
];

const lastNames = [
  "Patil",
  "Kulkarni",
  "Deshmukh",
  "Jadhav",
  "Shinde",
  "Pawar",
  "Joshi",
  "Chavan",
  "More",
  "Kadam",
  "Sawant",
  "Mane",
  "Naik",
  "Bhosale",
  "Gaikwad",
  "Mahajan",
  "Deshpande",
  "Khot",
  "Salunkhe",
  "Patwardhan",
  "Shah",
  "Mehta",
  "Agarwal",
  "Gupta",
  "Sharma",
  "Verma",
  "Nair",
  "Iyer",
  "Reddy",
  "Rao",
];

const departments = [
  "AIML",
  "CSE",
  "ENTC",
  "MECH",
  "CIVIL",
];

const jobPositions = [
  "Software Engineer",
  "Senior Software Engineer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Machine Learning Engineer",
  "Data Analyst",
  "Data Scientist",
  "DevOps Engineer",
  "Cloud Engineer",
  "Cybersecurity Analyst",
  "Product Engineer",
  "Technical Lead",
  "Project Manager",
  "Product Manager",
  "Business Analyst",
  "Embedded Systems Engineer",
  "Electronics Engineer",
  "Design Engineer",
  "Mechanical Engineer",
  "Production Engineer",
  "Civil Engineer",
  "Structural Engineer",
  "Site Engineer",
  "Research Engineer",
  "Solutions Architect",
];

const companies = [
  "Tata Consultancy Services",
  "Infosys",
  "Wipro",
  "Persistent Systems",
  "Tech Mahindra",
  "LTIMindtree",
  "Cognizant",
  "Accenture India",
  "Capgemini India",
  "Zensar Technologies",
  "Tata Elxsi",
  "Bosch India",
  "Siemens India",
  "Bajaj Auto",
  "Mahindra & Mahindra",
  "Tata Technologies",
  "Reliance Industries",
  "HCLTech",
  "KPIT Technologies",
  "Cybage Software",
  "Oracle India",
  "Microsoft India",
  "Amazon India",
  "IBM India",
  "NVIDIA India",
];

const skillsByDepartment = {
  CSE: [
    "JavaScript",
    "React",
    "Node.js",
    "Express.js",
    "MongoDB",
    "Java",
    "Python",
    "SQL",
    "Git",
    "Docker",
    "AWS",
    "REST API",
    "TypeScript",
    "PostgreSQL",
  ],

  AIML: [
    "Python",
    "Machine Learning",
    "Deep Learning",
    "TensorFlow",
    "PyTorch",
    "Pandas",
    "NumPy",
    "Data Analysis",
    "Computer Vision",
    "NLP",
    "SQL",
    "Scikit-learn",
    "Generative AI",
  ],

  ENTC: [
    "Embedded Systems",
    "Arduino",
    "MATLAB",
    "IoT",
    "PCB Design",
    "Microcontrollers",
    "VLSI",
    "Signal Processing",
    "C",
    "C++",
    "Electronics",
    "Communication Systems",
  ],

  MECH: [
    "AutoCAD",
    "SolidWorks",
    "CATIA",
    "ANSYS",
    "Manufacturing",
    "CAD",
    "CAM",
    "Product Design",
    "Thermodynamics",
    "Mechanical Design",
    "Quality Engineering",
  ],

  CIVIL: [
    "AutoCAD",
    "STAAD Pro",
    "Revit",
    "Structural Analysis",
    "Surveying",
    "Construction Management",
    "Project Planning",
    "Quantity Estimation",
    "Civil 3D",
    "Site Engineering",
  ],
};

const locations = [
  {
    city: "Kolhapur",
    state: "Maharashtra",
    lat: 16.705,
    lon: 74.2433,
  },
  {
    city: "Pune",
    state: "Maharashtra",
    lat: 18.5204,
    lon: 73.8567,
  },
  {
    city: "Mumbai",
    state: "Maharashtra",
    lat: 19.076,
    lon: 72.8777,
  },
  {
    city: "Sangli",
    state: "Maharashtra",
    lat: 16.8524,
    lon: 74.5815,
  },
  {
    city: "Satara",
    state: "Maharashtra",
    lat: 17.6805,
    lon: 74.0183,
  },
  {
    city: "Nashik",
    state: "Maharashtra",
    lat: 19.9975,
    lon: 73.7898,
  },
  {
    city: "Nagpur",
    state: "Maharashtra",
    lat: 21.1458,
    lon: 79.0882,
  },
  {
    city: "Bengaluru",
    state: "Karnataka",
    lat: 12.9716,
    lon: 77.5946,
  },
  {
    city: "Hyderabad",
    state: "Telangana",
    lat: 17.385,
    lon: 78.4867,
  },
  {
    city: "Chennai",
    state: "Tamil Nadu",
    lat: 13.0827,
    lon: 80.2707,
  },
  {
    city: "Ahmedabad",
    state: "Gujarat",
    lat: 23.0225,
    lon: 72.5714,
  },
  {
    city: "Gurugram",
    state: "Haryana",
    lat: 28.4595,
    lon: 77.0266,
  },
  {
    city: "Noida",
    state: "Uttar Pradesh",
    lat: 28.5355,
    lon: 77.391,
  },
];

const achievements = [
  "Received the Emerging Engineer Award",
  "Recognized for outstanding project leadership",
  "Won an internal innovation challenge",
  "Led a team that developed an award-winning prototype",
  "Recognized as a top-performing employee",
  "Presented research at a national technical conference",
  "Mentored students through an industry mentorship program",
  "Received recognition for technical excellence",
  "Led a successful digital transformation project",
  "Contributed to an industry research initiative",
];

// -----------------------------------------------------
// Helpers
// -----------------------------------------------------

const getRandomItem = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};

const getRandomSkills = (department) => {
  const departmentSkills = skillsByDepartment[department];

  const shuffled = [...departmentSkills].sort(
    () => Math.random() - 0.5
  );

  const count = 3 + Math.floor(Math.random() * 3);

  return shuffled.slice(0, count).join(", ");
};

const generateIndianPhoneNumber = () => {
  const firstDigit = getRandomItem(["6", "7", "8", "9"]);

  let remainingDigits = "";

  for (let i = 0; i < 9; i++) {
    remainingDigits += Math.floor(Math.random() * 10);
  }

  return `+91${firstDigit}${remainingDigits}`;
};

const createSlug = (value) => {
  return value
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9]/g, "");
};

// -----------------------------------------------------
// Generate Alumni
// -----------------------------------------------------

const generateRandomAlumni = (index) => {
  const firstName = getRandomItem(firstNames);
  const lastName = getRandomItem(lastNames);

  const fullName = `${firstName} ${lastName}`;

  const department = getRandomItem(departments);

  const passOutYear =
    2002 + Math.floor(Math.random() * 24); // 2002 - 2025

  const jobPosition = getRandomItem(jobPositions);

  const companyName = getRandomItem(companies);

  const locationData = getRandomItem(locations);

  const location = `${locationData.city}, ${locationData.state}, India`;

  /*
   * Using example.com intentionally.
   * These addresses look realistic but cannot belong to real users.
   */
  const email =
    `${firstName}.${lastName}.${index + 1}@example.com`
      .toLowerCase();

  /*
   * Deterministic PRN means no accidental duplicate PRNs
   * while generating hundreds of records.
   */
  const prn =
    `PRN${passOutYear}${String(index + 1).padStart(5, "0")}`;

  const skills = getRandomSkills(department);

  const hallOfFame = Math.random() < 0.15;

  const hasAchievement = Math.random() < 0.35;

  const specialAchievements = hasAchievement
    ? `${getRandomItem(achievements)} while working at ${companyName}.`
    : "";

  const successStories = [
    `${fullName} graduated in ${passOutYear} from the ${department} department and currently works as a ${jobPosition} at ${companyName}.`,

    `After graduating in ${passOutYear}, ${fullName} began a professional journey in technology and currently works as a ${jobPosition} at ${companyName}.`,

    `${fullName} is a ${passOutYear} graduate from the ${department} department. With experience in ${skills
      .split(", ")
      .slice(0, 2)
      .join(
        " and "
      )}, ${firstName} currently works as a ${jobPosition} at ${companyName}.`,

    `Since completing graduation in ${passOutYear}, ${fullName} has built a career focused on professional growth, continuous learning, and industry collaboration at ${companyName}.`,
  ];

  return {
    prn,

    fullName,

    email,

    // Will be hashed before insertion
    password: "Demo@12345",

    phoneNumber: generateIndianPhoneNumber(),

    department,

    passOutYear,

    jobPosition,

    companyName,

    location,

    latitude: locationData.lat,

    longitude: locationData.lon,

    successStory: getRandomItem(successStories),

    specialAchievements,

    /*
     * Using example.com instead of real LinkedIn profiles
     * so no generated record accidentally points to a real person.
     */
    linkedInURL:
      `https://example.com/linkedin/${createSlug(
        fullName
      )}-${index + 1}`,

    hallOfFame,

    skills,

    role: "Alumni",

    isVerified: Math.random() < 0.9,

    /*
     * profileImage can stay empty.
     * Your schema's avatar default can be used instead.
     */
    profileImage: "",
  };
};

// -----------------------------------------------------
// Insert Alumni
// -----------------------------------------------------

const generateAndInsertAlumni = async (count) => {
  try {
    await mongoose.connect(MONGO_URI);

    console.log("✅ MongoDB Connected");

    const alumniToInsert = [];

    for (let i = 0; i < count; i++) {
      const alumniData = generateRandomAlumni(i);

      alumniToInsert.push(alumniData);

      if ((i + 1) % 50 === 0) {
        console.log(
          `👤 Generated ${i + 1} alumni records...`
        );
      }
    }

    console.log(
      `✅ Generated ${alumniToInsert.length} alumni records`
    );

    console.log("🔐 Hashing passwords...");

    /*
     * insertMany() does NOT trigger pre('save'),
     * therefore passwords have to be hashed manually here.
     */
    const alumniWithHashedPasswords =
      await Promise.all(
        alumniToInsert.map(async (alumni) => ({
          ...alumni,

          password: await bcrypt.hash(
            alumni.password,
            10
          ),
        }))
      );

    console.log("⏳ Inserting records into MongoDB...");

    const batchSize = 100;

    for (
      let i = 0;
      i < alumniWithHashedPasswords.length;
      i += batchSize
    ) {
      const batch =
        alumniWithHashedPasswords.slice(
          i,
          i + batchSize
        );

      await Alumni.insertMany(batch, {
        ordered: false,
      });

      console.log(
        `✅ Inserted ${Math.min(
          i + batchSize,
          alumniWithHashedPasswords.length
        )}/${alumniWithHashedPasswords.length}`
      );
    }

    console.log(
      "🎉 All dummy alumni inserted successfully!"
    );
  } catch (error) {
    console.error(
      "❌ Error generating/inserting alumni:",
      error
    );
  } finally {
    await mongoose.connection.close();

    console.log("🔗 MongoDB Connection Closed");
  }
};

// -----------------------------------------------------
// Handle Ctrl + C
// -----------------------------------------------------

process.on("SIGINT", async () => {
  await mongoose.connection.close();

  console.log(
    "\n⚠️ MongoDB Connection Closed due to SIGINT"
  );

  process.exit(0);
});

// -----------------------------------------------------
// Generate 500 Demo Alumni
// -----------------------------------------------------

generateAndInsertAlumni(500);