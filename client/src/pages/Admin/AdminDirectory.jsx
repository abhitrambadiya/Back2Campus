import React, { useState, useEffect } from 'react';
import { Search, X, Home, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { Link } from "react-router-dom";
import axios from 'axios';
import LoadingScreen from "../../components/LoadingScreen";
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

function App() {
  const [alumniList, setAlumniList] = useState([]);
  const [selectedAlumni, setSelectedAlumni] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("department");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingStars, setUpdatingStars] = useState(new Set()); // Track which stars are being updated
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [alumniPerPage] = useState(20);

  const getAvatarUrl = (name) => {
    return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&radius=50`;
  };

  const processSkills = (skillsData) => {
    if (Array.isArray(skillsData)) return skillsData;
    if (typeof skillsData === 'string') return skillsData.split(',').map(skill => skill.trim()).filter(skill => skill);
    return [];
  };

  const processAchievements = (achievementsData) => {
    if (Array.isArray(achievementsData)) return achievementsData;
    if (typeof achievementsData === 'string') return achievementsData.split(',').map(item => item.trim()).filter(item => item);
    return [];
  };

  // Function to toggle featured status
  const toggleFeaturedStatus = async (alumniId, currentStatus) => {
    // Prevent multiple clicks on the same star
    if (updatingStars.has(alumniId)) return;
    
    setUpdatingStars(prev => new Set(prev).add(alumniId));
    
    try {
      const response = await axios.patch(`${apiUrl}/admin/alumni/${alumniId}/featured`, {
        hallOfFame: !currentStatus
      });
      
      // Update the local state
      setAlumniList(prevList => 
        prevList.map(alumni => 
          alumni.id === alumniId 
            ? { ...alumni, hallOfFame: !currentStatus }
            : alumni
        )
      );
      
      // Show success message (optional)
      console.log(`Alumni ${!currentStatus ? 'added to' : 'removed from'} Hall of Fame`);
      
    } catch (error) {
      console.error('Error updating featured status:', error);
      // You might want to show an error notification here
      alert('Failed to update featured status. Please try again.');
    } finally {
      setUpdatingStars(prev => {
        const newSet = new Set(prev);
        newSet.delete(alumniId);
        return newSet;
      });
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchData = async () => {
      const start = Date.now();
      setIsLoading(true);
      try {
        const res = await axios.get(`${apiUrl}/admin/admin-directory`, { signal });
        
        const alumniWithAvatars = res.data.map((alumni, index) => ({
          ...alumni,
          id: alumni.id || `alumni-${index}`,
          avatar: getAvatarUrl(alumni.fullName || `User${index}`),
          currentPosition: alumni.jobPosition || "Not specified",
          company: alumni.companyName || "Not specified",
          skills: processSkills(alumni.skills),
          achievements: processAchievements(alumni.specialAchievements),
          linkedInURL: alumni.linkedInURL || "#",
          phone: alumni.phoneNumber || "N/A",
          hallOfFame: alumni.hallOfFame || false // Include the hallOfFame field
        }));
        setAlumniList(alumniWithAvatars);
        setError(null);
      } catch (error) {
        if (!axios.isCancel(error)) {
          console.error("Error fetching alumni directory:", error);
          setError("Failed to load alumni data. Please try again later.");
        }
      } finally {
        const elapsed = Date.now() - start;
        const remaining = 1000 - elapsed;

        setTimeout(() => {
          setIsLoading(false);
        }, remaining > 0 ? remaining : 0);
      }
    };

    fetchData();

    return () => {
      controller.abort();
    };
  }, []);

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const filteredAlumni = alumniList
    .filter(alumni =>
      alumni.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alumni.department?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const valA = a[sortBy];
      const valB = b[sortBy];

      if (sortBy === "passOutYear") {
        return (parseInt(valA) || 0) - (parseInt(valB) || 0);
      } else if (sortBy === "hallOfFame") {
        // Sort featured alumni first
        return (b.hallOfFame ? 1 : 0) - (a.hallOfFame ? 1 : 0);
      } else {
        return (valA || "").toString().localeCompare((valB || "").toString());
      }
    });

  // Pagination logic
  const indexOfLastAlumni = currentPage * alumniPerPage;
  const indexOfFirstAlumni = indexOfLastAlumni - alumniPerPage;
  const currentAlumni = filteredAlumni.slice(indexOfFirstAlumni, indexOfLastAlumni);
  const totalPages = Math.ceil(filteredAlumni.length / alumniPerPage);

  // Page navigation functions
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const goToPrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  if (isLoading) return <LoadingScreen message="Loading Alumni Directory..." />;
  if (error) return <div className="text-red-500 p-4 text-center">{error}</div>;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-indigo-600 text-white py-5 mb-8 relative">
        <Link to="/admin-home">
          <button
            className="absolute left-8 top-1/2 transform -translate-y-1/2 bg-transparent border border-white text-white py-2 px-4 rounded-md cursor-pointer flex items-center gap-2 transition-all duration-200 hover:bg-white/10"
            aria-label="Go to home page"
          >
            <Home size={16} />
            Home
          </button>
        </Link>
        <div className="text-center">
          <h1 className="text-2xl font-bold">Alumni Directory</h1>
          <p className="text-indigo-100 text-xs mt-1">Department-wise Alumni Records</p>
        </div>
      </header>

      {/* Search and Filter Section */}
      <div className="max-w-8xl mx-auto px-4 flex-grow">
        <div className="py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name or department..."
              className="w-full py-2 pl-10 pr-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-indigo-600 focus:ring-3 focus:ring-indigo-100"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search alumni"
            />
          </div>
          <select
            className="py-2 px-3 pr-8 border border-gray-300 rounded-lg text-sm bg-white cursor-pointer focus:outline-none focus:border-indigo-600 focus:ring-3 focus:ring-indigo-100"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            aria-label="Sort alumni by"
          >
            <option value="department">Sort by Department</option>
            <option value="fullName">Sort by Name</option>
            <option value="passOutYear">Sort by Pass Out Year</option>
            <option value="hallOfFame">Sort by Featured</option>
          </select>
        </div>

        {/* Alumni Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden overflow-x-auto mb-6">
          {filteredAlumni.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No alumni matching your search criteria.</p>
            </div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase border-b border-gray-200">Alumni</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase border-b border-gray-200">PRN</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase border-b border-gray-200">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase border-b border-gray-200">Pass Out Year</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase border-b border-gray-200">Featured</th>
                </tr>
              </thead>
              <tbody>
                {currentAlumni.map((alumni) => (
                  <tr key={alumni.id} className="hover:bg-gray-50 transition-colors">
                    <td 
                      className="px-6 py-4 border-b border-gray-200 cursor-pointer"
                      onClick={() => setSelectedAlumni(alumni)}
                    >
                      <div className="flex items-center">
                        <img className="h-10 w-10 rounded-full object-cover" src={alumni.avatar} alt="" />
                        <div className="ml-4">
                          <div className="font-medium text-gray-900">{alumni.fullName}</div>
                          <div className="text-sm text-gray-500">{alumni.email}</div>
                        </div>
                      </div>
                    </td>
                    <td 
                      className="px-6 py-4 text-gray-500 border-b border-gray-200 cursor-pointer"
                      onClick={() => setSelectedAlumni(alumni)}
                    >
                      {alumni.prn}
                    </td>
                    <td 
                      className="px-6 py-4 text-gray-500 border-b border-gray-200 cursor-pointer"
                      onClick={() => setSelectedAlumni(alumni)}
                    >
                      {alumni.department}
                    </td>
                    <td 
                      className="px-6 py-4 text-gray-500 border-b border-gray-200 cursor-pointer"
                      onClick={() => setSelectedAlumni(alumni)}
                    >
                      {alumni.passOutYear}
                    </td>
                    <td className="px-6 py-4 border-b border-gray-200">
                      <div className="flex justify-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent row click when clicking star
                            toggleFeaturedStatus(alumni.id, alumni.hallOfFame);
                          }}
                          disabled={updatingStars.has(alumni.id)}
                          className={`p-1 rounded-full transition-all duration-200 ${
                            updatingStars.has(alumni.id) 
                              ? 'opacity-50 cursor-not-allowed' 
                              : 'hover:bg-gray-100'
                          }`}
                          aria-label={alumni.hallOfFame ? 'Remove from featured' : 'Add to featured'}
                        >
                          <Star
                            size={20}
                            className={`transition-colors duration-200 ${
                              alumni.hallOfFame 
                                ? 'text-yellow-400 fill-yellow-400' 
                                : 'text-gray-300 hover:text-yellow-400'
                            }`}
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Controls */}
        {filteredAlumni.length > 0 && (
          <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-lg shadow mb-12">
            <div className="flex flex-1 justify-between sm:hidden">
              <button
                onClick={goToPrevPage}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center rounded-md px-4 py-2 text-sm font-medium ${
                  currentPage === 1 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                } border border-gray-300`}
              >
                Previous
              </button>
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className={`relative ml-3 inline-flex items-center rounded-md px-4 py-2 text-sm font-medium ${
                  currentPage === totalPages 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                } border border-gray-300`}
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{indexOfFirstAlumni + 1}</span> to{" "}
                  <span className="font-medium">
                    {Math.min(indexOfLastAlumni, filteredAlumni.length)}
                  </span>{" "}
                  of <span className="font-medium">{filteredAlumni.length}</span> results
                </p>
              </div>
              <div>
                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                  <button
                    onClick={goToPrevPage}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center rounded-l-md px-2 py-2 ${
                      currentPage === 1 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-white text-gray-500 hover:bg-gray-50'
                    } border border-gray-300`}
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                  </button>
                  
                  {/* Page Numbers */}
                  {[...Array(totalPages).keys()].map(number => {
                    // Show first page, last page, current page, and one page before and after current
                    if (
                      number + 1 === 1 || 
                      number + 1 === totalPages || 
                      (number + 1 >= currentPage - 1 && number + 1 <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={number + 1}
                          onClick={() => paginate(number + 1)}
                          aria-current={currentPage === number + 1 ? "page" : undefined}
                          className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${
                            currentPage === number + 1
                              ? 'z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                              : 'bg-white text-gray-500 hover:bg-gray-50'
                          } border border-gray-300`}
                        >
                          {number + 1}
                        </button>
                      );
                    } else if (
                      (number + 1 === currentPage - 2 && currentPage > 3) || 
                      (number + 1 === currentPage + 2 && currentPage < totalPages - 2)
                    ) {
                      // Add ellipsis indicators
                      return (
                        <span
                          key={`ellipsis-${number}`}
                          className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 bg-white"
                        >
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                  
                  <button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center rounded-r-md px-2 py-2 ${
                      currentPage === totalPages 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-white text-gray-500 hover:bg-gray-50'
                    } border border-gray-300`}
                  >
                    <span className="sr-only">Next</span>
                    <ChevronRight className="h-5 w-5" aria-hidden="true" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Alumni Details Modal */}
      {selectedAlumni && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-90 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="alumni-details-title"
        >
          <div 
            className="relative bg-white rounded-lg shadow-xl w-full max-w-3xl mx-4"
            tabIndex={-1}
          >
            <button
              onClick={() => setSelectedAlumni(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-500 p-2"
              aria-label="Close details"
            >
              <X size={24} />
            </button>
            
            <div className="p-10">
              <div className="flex items-center mb-8">
                <img
                  src={selectedAlumni.avatar}
                  alt=""
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div className="ml-4 flex-1">
                  <div className="flex items-center gap-3">
                    <h2 id="alumni-details-title" className="text-2xl font-bold text-gray-900">{selectedAlumni.fullName}</h2>
                    {selectedAlumni.hallOfFame && (
                      <Star size={24} className="text-yellow-400 fill-yellow-400" />
                    )}
                  </div>
                  <p className="text-indigo-600">{selectedAlumni.currentPosition} at {selectedAlumni.company}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                  <dl className="flex flex-col gap-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">PRN</dt>
                      <dd className="text-sm text-gray-900">{selectedAlumni.prn}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Email</dt>
                      <dd className="text-sm text-gray-900">{selectedAlumni.email}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Phone</dt>
                      <dd className="text-sm text-gray-900">{selectedAlumni.phone}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Department</dt>
                      <dd className="text-sm text-gray-900">{selectedAlumni.department}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Pass Out Year</dt>
                      <dd className="text-sm text-gray-900">{selectedAlumni.passOutYear}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Location</dt>
                      <dd className="text-sm text-gray-900">{selectedAlumni.location || "Not specified"}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">LinkedIn</dt>
                      <dd className="text-sm text-gray-900">
                        <a href={selectedAlumni.linkedInURL} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                          {selectedAlumni.linkedInURL}
                        </a>
                      </dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Information</h3>
                  <dl className="flex flex-col gap-5">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Job Position</dt>
                      <dd className="text-sm text-gray-900">{selectedAlumni.currentPosition}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Company Name</dt>
                      <dd className="text-sm text-gray-900">{selectedAlumni.company}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Role</dt>
                      <dd className="text-sm text-gray-900">{selectedAlumni.role || "Not specified"}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Success Story</dt>
                      <dd className="text-sm text-gray-900">{selectedAlumni.successStory || "Not specified"}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Skills</dt>
                      <dd className="text-sm text-gray-900">
                        <div className="flex flex-wrap gap-3">
                          {selectedAlumni.skills && selectedAlumni.skills.length > 0 ? (
                            selectedAlumni.skills.map((skill, index) => (
                              <span key={`skill-${index}`} className="bg-gray-100 px-3 py-1 rounded-md text-xs">{skill}</span>
                            ))
                          ) : (
                            <span className="text-gray-500">No skills listed</span>
                          )}
                        </div>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Special Achievements</dt>
                      <dd className="text-sm text-gray-900">
                        {selectedAlumni.achievements && selectedAlumni.achievements.length > 0 ? (
                          <ul className="list-disc pl-5 space-y-1">
                            {selectedAlumni.achievements.map((achievement, index) => (
                              <li key={`achievement-${index}`}>{achievement}</li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-gray-500">No achievements listed</span>
                        )}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Footer */}
      <footer className="bg-gray-800 text-gray-200 py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="/FAQ" className="text-gray-400 hover:text-white transition-colors duration-200 no-underline">FAQ</a></li>
                <li><a href="/CookiePolicy" className="text-gray-400 hover:text-white transition-colors duration-200 no-underline">Cookie Policy</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="/TermOfService" className="text-gray-400 hover:text-white transition-colors duration-200 no-underline">Terms Of Service</a></li>
                <li><a href="/PrivacyPolicy" className="text-gray-400 hover:text-white transition-colors duration-200 no-underline">Privacy and Policy</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <ul className="space-y-2">
                <li className="text-gray-400">Email: info@example.in</li>
                <li className="text-gray-400">Address: 123 Innovation Avenue, Tech Park Road, XYZ City - 400 001, Maharashtra</li>
              </ul>
            </div>
          </div>

          <div className="text-center pt-8 mt-8 border-t border-gray-700 text-gray-400">
            ©️ {new Date().getFullYear()} Back2Campus. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;