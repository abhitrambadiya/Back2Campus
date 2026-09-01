import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import apiAlumni from "./api.js"; // Adjust path as needed
import LoadingScreen from "../../components/LoadingScreen.jsx";
import { useAlumniAuth } from "../../context/AlumniAuthContext.jsx";
import img1 from "../../assets/pexels-mike-van-schoonderwalt-1884800-5506025.jpg";
import img2 from "../../assets/pexels-polina-zimmerman-3747516.jpg";
import img3 from "../../assets/pexels-delot-18471488.jpg";

function AlumniKaHome() {
  const avatarColors = [
    "646cff",
    "f97316",
    "10b981",
    "3b82f6",
    "ef4444",
    "a855f7",
  ];

  const getAvatarUrl = (fullName) => {
    if (!fullName) return "";
    // DiceBear API for avatars
    return `https://api.dicebear.com/6.x/initials/svg?seed=${encodeURIComponent(fullName)}&backgroundColor=${getRandomColor(fullName)}`;
  };

  const getRandomColor = (fullName) => {
    if (!fullName) return avatarColors[0];
    const index =
      [...fullName].reduce((acc, char) => acc + char.charCodeAt(0), 0) %
      avatarColors.length;
    return avatarColors[index];
  };

  const { alumni, logout, loading: authLoading } = useAlumniAuth();
  const [loading, setLoading] = useState(true);
  const [alumniData, setAlumniData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAlumniProfile = async () => {
      if (authLoading) return;

      const start = Date.now();
      try {
        const response = await apiAlumni.get("/profile");
        const elapsed = Date.now() - start;
        const delay = Math.max(0, 1000 - elapsed);

        setTimeout(() => {
          setAlumniData(response.data);
          setLoading(false);
        }, delay);
      } catch (error) {
        const elapsed = Date.now() - start;
        const delay = Math.max(0, 1000 - elapsed);

        setTimeout(() => {
          console.error("Failed to fetch alumni profile:", error);
          navigate("/alumni-login");
          setLoading(false);
        }, delay);
      }
    };

    if (!authLoading) {
      fetchAlumniProfile();
    }
  }, [navigate, authLoading]);

  const handleLogout = async () => {
    try {
      await apiAlumni.post("/logout", {}, { withCredentials: true });
      logout(); // Use the logout function from context
    } catch (error) {
      console.error("Logout failed:", error);
      // Still attempt to logout locally if server logout fails
      logout();
    }
  };

  if (authLoading || loading) {
    return <LoadingScreen message="Loading Alumni Profile..." />;
  }

  if (!alumniData) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-700 text-xl">
        No alumni data found. Please{" "}
        <button
          onClick={() => navigate("/alumni-login")}
          className="text-indigo-600 underline"
        >
          login again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      <nav className="bg-white shadow fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center">
          <a
            href="/alumni-home"
            className="text-2xl font-bold text-indigo-600 no-underline"
          >
            Alumni Hub
          </a>
          <div className="flex items-center gap-8">
            <Link
              to="/alumni-home"
              className="text-gray-600 font-medium hover:text-indigo-600 transition-colors no-underline"
            >
              Home
            </Link>
            <Link
              to="/alumni-faq"
              className="text-gray-600 font-medium hover:text-indigo-600 transition-colors no-underline"
            >
              Q&A
            </Link>
            <Link
              to="/alumni-mentorship"
              className="text-gray-600 font-medium hover:text-indigo-600 transition-colors no-underline"
            >
              Add Mentorship
            </Link>
            <Link
              to="/alumni-internship"
              className="text-gray-600 font-medium hover:text-indigo-600 transition-colors no-underline"
            >
              Add Internsip
            </Link>
            <Link
              to="/alumni-meet"
              className="text-gray-600 font-medium hover:text-indigo-600 transition-colors no-underline"
            >
              Alumni Meet
            </Link>
            <Link
              to="/alumni-event"
              className="text-gray-600 font-medium hover:text-indigo-600 transition-colors no-underline"
            >
              Alumni Event
            </Link>
            <Link
              to="/alumni-donation"
              className="text-gray-600 font-medium hover:text-indigo-600 transition-colors no-underline"
            >
              Donation Portal
            </Link>
            <button
              onClick={handleLogout}
              className="text-gray-700 border border-gray-300 px-4 py-1.5 rounded-md ml-4 hover:text-indigo-600 hover:border-indigo-600 hover:bg-gray-50 transition-all no-underline font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto mt-24 mb-8 px-8 w-full">
        <section className="bg-white rounded-lg p-8 mb-8 shadow">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-3">
            <img
              src={getAvatarUrl(alumniData.fullName)}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover bg-gray-100"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {alumniData.fullName}
              </h1>
              <p className="text-gray-600 mb-2">{alumniData.email}</p>
              {alumniData.department && (
                <p className="text-gray-600 mb-2">
                  Department of {alumniData.department}
                </p>
              )}
              {alumniData.jobPosition && alumniData.companyName && (
                <p className="text-gray-600 mb-2">
                  {alumniData.jobPosition} at {alumniData.companyName}
                </p>
              )}
              {alumniData.passOutYear && (
                <p className="text-gray-600">
                  Class of {alumniData.passOutYear}
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="bg-white rounded-lg p-8 shadow">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Have a Startup Idea? Build It at Northbridge Innovation Hub
          </h2>

          <div className="text-gray-700 mb-6">
            Northbridge Innovation Hub is a fictional incubation center created
            for this demo platform. It represents how students and aspiring
            founders can receive guidance, resources, and collaborative support
            to turn early-stage ideas into practical projects and startup
            concepts.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Mentorship & Guidance
              </h3>
              <p className="text-gray-600 text-sm">
                Connect with mentors, experienced professionals, and faculty
                members who can provide feedback, direction, and practical
                insights for your ideas.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Workspace & Resources
              </h3>
              <p className="text-gray-600 text-sm">
                Explore a collaborative environment with access to shared
                workspaces, technical resources, and tools designed to support
                prototype development.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Growth Opportunities
              </h3>
              <p className="text-gray-600 text-sm">
                Discover networking events, startup showcases, industry
                interactions, and potential funding pathways that can help
                promising ideas grow.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-lg p-8 shadow mt-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            What's New at Northbridge Institute
          </h2>

          <div className="text-gray-700 mb-3">
            Explore the latest developments, facilities, and initiatives
            introduced across our fictional campus to enhance learning,
            collaboration, and innovation.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {/* Innovation Lab */}
            <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
              <img
                src={img1}
                alt="Innovation Lab"
                className="w-full h-48 object-cover"
              />

              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Innovation & Prototype Lab
                </h3>

                <p className="text-gray-600 text-sm">
                  A collaborative space where students can experiment with
                  ideas, develop prototypes, and work on innovative academic and
                  technical projects.
                </p>
              </div>
            </div>

            {/* Digital Library */}
            <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
              <img
                src={img2}
                alt="Digital Library"
                className="w-full h-48 object-cover"
              />

              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Modern Digital Library
                </h3>

                <p className="text-gray-600 text-sm">
                  A modern learning space providing access to digital resources,
                  research materials, e-books, journals, and collaborative study
                  areas for students.
                </p>
              </div>
            </div>

            {/* Computing Lab */}
            <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
              <img
                src={img3}
                alt="Advanced Computing Lab"
                className="w-full h-48 object-cover"
              />

              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Advanced Computing Lab
                </h3>

                <p className="text-gray-600 text-sm">
                  A dedicated computing environment designed for programming,
                  artificial intelligence, software development, and hands-on
                  technology learning.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-200 py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="/FAQ"
                    className="text-gray-400 hover:text-white transition-colors duration-200 no-underline"
                  >
                    FAQ
                  </a>
                </li>
                <li>
                  <a
                    href="/CookiePolicy"
                    className="text-gray-400 hover:text-white transition-colors duration-200 no-underline"
                  >
                    Cookie Policy
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="/TermsOfService"
                    className="text-gray-400 hover:text-white transition-colors duration-200 no-underline"
                  >
                    Terms Of Service
                  </a>
                </li>
                <li>
                  <a
                    href="/PrivacyPolicy"
                    className="text-gray-400 hover:text-white transition-colors duration-200 no-underline"
                  >
                    Privacy and Policy
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <ul className="space-y-2">
                <li className="text-gray-400">Email: info@example.in</li>
                <li className="text-gray-400">
                  Address: 123 Innovation Avenue, Tech Park Road, XYZ City - 400 001, Maharashtra
                </li>
              </ul>
            </div>
          </div>

          <div className="text-center pt-8 mt-8 border-t border-gray-700 text-gray-400">
            ©️ {new Date().getFullYear()} Back2Campus. All rights
            reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default AlumniKaHome;
