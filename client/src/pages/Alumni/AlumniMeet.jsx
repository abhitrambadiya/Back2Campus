import React, { useState, useEffect } from 'react';
import { Home, Calendar, MapPin, Clock, Users, Check, X, Loader2, UserPlus } from 'lucide-react';
import axios from 'axios'; // Added this import because it's used below
import { Link, useNavigate } from 'react-router-dom';
import LoadingScreen from "../../components/LoadingScreen.jsx";
import { useAlumniAuth } from '../../context/AlumniAuthContext.jsx';

// This is the base URL for your backend API
const VITE_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const AlumniMeet = () => {
  const { alumni, logout, loading: authLoading } = useAlumniAuth();
  const [loading, setLoading] = useState(true);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [registeredEvents, setRegisteredEvents] = useState(new Set());
  const [registrationStatus, setRegistrationStatus] = useState({ message: '', type: '' });
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    const start = Date.now();
    
    // Simulate loading and fetch initial data
    const timer = setTimeout(() => {
      fetchEvents();
      // In a real app, you would also fetch the user's currently registered events here
      // For now, we'll start with an empty set.
      setLoading(false);
    }, Math.max(0, 1000 - (Date.now() - start)));

    return () => clearTimeout(timer);
  }, []);

  // Fetches events from the real API
  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('alumniToken');
      if (!token) {
        console.error('No authentication token found');
        return;
      }

      const response = await fetch(`${VITE_API_URL}/alumni/events`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const eventsData = await response.json();
      // The database uses `_id`, but your backend route maps it to `id`.
      // We need to make sure the frontend uses the correct property.
      // Your backend code correctly maps `_id` to `id`, so this is fine.
      setUpcomingEvents(eventsData);

    } catch (error) {
      console.error("Could not fetch upcoming events:", error);
    }
  };
  // The syntax error was caused by a stray line of code and a closing brace here, which have been removed.

  const showRegistrationStatus = (message, type) => {
    setRegistrationStatus({ message, type });
    setTimeout(() => {
      setRegistrationStatus({ message: '', type: '' });
    }, 5000);
  };

  // Fixed frontend registration function
const handleEventRegistration = async (event) => {
  const eventId = event.id;
  setIsRegistering(true);

  // Optimistic UI Update
  setRegisteredEvents(prev => new Set([...prev, eventId]));
  setUpcomingEvents(prev => 
    prev.map(e => 
      e.id === eventId 
        ? { ...e, registeredCount: e.registeredCount + 1 }
        : e
    )
  );

  try {
    const token = localStorage.getItem('alumniToken');

    // FIXED: No need to send body data, alumni info comes from token
    const response = await axios.post(
      `${VITE_API_URL}/alumni/events/${eventId}/register`,
      {}, // Empty body - alumni info comes from JWT token
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000,
      }
    );

    const updatedEventFromServer = response.data.event;
    setUpcomingEvents(prev =>
      prev.map(e =>
        e.id === eventId
          ? { ...e, registeredCount: updatedEventFromServer.registeredAlumni.length }
          : e
      )
    );

    showRegistrationStatus(`Successfully registered for "${event.eventName}"!`, 'success');
  } catch (error) {
    console.error('Error registering for event:', error);
    showRegistrationStatus(
      error.response?.data?.message || 'Failed to register for event. Please try again.', 
      'error'
    );
    
    // Rollback on Error
    setRegisteredEvents(prev => {
      const newSet = new Set(prev);
      newSet.delete(eventId);
      return newSet;
    });

    setUpcomingEvents(prev => 
      prev.map(e => 
        e.id === eventId 
          ? { ...e, registeredCount: e.registeredCount - 1 }
          : e
      )
    );
  } finally {
    setIsRegistering(false);
  }
};

  const isEventFull = (event) => {
    return event.registeredCount >= event.maxCapacity;
  };

  const isEventPast = (event) => {
    const eventDate = new Date(event.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison
    return eventDate < today;
  };

  if (loading) {
        return <LoadingScreen message="Loading Alumni Meet Registration..." />;
      }   

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

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Navbar */}
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

      {/* Main Content */}
      <main className="flex-1 p-4 mt-24 max-w-7xl mx-auto w-full">
        {/* Welcome Section */}
        <section className="text-center my-10">
          <h2 className="text-4xl font-bold text-gray-900 mb-2">Upcoming Alumni Meets</h2>
          <p className="text-xl text-gray-600">Connect, network, and celebrate with fellow alumni at our exciting events.</p>
        </section>

        {/* Registration Status Message */}
        {registrationStatus.message && (
          <div className={`max-w-3xl mx-auto mb-8 p-4 rounded-md flex items-center gap-2 ${
            registrationStatus.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-400' 
              : 'bg-red-50 text-red-800 border border-red-400'
          }`}>
            {registrationStatus.type === 'success' ? (
              <Check size={16} className="text-green-600 flex-shrink-0" />
            ) : (
              <X size={16} className="text-red-600 flex-shrink-0" />
            )}
            <span>{registrationStatus.message}</span>
          </div>
        )}

        {/* Events Grid */}
        <div className="max-w-6xl mx-auto">
          {upcomingEvents.length === 0 ? (
            <div className="text-center py-16">
              <Calendar size={64} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Upcoming Events</h3>
              <p className="text-gray-500">Check back soon for new alumni events and meetups!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 min-h-[30vh]">
              {upcomingEvents.map((event) => {
                const isRegistered = registeredEvents.has(event.id);
                const isFull = isEventFull(event);
                const isPast = isEventPast(event);
                
                return (
                  <div key={event.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                    <div className="p-6 flex-1">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-bold text-gray-900 leading-tight">{event.eventName}</h3>
                        {isRegistered && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                            Registered
                          </span>
                        )}
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar size={16} />
                          <span className="text-sm">{new Date(event.date).toLocaleDateString()} at {event.time}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin size={16} />
                          <span className="text-sm">{event.venue}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock size={16} />
                          <span className="text-sm">Organized by {event.organizer}</span>
                        </div>
                      </div>

                      <p className="text-gray-700 text-sm mb-4 line-clamp-3">{event.description}</p>
                    </div>

                    <div className="p-6 pt-0">
                      {!isRegistered && !isFull && !isPast && (
                        <button 
                          onClick={() => handleEventRegistration(event)}
                          disabled={isRegistering}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-sm disabled:opacity-60"
                        >
                          {isRegistering ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <UserPlus size={16} />
                          )}
                          {isRegistering ? 'Registering...' : 'Register'}
                        </button>
                      )}

                      {isFull && !isRegistered && (
                        <button 
                          disabled
                          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-md text-sm cursor-not-allowed"
                        >
                          <X size={16} />
                          Event Full
                        </button>
                      )}

                      {isPast && (
                        <button 
                          disabled
                          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-500 rounded-md text-sm cursor-not-allowed"
                        >
                          <Clock size={16} />
                          Event Ended
                        </button>
                      )}

                      {isRegistered && (
                        <button 
                          disabled
                          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-100 text-green-600 rounded-md text-sm cursor-not-allowed"
                        >
                          <Check size={16} />
                          Registered
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

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
                <li className="text-gray-400">Address: R.S. No. 199B/1-3, Gokul - Shirgoan, Kolhapur - 416 234, Maharashtra</li>
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

export default AlumniMeet;