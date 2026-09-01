import React, { useState, useEffect } from 'react';
import { Home, Calendar, MapPin, Clock, Users, Eye, Check, X, Loader2, Plus, AlertCircle, Trash2 } from 'lucide-react';
import { Link } from "react-router-dom";
import LoadingScreen from "../../components/LoadingScreen";

// Define the base URL for your API.
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'; // Adjust if your backend is on a different port

const AlumniEventManagement = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingEventId, setDeletingEventId] = useState(null); // Track which event is being deleted
  const [deletingApplicationId, setDeletingApplicationId] = useState(null); // Track which application is being deleted

  // Form state
  const [newEvent, setNewEvent] = useState({
    name: '',
    type: '',
    date: '',
    time: '',
    venue: '',
    description: '',
  });

  const [addEventStatus, setAddEventStatus] = useState({ message: '', type: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal state
  const [showAlumniModal, setShowAlumniModal] = useState(false);
  const [selectedAlumni, setSelectedAlumni] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [showDeleteApplicationModal, setShowDeleteApplicationModal] = useState(false);
  const [applicationToDelete, setApplicationToDelete] = useState(null);

  // --- Data Fetching ---
  const fetchEventsAndApplications = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch all events
      const eventsRes = await fetch(`${API_BASE_URL}/admin/events`);
      if (!eventsRes.ok) throw new Error('Failed to fetch events.');
      let fetchedEvents = await eventsRes.json();

      // For each event, fetch its applications
      const eventsWithApps = await Promise.all(
        fetchedEvents.map(async (event) => {
          const appsRes = await fetch(`${API_BASE_URL}/admin/events/${event._id}/applications`);
          const applications = appsRes.ok ? await appsRes.json() : [];
          return { ...event, applicants: applications };
        })
      );

      setEvents(eventsWithApps);
    } catch (err) {
      setError(err.message);
      console.error("Fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEventsAndApplications();
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // --- Event Handlers ---
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setNewEvent(prev => ({ ...prev, [id]: value }));
  };

  const showAddEventStatus = (message, type) => {
    setAddEventStatus({ message, type });
    setTimeout(() => {
      setAddEventStatus({ message: '', type: '' });
    }, 5000);
  };

  const handleFormSubmit = async () => {
    setIsSubmitting(true);
    setAddEventStatus({ message: '', type: '' });

    // Basic validation
    for (const key in newEvent) {
      if (!newEvent[key]) {
        showAddEventStatus('Please fill in all required fields.', 'error');
        setIsSubmitting(false);
        return;
      }
    }
    
    // Date validation
    const selectedDate = new Date(newEvent.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      showAddEventStatus('Event date cannot be in the past.', 'error');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/admin/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEvent),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to create event.');
      }

      showAddEventStatus('Event created successfully!', 'success');
      setNewEvent({ name: '', type: '', date: '', time: '', venue: '', description: '' }); // Reset form
      fetchEventsAndApplications(); // Refresh the list
    } catch (err) {
      showAddEventStatus(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const approveApplicant = async (applicationId) => {
    // Optional: Add a confirmation step here
    try {
      const response = await fetch(`${API_BASE_URL}/admin/applications/${applicationId}/approve`, {
        method: 'PATCH',
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Failed to approve application.');
      }
      alert('Applicant approved successfully! The event is now confirmed.'); // Simple feedback
      fetchEventsAndApplications(); // Refresh to show status change
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  // --- Delete Event Functionality ---
  const handleDeleteClick = (event) => {
    setEventToDelete(event);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!eventToDelete) return;

    setDeletingEventId(eventToDelete._id);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/events/${eventToDelete._id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to delete event.');
      }

      showAddEventStatus('Event deleted successfully!', 'success');
      fetchEventsAndApplications(); // Refresh the list
      setShowDeleteModal(false);
      setEventToDelete(null);
    } catch (err) {
      showAddEventStatus(`Error deleting event: ${err.message}`, 'error');
    } finally {
      setDeletingEventId(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setEventToDelete(null);
  };

  // --- Delete Application Functionality ---
  const handleDeleteApplicationClick = (applicant) => {
    setApplicationToDelete(applicant);
    setShowDeleteApplicationModal(true);
  };

  const confirmDeleteApplication = async () => {
    if (!applicationToDelete) return;

    setDeletingApplicationId(applicationToDelete._id);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/applications/${applicationToDelete._id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to delete application.');
      }

      showAddEventStatus('Application deleted successfully!', 'success');
      fetchEventsAndApplications(); // Refresh the list
      setShowDeleteApplicationModal(false);
      setApplicationToDelete(null);
    } catch (err) {
      showAddEventStatus(`Error deleting application: ${err.message}`, 'error');
    } finally {
      setDeletingApplicationId(null);
    }
  };

  const cancelDeleteApplication = () => {
    setShowDeleteApplicationModal(false);
    setApplicationToDelete(null);
  };

  // --- UI Helpers ---
  const showAlumniDetails = (applicant) => {
    setSelectedAlumni(applicant.alumniDetails);
    setShowAlumniModal(true);
  };

  const closeModal = () => {
    setShowAlumniModal(false);
    setSelectedAlumni(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC' // Assuming dates from DB are UTC
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

  if (isLoading) return <LoadingScreen message="Loading Alumni Events Management..." />;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
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
          <h1 className="text-2xl font-bold">Alumni Event Management</h1>
          <p className="text-indigo-100 text-xs mt-1">Organize and manage alumni speaking events and meetups.</p>
        </div>
      </header>

      <main className="flex-1 p-4 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-0">
          {/* Create New Event Form */}
          <div className="bg-white p-8 rounded-lg shadow-sm">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Plus size={24} />
              Create New Event
            </h3>
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="mb-4">
                <label className="block mb-2 text-gray-700 font-medium" htmlFor="name">Event Name</label>
                <input type="text" id="name" value={newEvent.name} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100" placeholder="e.g., Tech Innovations Summit"/>
              </div>
              <div className="mb-4">
                <label className="block mb-2 text-gray-700 font-medium" htmlFor="type">Event Type</label>
                <select id="type" value={newEvent.type} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100">
                  <option value="">Select event type</option>
                  <option value="Expert Talk">Expert Talk</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Panel Discussion">Panel Discussion</option>
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block mb-2 text-gray-700 font-medium" htmlFor="date">Date</label>
                  <input type="date" id="date" value={newEvent.date} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"/>
                </div>
                <div>
                  <label className="block mb-2 text-gray-700 font-medium" htmlFor="time">Time</label>
                  <input type="time" id="time" value={newEvent.time} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"/>
                </div>
              </div>
              <div className="mb-4">
                <label className="block mb-2 text-gray-700 font-medium" htmlFor="venue">Venue</label>
                <input type="text" id="venue" value={newEvent.venue} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100" placeholder="e.g., Main Auditorium"/>
              </div>
              <div className="mb-4">
                <label className="block mb-2 text-gray-700 font-medium" htmlFor="description">Description</label>
                <textarea id="description" rows={4} value={newEvent.description} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100" placeholder="Enter event description..."/>
              </div>
              {addEventStatus.message && (
                <div className={`mt-4 p-3 rounded-md flex items-center gap-2 ${addEventStatus.type === 'success' ? 'bg-green-50 text-green-800 border border-green-400' : 'bg-red-50 text-red-800 border border-red-400'}`}>
                  {addEventStatus.type === 'success' ? <Check size={16} className="text-green-600 flex-shrink-0"/> : <X size={16} className="text-red-600 flex-shrink-0"/>}
                  <span>{addEventStatus.message}</span>
                </div>
              )}
              <button onClick={handleFormSubmit} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-md mt-4 transition-colors flex items-center justify-center gap-2 disabled:opacity-60" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 size={16} className="animate-spin"/> : <Plus size={16}/>}
                {isSubmitting ? 'Creating Event...' : 'Create Event'}
              </button>
            </form>
          </div>

          {/* Upcoming Sessions */}
          <div className="bg-white p-8 rounded-lg shadow-sm">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Calendar size={24}/>
              Upcoming Sessions
            </h3>
            {isLoading ? (
              <div className="flex justify-center items-center py-8"><Loader2 size={32} className="animate-spin text-indigo-600"/></div>
            ) : error ? (
              <div className="text-center py-8 text-red-600 bg-red-50 p-4 rounded-md flex flex-col items-center gap-2">
                <AlertCircle size={24} />
                <p><strong>Error:</strong> {error}</p>
                <p className="text-sm">Could not load events. Please try again later.</p>
              </div>
            ) : events.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No events created yet. Create your first event to get started!</p>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {events.map((event) => (
                  <div key={event._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-900">{event.name}</h4>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${event.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                          {event.status}
                        </span>
                        <button
                          onClick={() => handleDeleteClick(event)}
                          disabled={deletingEventId === event._id}
                          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                          title="Delete Event"
                        >
                          {deletingEventId === event._id ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1 mb-3">
                      <div className="flex items-center gap-2"><Calendar size={14}/> {formatDate(event.date)} at {formatTime(event.time)}</div>
                      <div className="flex items-center gap-2"><MapPin size={14}/> {event.venue}</div>
                      <div className="flex items-center gap-2"><Users size={14}/> {event.applicants.length} applied</div>
                      <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded inline-block">{event.type}</div>
                    </div>
                    <p className="text-sm text-gray-700 mb-3">{event.description}</p>
                    
                    {event.status === 'PENDING' && (
                      <div className="border-t pt-3">
                        <h5 className="font-medium text-gray-800 mb-2">Applied Alumni ({event.applicants.length})</h5>
                        {event.applicants.length > 0 ? (
                          <div className="space-y-2">
                            {event.applicants.map((applicant) => (
                              <div key={applicant._id} className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                                <span className="text-indigo-600 cursor-pointer hover:underline font-medium" onClick={() => showAlumniDetails(applicant)}>
                                  {applicant.alumniDetails.name}
                                </span>
                                <div className="flex items-center gap-2">
                                  <button onClick={() => approveApplicant(applicant._id)} className="flex items-center gap-1 px-3 py-1 bg-green-50 text-green-600 rounded-md hover:bg-green-100 transition-colors text-sm">
                                    <Check size={12}/> Approve
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteApplicationClick(applicant)}
                                    disabled={deletingApplicationId === applicant._id}
                                    className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                                    title="Delete Application"
                                  >
                                    {deletingApplicationId === applicant._id ? (
                                      <Loader2 size={12} className="animate-spin" />
                                    ) : (
                                      <Trash2 size={12} />
                                    )}
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-500">No applications yet.</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Delete Event Confirmation Modal */}
      {showDeleteModal && eventToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full overflow-hidden shadow-xl">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertCircle size={20} className="text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Event</h3>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete "<strong>{eventToDelete.name}</strong>"? This action will also delete all associated applications and cannot be undone.
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle size={16} className="text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-yellow-800">
                    <strong>Warning:</strong> This will permanently remove:
                    <ul className="mt-1 list-disc list-inside space-y-1">
                      <li>The event "{eventToDelete.name}"</li>
                      <li>{eventToDelete.applicants?.length || 0} associated applications</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
              <button 
                onClick={cancelDelete}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                disabled={deletingEventId === eventToDelete._id}
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                disabled={deletingEventId === eventToDelete._id}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {deletingEventId === eventToDelete._id ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Delete Event
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Application Confirmation Modal */}
      {showDeleteApplicationModal && applicationToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full overflow-hidden shadow-xl">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertCircle size={20} className="text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Application</h3>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete the application from "<strong>{applicationToDelete.alumniDetails?.name}</strong>"? This action cannot be undone.
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle size={16} className="text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-yellow-800">
                    <strong>Warning:</strong> This will permanently remove the application from {applicationToDelete.alumniDetails?.name}.
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
              <button 
                onClick={cancelDeleteApplication}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                disabled={deletingApplicationId === applicationToDelete._id}
              >
                Cancel
              </button>
              <button 
                onClick={confirmDeleteApplication}
                disabled={deletingApplicationId === applicationToDelete._id}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {deletingApplicationId === applicationToDelete._id ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Delete Application
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alumni Details Modal */}
      {showAlumniModal && selectedAlumni && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full overflow-hidden shadow-xl">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">Alumni Details</h3>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><X size={24}/></button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div><div className="text-sm font-medium text-gray-500 mb-1">Name</div><div className="text-gray-900">{selectedAlumni.name}</div></div>
                <div><div className="text-sm font-medium text-gray-500 mb-1">Email</div><div className="text-gray-900">{selectedAlumni.email}</div></div>
                <div><div className="text-sm font-medium text-gray-500 mb-1">Batch</div><div className="text-gray-900">{selectedAlumni.batch}</div></div>
                <div><div className="text-sm font-medium text-gray-500 mb-1">Reason for Applying</div><p className="text-gray-900 text-sm leading-relaxed bg-gray-50 p-3 rounded-md">{selectedAlumni.description}</p></div>
              </div>
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button onClick={closeModal} className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors">Close</button>
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

export default AlumniEventManagement;
