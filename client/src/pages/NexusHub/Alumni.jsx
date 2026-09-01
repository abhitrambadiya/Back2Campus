import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  Search, 
  MapPin, 
  GraduationCap,
  Users,
  Building,
  Calendar,
  ChevronRight,
  Mail,
  Network,
  Linkedin,
  Twitter,
  Facebook,
  XCircle,
} from 'lucide-react';
import api from '../../services/api';

const Alumni = () => {
  // State for alumni data
  const [alumni, setAlumni] = useState([]);
  const [totalAlumni, setTotalAlumni] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [graduationYearFilter, setGraduationYearFilter] = useState('All');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 6;

  // Mock filters (can be fetched from API if needed)
  const departments = ['All', 'CSE', 'AIML', 'ENTC', 'MECH', 'CIVIL'];
  const graduationYears = ['All', '2023', '2022', '2021', '2020', '2019', 'Before 2019'];

  // Fetch alumni from API
  const fetchAlumni = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query parameters
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('limit', itemsPerPage.toString());
      
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      
      if (departmentFilter !== 'All') {
        params.append('department', departmentFilter);
      }
      
      if (graduationYearFilter !== 'All') {
        params.append('passOutYear', graduationYearFilter);
      }
      
      // Make API request
      const response = await api.get(`/nexushub/explorealumni?${params.toString()}`);
      
      // Update state with response data
      setAlumni(response.data.alumni);
      setTotalAlumni(response.data.totalAlumni);
      setTotalPages(response.data.totalPages);
      
    } catch (err) {
      console.error('Error fetching alumni:', err);
      setError('Failed to load alumni data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch alumni on initial load and when filters or pagination changes
  useEffect(() => {
    fetchAlumni();
  }, [currentPage, searchQuery, departmentFilter, graduationYearFilter]);

  // Handle search input change with debounce
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(debouncedSearch);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [debouncedSearch]);

  const handleSearchChange = (e) => {
    setDebouncedSearch(e.target.value);
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll to top when changing page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle next and previous page
  const handlePrevPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
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
            Explore Alumni
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl">
            Connect with our alumni network to gain insights, seek guidance, and explore career opportunities.
          </p>
        </motion.div>
      </div>
      
      {/* Main Content */}
      <main className="px-4 md:px-8 lg:px-16 pb-16 max-w-7xl mx-auto">
        {/* Search and Filter Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-xl shadow-md p-4 md:p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-start gap-4">
            {/* Search Input */}
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search alumni by name, company, position, or location..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-color focus:border-transparent"
                value={debouncedSearch}
                onChange={handleSearchChange}
              />
            </div>
            
            {/* Filters */}
            <div className="flex-shrink-0 w-full md:w-auto flex flex-col sm:flex-row gap-4">
              {/* Department Filter */}
              <div className="w-full sm:w-auto">
                <div className="flex items-center mb-2">
                  <Building size={16} className="text-gray-500 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Department</span>
                </div>
                <select
                  value={departmentFilter}
                  onChange={(e) => {
                    setDepartmentFilter(e.target.value);
                    setCurrentPage(1); // Reset to first page when filter changes
                  }}
                  className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary-color focus:border-transparent"
                >
                  {departments.map(department => (
                    <option key={department} value={department}>{department}</option>
                  ))}
                </select>
              </div>
              
              {/* Graduation Year Filter */}
              <div className="w-full sm:w-auto">
                <div className="flex items-center mb-2">
                  <Calendar size={16} className="text-gray-500 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Graduation Year</span>
                </div>
                <select
                  value={graduationYearFilter}
                  onChange={(e) => {
                    setGraduationYearFilter(e.target.value);
                    setCurrentPage(1); // Reset to first page when filter changes
                  }}
                  className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary-color focus:border-transparent"
                >
                  {graduationYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Results Stats */}
        <div className="flex items-center mb-6 text-gray-600">
          <Users size={18} className="mr-2" />
          <span>
            {loading
              ? 'Loading alumni...'
              : `Showing ${alumni.length} alumni out of ${totalAlumni} total`
            }
          </span>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6 flex items-center">
            <XCircle size={20} className="mr-2 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Alumni Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            // Skeleton Loaders
            Array.from({ length: 6 }).map((_, index) => (
              <AlumniCardSkeleton key={index} />
            ))
          ) : alumni.length > 0 ? (
            // Alumni Cards
            alumni.map((person, index) => (
              <AlumniCard 
                key={person._id} 
                alumnus={person}
                delay={index} 
              />
            ))
          ) : (
            // No results
            <div className="col-span-full flex flex-col items-center justify-center py-12">
              <Users size={48} className="text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No alumni found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>

        {/* Enhanced Pagination with Next/Prev */}
        {totalPages > 1 && !loading && (
          <div className="mt-8 flex flex-col items-center">
            <div className="flex items-center space-x-4">
              {/* Previous Page Button */}
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className={`flex items-center justify-center px-4 py-2 rounded-md ${
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
                aria-label="Previous page"
              >
                <ChevronLeft size={20} />
                <span className="hidden sm:inline ml-1">Previous</span>
              </button>
              
              {/* Page Numbers - Desktop */}
              <div className="hidden md:flex items-center space-x-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  // Show first page, last page, current page, and pages around current
                  const shouldShowPage = 
                    page === 1 || 
                    page === totalPages || 
                    (page >= currentPage - 1 && page <= currentPage + 1);
                  
                  // Show ellipsis for gaps
                  if (!shouldShowPage) {
                    // Show ellipsis only once between gaps
                    if (page === 2 || page === totalPages - 1) {
                      return <span key={`ellipsis-${page}`} className="px-2">...</span>;
                    }
                    return null;
                  }
                  
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`min-w-[40px] h-10 flex items-center justify-center rounded-md ${
                        currentPage === page
                          ? 'bg-primary-color text-white'
                          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>
              
              {/* Page indicator - Mobile */}
              <div className="md:hidden flex items-center">
                <span className="text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
              </div>
              
              {/* Next Page Button */}
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`flex items-center justify-center px-4 py-2 rounded-md ${
                  currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
                aria-label="Next page"
              >
                <span className="hidden sm:inline mr-1">Next</span>
                <ChevronRight size={20} />
              </button>
            </div>
            
            {/* Jump to Page - Optional */}
            <div className="mt-4 flex items-center space-x-2 text-sm text-gray-600">
              <span>Jump to:</span>
              <select
                value={currentPage}
                onChange={(e) => handlePageChange(Number(e.target.value))}
                className="border border-gray-300 rounded-md p-1 focus:outline-none focus:ring-2 focus:ring-primary-color focus:border-transparent"
              >
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <option key={page} value={page}>
                    Page {page}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
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
              Connecting students with alumni for guidance, opportunities, and networking.
            </p>
          </div>
          
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-lg font-semibold mb-4">Features</h3>
            <ul className="space-y-2">
              <li><Link to="/NexusHub/hall-of-fame" className="text-cool-gray hover:text-primary-color transition-colors">Hall of Fame</Link></li>
              <li><Link to="/NexusHub/internships" className="text-cool-gray hover:text-primary-color transition-colors">Internships</Link></li>
              <li><Link to="/NexusHub/alumni" className="text-cool-gray hover:text-primary-color transition-colors">Explore Alumni</Link></li>
              <li><Link to="/NexusHub/mentorship" className="text-cool-gray hover:text-primary-color transition-colors">Mentorship</Link></li>
            </ul>
          </div>
          
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><Link to="/PrivacyPolicy" className="text-cool-gray hover:text-primary-color transition-colors">Privacy Policy</Link></li>
              <li><Link to="/TermsOfService" className="text-cool-gray hover:text-primary-color transition-colors">Terms of Service</Link></li>
              <li><Link to="/CookiePolicy" className="text-cool-gray hover:text-primary-color transition-colors">Cookie Policy</Link></li>
              <li><Link to="/Accessibility" className="text-cool-gray hover:text-primary-color transition-colors">Accessibility</Link></li>
            </ul>
          </div>
          
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-lg font-semibold mb-4">Connect With Us</h3>
            <div className="flex items-center mb-3">
              <Mail size={16} className="mr-2 text-cool-gray" />
              <a href="mailto:support@nexushub.com" className="text-cool-gray hover:text-primary-color transition-colors">
                support@nexushub.com
              </a>
            </div>
            <div className="flex space-x-4 mt-4">
              <a href="#" className="text-cool-gray hover:text-primary-color transition-colors">
                <Linkedin size={20} />
              </a>
              <a href="#" className="text-cool-gray hover:text-primary-color transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-cool-gray hover:text-primary-color transition-colors">
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

// Alumni Card Component
const AlumniCard = ({ alumnus, delay }) => {
  // Extract fields from alumnus object
  const {
    _id,
    fullName,
    avatar,
    department,
    passOutYear,
    jobPosition,
    companyName,
    location,
    successStory,
    email,
    linkedInURL,
    specialAchievements
  } = alumnus;
  
  // Convert specialAchievements string to array if needed
  const achievementsList = specialAchievements
    ? typeof specialAchievements === 'string'
      ? specialAchievements.split('|').filter(item => item.trim() !== '')
      : Array.isArray(specialAchievements) 
        ? specialAchievements 
        : []
    : [];
  
  // Generate degree text based on department
  let degreeText = '';
  switch (department) {
    case 'CSE':
      degreeText = 'B.Tech in Computer Science';
      break;
    case 'AIML':
      degreeText = 'B.Tech in Artificial Intelligence & ML';
      break;
    case 'ENTC':
      degreeText = 'B.Tech in Electronics and Telecommunication';
      break;
    case 'MECH':
      degreeText = 'B.Tech in Mechanical Engineering';
      break;
    case 'CIVIL':
      degreeText = 'B.Tech in Civil Engineering';
      break;
    default:
      degreeText = `B.Tech in ${department}`;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: delay * 0.1 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-md hover:shadow-lg transition-all h-full flex flex-col"
    >
      <div className="p-6 flex-grow">
        <div className="flex items-start mb-4">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-full overflow-hidden mr-4 flex-shrink-0 border-2 border-primary-color">
            <img 
              src={avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=6366F1&color=fff`} 
              alt={fullName}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=6366F1&color=fff`;
              }}
            />
          </div>
          
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-1">
              {fullName}
            </h3>
            <p className="text-primary-color font-medium">
              {jobPosition || 'Alumni'}
            </p>
            {companyName && (
              <p className="text-gray-600 text-sm">
                {companyName}
              </p>
            )}
          </div>
        </div>
        
        {/* Alumni Details */}
        <div className="space-y-4 mb-4">
          <div className="flex items-start">
            <GraduationCap size={16} className="text-gray-500 mr-2 mt-0.5" />
            <div>
              <p className="text-sm text-gray-600">{degreeText}</p>
              <p className="text-xs text-gray-500">{department} • {passOutYear}</p>
            </div>
          </div>
          
          {location && (
            <div className="flex items-start">
              <MapPin size={16} className="text-gray-500 mr-2 mt-0.5" />
              <p className="text-sm text-gray-600">{location}</p>
            </div>
          )}
          
          {successStory && (
            <div>
              <p className="text-sm font-medium text-gray-900 mb-1">Success Story</p>
              <p className="text-sm text-gray-600">{successStory}</p>
            </div>
          )}
          
          {achievementsList.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-900 mb-1">Key Achievements</p>
              <ul className="list-disc list-inside text-sm text-gray-600">
                {achievementsList.map((achievement, index) => (
                  <li key={index}>{achievement}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      
      <div className="p-4 border-t border-gray-100 mt-auto">
        <div className="flex justify-between">
          {email && (
            <a 
              href={`mailto:${email}`}
              className="flex items-center justify-center w-full py-2 px-3 text-sm text-primary-color hover:bg-indigo-50 rounded-md transition-colors mr-2"
              title="Email"
            >
              <Mail size={16} className="mr-2" />
              <span>Email</span>
            </a>
          )}
          
          {linkedInURL && (
            <a 
              href={linkedInURL} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center w-full py-2 px-3 text-sm text-primary-color hover:bg-indigo-50 rounded-md transition-colors"
              title="LinkedIn Profile"
            >
              <Linkedin size={16} className="mr-2" />
              <span>LinkedIn</span>
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Skeleton loader for alumni cards
const AlumniCardSkeleton = () => (
  <div className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-md h-full">
    <div className="p-6">
      <div className="flex items-start mb-4">
        <div className="w-16 h-16 bg-gray-200 rounded-full mr-4 animate-pulse"></div>
        <div>
          <div className="h-6 bg-gray-200 rounded w-36 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-24 mb-1 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
        </div>
      </div>
      
      <div className="space-y-4 mb-4">
        <div className="flex items-start">
          <div className="w-4 h-4 bg-gray-200 rounded mr-2 mt-0.5 animate-pulse"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-full mb-1 animate-pulse"></div>
            <div className="h-3 bg-gray-200 rounded w-1/3 animate-pulse"></div>
          </div>
        </div>
        
        <div className="flex items-start">
          <div className="w-4 h-4 bg-gray-200 rounded mr-2 mt-0.5 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
        </div>
        
        <div className="mb-6">
          <div className="h-4 bg-gray-200 rounded w-full mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
        </div>
      </div>
      
      <div className="flex justify-between mt-auto">
        <div className="h-10 bg-gray-200 rounded w-1/2 mr-2 animate-pulse"></div>
        <div className="h-10 bg-gray-200 rounded w-1/2 animate-pulse"></div>
      </div>
    </div>
  </div>
);

export default Alumni;
