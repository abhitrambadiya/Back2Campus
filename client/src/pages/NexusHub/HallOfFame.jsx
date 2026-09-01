import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Building,
  Briefcase,
  Medal,
  Calendar,
  Trophy,
  Star,
  User,
  Filter,
  Network,
  Mail,
  Linkedin,
  Twitter,
  Facebook,
} from "lucide-react";
import axios from "axios";
import { debounce } from "lodash";

const HallOfFame = () => {
  // State for alumni data - only featured alumni now
  const [featuredAlumni, setFeaturedAlumni] = useState([]);
  const [loading, setLoading] = useState(true);

  // Predefined departments
  const departments = ["All", "CSE", "AIML", "ENTC", "CIVIL", "MECH"];

  // Pagination and filter state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [itemsPerPage] = useState(6);

  // Debounced search function to prevent too many API calls
  const debouncedSearch = useCallback(
    debounce((searchValue) => {
      setSearchQuery(searchValue);
      setCurrentPage(1); // Reset to first page on search
    }, 500),
    []
  );

  // Fetch only featured alumni (hallOfFame: true) with pagination
  const fetchFeaturedAlumni = useCallback(async () => {
    try {
      setLoading(true);
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
      const response = await axios.get(`${API_URL}/nexushub/hall-of-fame`, {
        params: {
          page: currentPage,
          limit: itemsPerPage,
          department: departmentFilter === "All" ? undefined : departmentFilter,
          search: searchQuery || undefined,
          hallOfFame: true, // Only get featured alumni
        },
      });

      setFeaturedAlumni(response.data.alumni || []);
      setTotalPages(response.data.pagination?.totalPages || 1);
    } catch (error) {
      console.error("Error fetching featured alumni:", error);
      setFeaturedAlumni([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [currentPage, departmentFilter, searchQuery, itemsPerPage]);

  // Fetch featured alumni when filters change
  useEffect(() => {
    fetchFeaturedAlumni();
    debouncedSearch.cancel();
  }, [fetchFeaturedAlumni, debouncedSearch]);

  // Handle search input change
  const handleSearchChange = (e) => {
    debouncedSearch(e.target.value);
  };

  // Handle department filter change
  const handleDepartmentChange = (department) => {
    setDepartmentFilter(department);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  // Handle page navigation
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-white">
      {/* Header with Back Button */}
      <div className="pt-20 px-4 md:px-8 lg:px-16 max-w-7xl mx-auto">
        <Link
          to="/NexusHub"
          className="inline-flex items-center text-primary-color hover:text-indigo-700 transition-colors mb-6"
        >
          <ChevronLeft size={20} className="mr-1" />
          <span>Back to Home</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-near-black mb-4">
            Hall of Fame
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl">
            Celebrating our outstanding alumni who have achieved remarkable
            success in their careers and made significant contributions to their
            fields.
          </p>
        </motion.div>
      </div>

      {/* Main Content */}
      <main className="px-4 md:px-8 lg:px-16 pb-16 max-w-7xl mx-auto">
        {/* Decorative Elements */}
        <div className="absolute top-40 right-10 opacity-10 hidden lg:block">
          <Trophy size={160} className="text-amber-500" />
        </div>
        <div className="absolute top-1/3 left-10 opacity-10 hidden lg:block">
          <Star size={120} className="text-amber-500" />
        </div>

        {/* Search and Filter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-xl shadow-md p-4 md:p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* Search Input */}
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search for featured alumni..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-color focus:border-transparent"
                onChange={handleSearchChange}
              />
            </div>

            {/* Department Filter */}
            <div className="flex-shrink-0">
              <div className="relative inline-block text-left w-full md:w-auto">
                <div className="flex items-center">
                  <Filter size={18} className="text-gray-500 mr-2" />
                  <span className="text-sm font-medium text-gray-700">
                    Filter by Department:
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {departments.map((department) => (
                    <button
                      key={department}
                      onClick={() => handleDepartmentChange(department)}
                      className={`px-3 py-1 rounded-full text-sm ${
                        departmentFilter === department
                          ? "bg-primary-color text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {department}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Featured Alumni Grid with Pagination */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="relative z-10"
        >
          <div className="flex items-center mb-6">
            <Trophy size={24} className="text-amber-500 mr-2" />
            <h2 className="text-2xl font-bold text-gray-900">
              Featured Alumni
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              // Skeleton Loaders
              Array.from({ length: 6 }).map((_, index) => (
                <AlumniCardSkeleton key={`skeleton-${index}`} />
              ))
            ) : featuredAlumni.length > 0 ? (
              // Featured Alumni Cards
              featuredAlumni.map((alumni, index) => (
                <AlumniCard
                  key={`featured-${alumni._id || index}`}
                  alumni={alumni}
                  delay={index}
                  highlighted={true}
                />
              ))
            ) : (
              // No results
              <div className="col-span-full flex flex-col items-center justify-center py-12">
                <Trophy size={48} className="text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No featured alumni found
                </h3>
                <p className="text-gray-500">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center items-center">
              <button
                onClick={goToPrevPage}
                disabled={currentPage === 1}
                className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  currentPage === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-200 text-gray-700 hover:bg-primary-color hover:text-white"
                } transition-colors`}
                aria-label="Previous page"
              >
                <ChevronLeft size={20} />
              </button>

              <div className="mx-4 flex items-center">
                <span className="font-medium text-gray-700">{currentPage}</span>
                <span className="mx-2 text-gray-400">/</span>
                <span className="text-gray-500">{totalPages}</span>
              </div>

              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  currentPage === totalPages
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-200 text-gray-700 hover:bg-primary-color hover:text-white"
                } transition-colors`}
                aria-label="Next page"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </motion.div>
      </main>

      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center mb-4">
                <Network size={24} className="text-primary-color mr-2" />
                <span className="font-bold text-xl">
                  <span className="text-primary-color">Nexus</span>Hub
                </span>
              </div>
              <p className="text-cool-gray text-sm">
                Connecting students with alumni for guidance, opportunities, and
                networking.
              </p>
            </div>

            <div className="col-span-1 md:col-span-1">
              <h3 className="text-lg font-semibold mb-4">Features</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/NexusHub/hall-of-fame"
                    className="text-cool-gray hover:text-primary-color transition-colors"
                  >
                    Hall of Fame
                  </Link>
                </li>
                <li>
                  <Link
                    to="/NexusHub/internships"
                    className="text-cool-gray hover:text-primary-color transition-colors"
                  >
                    Internships
                  </Link>
                </li>
                <li>
                  <Link
                    to="/NexusHub/alumni"
                    className="text-cool-gray hover:text-primary-color transition-colors"
                  >
                    Explore Alumni
                  </Link>
                </li>
                <li>
                  <Link
                    to="/NexusHub/mentorship"
                    className="text-cool-gray hover:text-primary-color transition-colors"
                  >
                    Mentorship
                  </Link>
                </li>
              </ul>
            </div>

            <div className="col-span-1 md:col-span-1">
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/PrivacyPolicy"
                    className="text-cool-gray hover:text-primary-color transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    to="/TermsOfService"
                    className="text-cool-gray hover:text-primary-color transition-colors"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    to="/CookiePolicy"
                    className="text-cool-gray hover:text-primary-color transition-colors"
                  >
                    Cookie Policy
                  </Link>
                </li>
                <li>
                  <Link
                    to="/Accessibility"
                    className="text-cool-gray hover:text-primary-color transition-colors"
                  >
                    Accessibility
                  </Link>
                </li>
              </ul>
            </div>

            <div className="col-span-1 md:col-span-1">
              <h3 className="text-lg font-semibold mb-4">Connect With Us</h3>
              <div className="flex items-center mb-3">
                <Mail size={16} className="mr-2 text-cool-gray" />
                <a
                  href="mailto:support@nexushub.com"
                  className="text-cool-gray hover:text-primary-color transition-colors"
                >
                  support@nexushub.com
                </a>
              </div>
              <div className="flex space-x-4 mt-4">
                <a
                  href="#"
                  className="text-cool-gray hover:text-primary-color transition-colors"
                >
                  <Linkedin size={20} />
                </a>
                <a
                  href="#"
                  className="text-cool-gray hover:text-primary-color transition-colors"
                >
                  <Twitter size={20} />
                </a>
                <a
                  href="#"
                  className="text-cool-gray hover:text-primary-color transition-colors"
                >
                  <Facebook size={20} />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-gray mt-8 pt-8 text-center text-cool-gray text-sm">
            © 2023 Nexus Hub. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

// Alumni Card Component (unchanged)
const AlumniCard = ({ alumni, delay, highlighted }) => {
  const getAvatarUrl = (name) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name
    )}&background=646cff&color=fff&rounded=true`;
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: delay * 0.1 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className={`relative rounded-xl overflow-hidden border shadow-md ${
        highlighted
          ? "border-amber-400 bg-gradient-to-br from-amber-50 to-white shadow-amber-100"
          : "border-gray-200 bg-white"
      }`}
    >
      {highlighted && (
        <div className="absolute -right-6 -top-6 w-24 h-24 bg-amber-400 rounded-full opacity-20"></div>
      )}

      <div className="p-6 relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
          <div
            className={`w-20 h-20 rounded-full overflow-hidden flex-shrink-0 border-2 ${
              highlighted ? "border-amber-400" : "border-gray-200"
            }`}
          >
            <img
              src={alumni.profilePhoto || getAvatarUrl(alumni.fullName)}
              alt={alumni.fullName}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = getAvatarUrl(alumni.fullName);
              }}
            />
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-900">
              {alumni.fullName}
            </h3>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
              <p className="text-sm text-gray-600">{alumni.department}</p>
              <div className="flex items-center text-sm text-gray-600">
                <Calendar size={14} className="mr-1" />
                <span>{alumni.passOutYear}</span>
              </div>
            </div>
          </div>
        </div>

        {alumni.specialAchievements && (
          <div className="mb-4">
            <div className="flex items-center mb-1">
              <Medal size={16} className="text-amber-500 mr-2" />
              <h4 className="font-medium text-gray-800">Key Achievements</h4>
            </div>
            <p className="text-sm text-gray-600 pl-6">
              {alumni.specialAchievements}
            </p>
          </div>
        )}

        <div className="flex flex-col gap-1 mt-3">
          {alumni.jobPosition && (
            <div className="flex items-center">
              <Briefcase size={16} className="text-gray-500 mr-2" />
              <span className="text-sm text-gray-700">
                {alumni.jobPosition}
              </span>
            </div>
          )}

          {alumni.companyName && (
            <div className="flex items-center">
              <Building size={16} className="text-gray-500 mr-2" />
              <span className="text-sm text-gray-700">
                {alumni.companyName}
              </span>
            </div>
          )}
        </div>
      </div>

      {highlighted && (
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
            Featured
          </span>
        </div>
      )}
    </motion.div>
  );
};

// Skeleton loader for alumni cards (unchanged)
const AlumniCardSkeleton = () => (
  <div className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-md p-6">
    <div className="flex items-center mb-4">
      <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse"></div>
      <div className="ml-4">
        <div className="h-5 bg-gray-200 rounded w-40 mb-2 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
      </div>
    </div>
    <div className="h-4 bg-gray-200 rounded w-full mb-2 animate-pulse"></div>
    <div className="h-4 bg-gray-200 rounded w-full mb-2 animate-pulse"></div>
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4 animate-pulse"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2 animate-pulse"></div>
    <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
  </div>
);

export default HallOfFame;