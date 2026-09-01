# Back2Campus

Back2Campus is a student–alumni engagement platform that brings **students, alumni, and administrators** together in one place.

This repository contains a **demo version** of the platform. It uses fictional institution information, dummy profiles, placeholder contact details, and sample opportunities/events so the application can be safely explored.

> **Demo Notice:** All public demo data is intended for portfolio, academic, and demonstration purposes.

---

## ✨ What You Can Explore

Back2Campus includes:

* Alumni networking and discovery
* Mentorship opportunities
* Internship opportunities
* Alumni meets and events
* Expert talks and workshops
* Q&A and knowledge sharing
* Alumni achievements / Hall of Fame
* Student and alumni profiles
* Donation-related workflows
* Mobile access through React Native / Expo

---

# 🔑 Demo Accounts

Use these demo accounts to explore the different parts of Back2Campus.

## 🎓 Student Demo

| Field      | Demo Details                           |
| ---------- | -------------------------------------- |
| Name       | Demo User                              |
| Email      | `demo.student@example.com`             |
| PRN        | `2324000001`                           |
| Department | CSE                                    |
| Study Year | TY                                     |


Use the student authentication method implemented in the running project, such as PRN, verification, registration, or the configured student login flow.

---

## 👨‍💼 Alumni Demo

Seeded alumni accounts use:

```text
Password: demouser123
```

Use the email address of any alumni account created by the alumni seeder.

Example generated email format:

```text
Email: demouser@example.com
Password: demouser123
```

> The email above demonstrates the generated email format. Use an alumni email that actually exists in your seeded database.

---

## 🛡️ Admin Demo

The current project documentation does not contain a fixed seeded admin email and password.

Once you create a **demo-only administrator account**, add its credentials here:

```text
Email: demouser@example.com
Password: demouser123
```

> Never place production administrator credentials in this README.

---

# 👀 Explore by Role

## Student

Use the student demo account to explore the student-facing experience, including:

* Discovering alumni
* Finding mentorship opportunities
* Viewing internships
* Exploring alumni events
* Career-oriented opportunities
* Alumni achievements and profiles

---

## Alumni

Login using a seeded alumni account to explore:

* Alumni Hub
* Q&A
* Creating mentorship opportunities
* Posting internship opportunities
* Alumni meets
* Applying to speak at talks and workshops
* Donation portal
* Alumni profile management

---

## Admin

Login using the seeded demo administrator account to explore the administrative screens and controls included in the current build.

---

# 🧱 Tech Stack

### Web

* React
* Vite
* JavaScript
* Tailwind CSS

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication

### Mobile

* React Native
* Expo

---

# 📁 Project Structure

```text
Back2Campus/
├── client/    # React / Vite frontend
├── server/    # Node / Express backend
└── mobile/    # React Native / Expo app
```

---

# 🚀 Run Back2Campus Locally

## Prerequisites

Install:

* Node.js
* npm
* MongoDB or MongoDB Atlas
* Git

---

## 1. Clone the Repository

```bash
git clone <repository-url>
cd Back2Campus
```

---

## 2. Start the Backend

```bash
cd server
npm install
```

Create the environment file:

```bash
cp .env.example .env
```

Configure the required values inside `.env`, including your MongoDB connection.

Start the backend:

```bash
npm run dev
```

If the project uses the production/start script instead:

```bash
npm start
```

The backend API is expected to run at approximately:

```text
http://localhost:5001/api
```

---

## 3. Start the Frontend

Open another terminal:

```bash
cd client
npm install
```

Create the environment file:

```bash
cp .env.example .env
```

Make sure the frontend points to your backend:

```env
VITE_API_URL=http://localhost:5001/api
```

Start the frontend:

```bash
npm run dev
```

Open:

```text
http://localhost:5173
```

in your browser.

---

## 4. Add Demo Data

If the repository contains seed scripts, run them to populate MongoDB with demo:

* Students
* Alumni
* Mentorship opportunities
* Internships
* Events
* Other sample data

After seeding the database, use the **Demo Accounts** section above to explore the application.

---

# 📱 Run the Mobile App

The mobile application is optional if you only want to explore the web version.

Install dependencies:

```bash
cd mobile
npm install
```

Configure the backend API URL.

When testing on a physical phone, use your computer's local network IP instead of `localhost`.

Example:

```env
API_BASE_URL=http://192.168.1.10:5001/api
```

Start Expo:

```bash
npx expo start
```

Android:

```bash
npx expo run:android
```

iOS on macOS:

```bash
npx expo run:ios
```

---

# 🧪 Demo Content

The public version intentionally uses fictional information.

The demo institution is:

**Northbridge Institute of Engineering & Technology**

Sample demo data can include fictional:

* Students
* Alumni
* Internships
* Mentorship opportunities
* Alumni meets
* Expert talks
* Workshops
* Achievements
* Institution and contact information

---

# 🔒 Important

Keep real credentials and private information out of the repository.

* Do not commit real `.env` files.
* Use `.env.example` for configuration examples.
* Keep production passwords and secrets private.
* Only publish **demo-only accounts** in this README.

---

## Back2Campus

**Connecting students, alumni, opportunities, and experiences — beyond graduation.**
