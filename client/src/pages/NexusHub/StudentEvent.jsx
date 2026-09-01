import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft,
  ChevronRight, 
  Search, 
  Twitter,
  User,
  Mail,
  Network,
  Linkedin,
  MapPin,
  Facebook,
  Calendar,
  Lightbulb,
  X,
  Filter,
  CheckCircle,
  Clock,
  Award,
  BookOpen,
  Users,
  AlertCircle,
  Loader2
} from 'lucide-react';

// API service to connect with your backend
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const eventService = {
  getEvents: async () => {
    try {
      const response = await fetch(`${API_URL}/nexushub/events`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch events');
      }
      
      return {
        success: true,
        data: data
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  },

  getEventTypes: () => {
    // Since this isn't provided by your backend, we'll extract types from the events
    return {
      success: true,
      data: ['Workshop', 'Seminar', 'Technical Session', 'Guest Lecture', 'Conference']
    };
  }
};

const Events = () => {
  // State for events data
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [typeFilter, setTypeFilter] = useState('All');
  const [eventTypes, setEventTypes] = useState(['All']);
  const eventsPerPage = 6;

  // Fetch events from API
  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await eventService.getEvents();
      
      if (response.success) {
        setEvents(response.data);
        applyFilters(response.data, searchQuery, typeFilter);
        
        // Extract unique event types from the data
        const types = [...new Set(response.data.map(event => event.type))];
        setEventTypes(['All', ...types]);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError('Failed to fetch events. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters to events
  const applyFilters = (eventsData, search, type) => {
    let filtered = eventsData;

    // Apply search filter
    if (search) {
      filtered = filtered.filter(event =>
        event.name.toLowerCase().includes(search.toLowerCase()) ||
        event.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Apply type filter
    if (type && type !== 'All') {
      filtered = filtered.filter(event => event.type === type);
    }

    setFilteredEvents(filtered);
    setTotalPages(Math.ceil(filtered.length / eventsPerPage));
    setCurrentPage(1);
  };

  // Initial data loading
  useEffect(() => {
    fetchEvents();
  }, []);

  // Apply filters when search or type changes
  useEffect(() => {
    applyFilters(events, searchQuery, typeFilter);
  }, [searchQuery, typeFilter, events]);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle type filter change
  const handleTypeChange = (type) => {
    setTypeFilter(type);
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Get current page events
  const getCurrentPageEvents = () => {
    const startIndex = (currentPage - 1) * eventsPerPage;
    return filteredEvents.slice(startIndex, startIndex + eventsPerPage);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Date not available';
    return new Date(dateString).toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Format time
  const formatTime = (timeString) => {
    if (!timeString) return 'Time not available';
    const [hours, minutes] = timeString.split(':');
    return new Date(2000, 0, 1, parseInt(hours), parseInt(minutes)).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    });
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
            Alumni Events
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl">
            Attend exclusive sessions conducted by our accomplished alumni. Learn from their experiences, gain insights into industry trends, and expand your knowledge in various fields.
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
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* Search Input */}
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search events by name or description..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-color focus:border-transparent"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
            
            {/* Type Filter */}
            <div className="flex-shrink-0">
              <div className="relative inline-block text-left w-full md:w-auto">
                <div className="flex items-center">
                  <Filter size={18} className="text-gray-500 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Event Type:</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {eventTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => handleTypeChange(type)}
                      className={`px-3 py-1 rounded-full text-sm ${
                        typeFilter === type
                          ? 'bg-primary-color text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6 flex items-center">
            <AlertCircle size={20} className="mr-2" />
            <p>{error}</p>
          </div>
        )}

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            // Skeleton Loaders
            Array.from({ length: 6 }).map((_, index) => (
              <EventCardSkeleton key={index} />
            ))
          ) : getCurrentPageEvents().length > 0 ? (
            // Event Cards
            getCurrentPageEvents().map((event, index) => (
              <EventCard 
                key={event._id} 
                event={event} 
                delay={index}
                formatDate={formatDate}
                formatTime={formatTime}
              />
            ))
          ) : (
            // No results
            <div className="col-span-full flex flex-col items-center justify-center py-12">
              <BookOpen size={48} className="text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No events found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <div className="flex items-center space-x-2">
              {/* Previous Button */}
              <button
                onClick={() => handlePageChange(currentPage > 1 ? currentPage - 1 : 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1.5 rounded-md text-sm flex items-center ${
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <ChevronLeft size={16} />
              </button>
              
              {/* Page Numbers */}
              <div className="flex items-center space-x-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1.5 rounded-md text-sm ${
                      currentPage === page
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              
              {/* Next Button */}
              <button
                onClick={() => handlePageChange(currentPage < totalPages ? currentPage + 1 : totalPages)}
                disabled={currentPage === totalPages}
                className={`px-3 py-1.5 rounded-md text-sm flex items-center ${
                  currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
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
                    <li><Link to="/NexusHub/internship" className="text-cool-gray hover:text-primary-color transition-colors">Internship</Link></li>
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

// Event Card Component - Simplified to match backend data
const EventCard = ({ event, delay, formatDate, formatTime }) => {
  // Generate a default avatar for alumni
  const getAvatarUrl = (name) => {
    return `https://api.dicebear.com/6.x/initials/svg?seed=${encodeURIComponent(name)}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: delay * 0.1 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-md hover:shadow-lg transition-all h-full flex flex-col"
    >
      {/* Content area that will grow to fill available space */}
      <div className="p-6 flex-grow flex flex-col">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
              {event.type}
            </span>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <CheckCircle size={12} className="mr-1" />
              Confirmed
            </span>
          </div>
          
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {event.name}
          </h3>
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-start">
            <Calendar size={16} className="text-gray-500 mr-2 mt-0.5 flex-shrink-0" />
            <span className="text-sm text-gray-700">{formatDate(event.date)}</span>
          </div>
          
          <div className="flex items-start">
            <Clock size={16} className="text-gray-500 mr-2 mt-0.5 flex-shrink-0" />
            <span className="text-sm text-gray-700">{formatTime(event.time)}</span>
          </div>

          <div className="flex items-start">
            <MapPin size={16} className="text-gray-500 mr-2 mt-0.5 flex-shrink-0" />
            <span className="text-sm text-gray-700">{event.venue}</span>
          </div>
        </div>
        
        {/* Description with flex-grow to fill available space */}
        <div className="flex-grow mb-6">
          <p className="text-gray-600 text-sm line-clamp-3">
            {event.description}
          </p>
        </div>
      </div>

      {/* Speaker info section */}
      {event.approvedApplication && event.approvedApplication.alumniDetails && (
        <div className="bg-gray-50 border-t p-6">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Award size={18} className="text-indigo-600" /> 
            Conducted By
          </h4>
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
              <img 
                src={getAvatarUrl(event.approvedApplication.alumniDetails.name)}
                alt={event.approvedApplication.alumniDetails.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://via.placeholder.com/40?text=Speaker";
                }}
              />
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-900">
                {event.approvedApplication.alumniDetails.name}
              </h4>
              <p className="text-xs text-gray-500">
                Batch of {event.approvedApplication.alumniDetails.batch}
              </p>
              <p className="text-xs text-gray-500">
                {event.approvedApplication.alumniDetails.email}
              </p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

// Skeleton loader for event cards
const EventCardSkeleton = () => (
  <div className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-md p-6">
    <div className="flex justify-between mb-4">
      <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
      <div className="h-4 bg-gray-200 rounded w-1/5 animate-pulse"></div>
    </div>
    <div className="h-6 bg-gray-200 rounded w-3/4 mb-4 animate-pulse"></div>
    
    <div className="space-y-3 mb-4">
      <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
      <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
    </div>
    
    <div className="space-y-2 mb-6">
      <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
      <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
      <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
    </div>
    
    <div className="border-t border-gray-100 pt-4">
      <div className="h-4 bg-gray-200 rounded w-1/3 mb-2 animate-pulse"></div>
      <div className="flex items-center">
        <div className="w-10 h-10 bg-gray-200 rounded-full mr-3 animate-pulse"></div>
        <div>
          <div className="h-4 bg-gray-200 rounded w-24 mb-1 animate-pulse"></div>
          <div className="h-3 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
      </div>
    </div>
  </div>
);

export default Events;
