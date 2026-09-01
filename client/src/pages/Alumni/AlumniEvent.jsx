import React, { useState, useEffect } from 'react';
import { Home, Calendar, MapPin, Clock, Users, User, X, Send, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from "react-router-dom";
import LoadingScreen from "../../components/LoadingScreen.jsx";
import { useAlumniAuth } from '../../context/AlumniAuthContext.jsx';
// Define the base URL for your API.
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'; // Adjust if your backend is on a different port

const AlumniEventPortal = () => {
  const { alumni, logout, loading: authLoading } = useAlumniAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [appliedEvents, setAppliedEvents] = useState(new Set());
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [applicationText, setApplicationText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Data Fetching ---
  const fetchPendingEvents = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/alumni/events/apply`);
      if (!response.ok) {
        throw new Error('Failed to fetch upcoming events.');
      }
      const data = await response.json();
      setEvents(data);
    } catch (err) {
      setError(err.message);
      console.error("Fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const start = Date.now();
    
    // Simulate loading and fetch initial data
    const timer = setTimeout(() => {
      fetchPendingEvents();
      // In a real app, you would also fetch the user's currently registered events here
      // For now, we'll start with an empty set.
      setLoading(false);
    }, Math.max(0, 1000 - (Date.now() - start)));

    return () => clearTimeout(timer);
  }, []);

  // --- Event Handlers ---
  const handleApplyClick = (event) => {
    setSelectedEvent(event);
    setShowApplicationModal(true);
    setApplicationText('');
  };

  const closeModal = () => {
    setShowApplicationModal(false);
    setSelectedEvent(null);
    setApplicationText('');
    setIsSubmitting(false);
  };

  const handleSubmitApplication = async () => {
    if (!applicationText.trim() || applicationText.trim().length < 50) {
      alert('Please provide a detailed description (at least 50 characters).');
      return;
    }

    setIsSubmitting(true);
    try {
        // --- FIX: Get the token from localStorage ---
        const userInfo = JSON.parse(localStorage.getItem('alumniInfo')); // Assumes you store user info here
        const token = userInfo ? userInfo.token : null;

        if (!token) {
            throw new Error('Authentication token not found. Please log in again.');
        }

        const response = await fetch(`${API_BASE_URL}/alumni/events/${selectedEvent._id}/apply`, {
            method: 'POST',
            // --- FIX: Add the Authorization header ---
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ description: applicationText })
        });

        const result = await response.json();
        if (!response.ok) {
            // Use the error message from your middleware if it exists
            throw new Error(result.message || 'Failed to submit application.');
        }

        alert(`Application submitted successfully for "${selectedEvent.name}"!`);
        setAppliedEvents(prev => new Set([...prev, selectedEvent._id]));
        closeModal();

    } catch (err) {
        alert(`Error: ${err.message}`);
    } finally {
        setIsSubmitting(false);
    }
  };

  // --- UI Helpers ---
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    return new Date(`1970-01-01T${timeString}Z`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'UTC'
    });
  };

  const handleLogout = async () => {
    try {
        await apiAlumni.post('/logout', {}, { withCredentials: true });
        logout(); // Use the logout function from context
    } catch (error) {
        console.error('Logout failed:', error);
        // Still attempt to logout locally if server logout fails
        logout();
    }
  }; 
  if (loading) {
        return <LoadingScreen message="Loading Alumni Events Registration..." />;
      }   

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* <nav className="bg-indigo-600 px-8 py-6 flex items-center shadow-sm relative text-white">
        <button className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-transparent border border-white text-white py-2 px-4 rounded-md cursor-pointer flex items-center gap-2 transition-all duration-200 hover:bg-white/10">
          <Home size={16} />
          Home
        </button>
        <div className="mx-auto pl-16">
          <h1 className="text-2xl font-bold">Alumni Connect</h1>
        </div>
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2 text-sm">
          <User size={16} />
          <span>Welcome, Alumni</span>
        </div>
      </nav> */}
      <nav className="bg-white shadow w-full top-0 z-50 fixed">
        <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center">
          <a href="/alumni-home" className="text-2xl font-bold text-indigo-600 no-underline">Alumni Hub</a>
          <div className="flex items-center gap-8">
            <Link to="/alumni-home" className="text-gray-600 font-medium hover:text-indigo-600 transition-colors no-underline">Home</Link>
            <Link to="/alumni-faq" className="text-gray-600 font-medium hover:text-indigo-600 transition-colors no-underline">Q&A</Link>
            <Link to="/alumni-mentorship" className="text-gray-600 font-medium hover:text-indigo-600 transition-colors no-underline">Add Mentorship</Link>
            <Link to="/alumni-internship" className="text-gray-600 font-medium hover:text-indigo-600 transition-colors no-underline">Add Internsip</Link>
            <Link to="/alumni-meet" className="text-gray-600 font-medium hover:text-indigo-600 transition-colors no-underline">Alumni Meet</Link>
            <Link to="/alumni-event" className="text-gray-600 font-medium hover:text-indigo-600 transition-colors no-underline">Alumni Event</Link>
            <Link to="/alumni-donation" className="text-gray-600 font-medium hover:text-indigo-600 transition-colors no-underline">Donation Portal</Link>
            <button onClick={handleLogout} className="text-gray-700 border border-gray-300 px-4 py-1.5 rounded-md ml-4 hover:text-indigo-600 hover:border-indigo-600 hover:bg-gray-50 transition-all no-underline font-medium">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 p-4 mt-24 max-w-7xl mx-auto w-full">
        <section className="text-center my-10">
          <h2 className="text-4xl font-bold text-gray-900 mb-2">Upcoming Speaking Opportunities</h2>
          <p className="text-xl text-gray-600">Share your expertise with the community. Apply to speak at an event.</p>
        </section>

        {isLoading ? (
          <div className="flex justify-center items-center py-16"><Loader2 size={48} className="animate-spin text-indigo-600"/></div>
        ) : error ? (
          <div className="text-center py-16 text-red-600 bg-red-50 p-6 rounded-lg flex flex-col items-center gap-4">
            <AlertCircle size={48} />
            <h3 className="text-xl font-semibold">Error: {error}</h3>
            <p>Could not load events. Please try refreshing the page.</p>
          </div>
        ) : events.length === 0 ? (
            <div className="text-center py-16">
                <Calendar size={64} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Speaking Opportunities Available</h3>
                <p className="text-gray-500">Please check back later for new events.</p>
            </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8 min-h-[30vh]">
            {events.map((event) => (
              <div key={event._id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-lg transition-shadow duration-300">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="text-xs text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full font-medium">{event.type}</div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">{event.name}</h3>
                  <div className="space-y-2 mb-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2"><Calendar size={14} className="text-indigo-500 flex-shrink-0"/><span>{formatDate(event.date)}</span></div>
                    <div className="flex items-center gap-2"><Clock size={14} className="text-indigo-500 flex-shrink-0"/><span>{formatTime(event.time)}</span></div>
                    <div className="flex items-center gap-2"><MapPin size={14} className="text-indigo-500 flex-shrink-0"/><span>{event.venue}</span></div>
                  </div>
                  <p className="text-gray-700 text-sm mb-6 line-clamp-3 leading-relaxed">{event.description}</p>
                  {appliedEvents.has(event._id) ? (
                    <div className="w-full bg-green-50 text-green-700 border border-green-200 py-3 px-4 rounded-md flex items-center justify-center gap-2 font-medium">
                      <CheckCircle size={16}/> Already Applied
                    </div>
                  ) : (
                    <button onClick={() => handleApplyClick(event)} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-md transition-colors duration-200 font-medium flex items-center justify-center gap-2">
                      <Send size={16}/> Apply to Participate
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showApplicationModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">Apply for Event</h3>
                  <p className="text-indigo-600 font-medium">{selectedEvent.name}</p>
                </div>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={24}/></button>
              </div>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <label className="block mb-3 text-gray-900 font-semibold" htmlFor="applicationText">Why are you the ideal candidate for this event? <span className="text-red-500">*</span></label>
                <textarea id="applicationText" value={applicationText} onChange={(e) => setApplicationText(e.target.value)} rows={6} className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 resize-vertical" placeholder="Please describe your relevant experience, expertise, and what unique value you can bring..."/>
                <p className="text-xs text-gray-500 mt-1">Minimum 50 characters required.</p>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button onClick={closeModal} className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors font-medium" disabled={isSubmitting}>Cancel</button>
              <button onClick={handleSubmitApplication} className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-60" disabled={isSubmitting || applicationText.trim().length < 50}>
                {isSubmitting ? (<><Loader2 size={16} className="animate-spin"/> Submitting...</>) : (<><Send size={16}/> Submit Application</>)}
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="bg-gray-800 text-gray-200 py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div><h4 className="text-white font-semibold mb-4">Quick Links</h4><ul className="space-y-2"><li><a href="#" className="text-gray-400 hover:text-white">My Profile</a></li><li><a href="#" className="text-gray-400 hover:text-white">Alumni Directory</a></li></ul></div>
            <div><h4 className="text-white font-semibold mb-4">Resources</h4><ul className="space-y-2"><li><a href="#" className="text-gray-400 hover:text-white">Career Services</a></li><li><a href="#" className="text-gray-400 hover:text-white">Mentorship</a></li></ul></div>
            <div><h4 className="text-white font-semibold mb-4">Contact</h4><ul className="space-y-2"><li className="text-gray-400">Email: info@example.in</li><li className="text-gray-400">Address: R.S. No. 199B/1-3, Gokul - Shirgoan, Kolhapur - 416 234, Maharashtra</li></ul></div>
          </div>
          <div className="text-center pt-8 mt-8 border-t border-gray-700 text-gray-400">© {new Date().getFullYear()} Back2Campus. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
};

export default AlumniEventPortal;
