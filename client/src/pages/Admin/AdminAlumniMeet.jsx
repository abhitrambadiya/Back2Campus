import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { Home, Calendar, MapPin, Clock, Users, Mail, Eye, Check, X, Loader2, Plus, ExternalLink, Trash2, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import LoadingScreen from "../../components/LoadingScreen";

const VITE_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const AlumniMeetManagement = () => {
  const [addEventStatus, setAddEventStatus] = useState({ message: '', type: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [upcomingMeets, setUpcomingMeets] = useState([]);
  const [pastMeets, setPastMeets] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showRegisteredStudents, setShowRegisteredStudents] = useState(false);
  const [registeredStudents, setRegisteredStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [showUnregisterModal, setShowUnregisterModal] = useState(false);
  const [studentToUnregister, setStudentToUnregister] = useState(null);
  const [isUnregistering, setIsUnregistering] = useState(false);
  
  // Email modal state
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailData, setEmailData] = useState({
    subject: '',
    message: '',
    googleFormLink: ''
  });
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // Delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    // Introduce a mandatory 1-second delay before loading content
    const timer = setTimeout(() => {
      fetchMeets();
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Fetches both upcoming and past meets from the correct admin endpoint
  const fetchMeets = async () => {
    setLoading(true);
    try {
      // This is the correct admin endpoint that returns both lists
      const response = await axios.get(`${VITE_API_URL}/admin/alumni-meets`);
      
      // The backend sends an object with two arrays: upcomingMeets and pastMeets
      setUpcomingMeets(response.data.upcomingMeets || []);
      setPastMeets(response.data.pastMeets || []);

    } catch (error) {
      console.error("Failed to fetch alumni meets:", error);
      // Optionally, set an error state here to show a message to the user
    } finally {
      setLoading(false);
    }
  };

  const showAddEventStatus = (message, type) => {
    setAddEventStatus({ message, type });
    setTimeout(() => {
        setAddEventStatus({ message: '', type: '' });
    }, 5000);
  };

  // Submits the form to the backend and then refetches all data
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = {
      eventName: e.target.eventName.value,
      date: e.target.date.value,
      time: e.target.time.value,
      venue: e.target.venue.value,
      description: e.target.description.value
    };

    try {
      // Use the real API endpoint to create a new meet
      await axios.post(`${VITE_API_URL}/admin/alumni-meets`, formData);
      
      e.target.reset();
      showAddEventStatus('Alumni meet event added successfully!', 'success');
      
      // After successfully adding, refetch all meets to get the updated lists
      fetchMeets();

    } catch (error) {
      console.error('Error adding event:', error);
      showAddEventStatus(`Failed to add event: ${error.response?.data?.message || 'Server error'}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fetches the list of registered students for a specific event
  const handleViewRegisteredStudents = async (event) => {
    const eventId = event._id; // MongoDB uses _id
    setSelectedEvent(event);
    setLoadingStudents(true);
    setShowRegisteredStudents(true);

    try {
      // Use the real API endpoint to get registered students
      const response = await axios.get(`${VITE_API_URL}/admin/alumni-meets/${eventId}/registered`);
      setRegisteredStudents(response.data.registeredStudents || []);

    } catch (error) {
      console.error('Error fetching registered students:', error);
      setRegisteredStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  // Updated function to show email modal instead of using prompt
  const handleSendEmailToAll = (event) => {
    setSelectedEvent(event);
    setEmailData({
      subject: `Update for ${event.eventName}`,
      message: '',
      googleFormLink: ''
    });
    setShowEmailModal(true);
  };

  // New function to handle email form submission
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setIsSendingEmail(true);

    const eventId = selectedEvent._id;

    try {
      await axios.post(`${VITE_API_URL}/admin/alumni-meets/${eventId}/send-email`, {
        subject: emailData.subject,
        message: emailData.message,
        googleFormLink: emailData.googleFormLink
      });
      
      alert(`Email sent to all ${selectedEvent.registeredCount} registered students for "${selectedEvent.eventName}"`);
      setShowEmailModal(false);
      setEmailData({ subject: '', message: '', googleFormLink: '' });
      
    } catch (error) {
      console.error('Error sending emails:', error);
      alert('Failed to send emails. Please try again.');
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Function to close email modal
  const closeEmailModal = () => {
    setShowEmailModal(false);
    setEmailData({ subject: '', message: '', googleFormLink: '' });
  };

  // NEW DELETE FUNCTIONS
  
  // Function to show delete confirmation modal
  const handleDeleteEvent = (event) => {
    setEventToDelete(event);
    setShowDeleteModal(true);
  };

  // Function to confirm delete
  const confirmDeleteEvent = async (forceDelete = false) => {
    if (!eventToDelete) return;
    
    setIsDeleting(true);
    const eventId = eventToDelete._id;

    try {
      const url = forceDelete 
        ? `${VITE_API_URL}/admin/alumni-meets/${eventId}?force=true`
        : `${VITE_API_URL}/admin/alumni-meets/${eventId}`;
      
      await axios.delete(url);
      
      showAddEventStatus(`Event "${eventToDelete.eventName}" deleted successfully!`, 'success');
      setShowDeleteModal(false);
      setEventToDelete(null);
      
      // Refetch all meets to update the lists
      fetchMeets();

    } catch (error) {
      console.error('Error deleting event:', error);
      
      if (error.response?.status === 400 && error.response?.data?.message?.includes('registered alumni')) {
        // Show option to force delete
        const forceDeleteConfirm = window.confirm(
          `${error.response.data.message}\n\nDo you want to force delete this event? This action cannot be undone.`
        );
        
        if (forceDeleteConfirm) {
          confirmDeleteEvent(true);
          return;
        }
      } else {
        showAddEventStatus(`Failed to delete event: ${error.response?.data?.message || 'Server error'}`, 'error');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  // Function to close delete modal
  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setEventToDelete(null);
  };

  // Function to unregister a student from an event
  const handleUnregisterStudent = (student, event) => {
    setStudentToUnregister({ student, event });
    setShowUnregisterModal(true);
  };
  const confirmUnregisterStudent = async () => {
  if (!studentToUnregister) return;
  
  setIsUnregistering(true);
  const { student, event } = studentToUnregister;

  try {
    await axios.delete(`${VITE_API_URL}/admin/alumni-meets/${event._id}/unregister`, {
      data: { alumniId: student._id }
    });

    showAddEventStatus(`${student.fullName} has been unregistered successfully!`, 'success');
    
    // Close modal and reset state
    setShowUnregisterModal(false);
    setStudentToUnregister(null);
    
    // Refresh the registered students list
    handleViewRegisteredStudents(event);
    
    // Refresh the main events list to update counts
    fetchMeets();

  } catch (error) {
    console.error('Error unregistering student:', error);
    showAddEventStatus(`Failed to unregister student: ${error.response?.data?.message || 'Server error'}`, 'error');
  } finally {
    setIsUnregistering(false);
  }
  };
  const closeUnregisterModal = () => {
    setShowUnregisterModal(false);
    setStudentToUnregister(null);
  };

  if (loading) {
    return <LoadingScreen message="Loading Alumni Meet Management..." />;
  }

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
          <h1 className="text-2xl font-bold">Alumni Meet Management</h1>
          <p className="text-indigo-100 text-xs mt-1">Organize and manage alumni reunion events and meetups.</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 max-w-7xl mx-auto w-full">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-8">
          {/* Add New Event Form - Same as before */}
          <div className="bg-white p-8 rounded-lg shadow-sm">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Plus size={24} />
              Add New Reunion Event
            </h3>
            <form onSubmit={handleFormSubmit}>
              <div className="mb-4">
                <label className="block mb-2 text-gray-700 font-medium" htmlFor="eventName">Event Name</label>
                <input type="text" id="eventName" name="eventName" className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100" required />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block mb-2 text-gray-700 font-medium" htmlFor="date">Date</label>
                  <input type="date" id="date" name="date" className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100" required />
                </div>
                <div>
                  <label className="block mb-2 text-gray-700 font-medium" htmlFor="time">Time</label>
                  <input type="time" id="time" name="time" className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100" required />
                </div>
              </div>
              <div className="mb-4">
                <label className="block mb-2 text-gray-700 font-medium" htmlFor="venue">Venue</label>
                <input type="text" id="venue" name="venue" className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100" required />
              </div>
              <div className="mb-4">
                <label className="block mb-2 text-gray-700 font-medium" htmlFor="description">Description</label>
                <textarea id="description" name="description" rows="4" className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100" required></textarea>
              </div>
              {addEventStatus.message && (
                <div className={`mt-4 p-3 rounded-md flex items-center gap-2 ${addEventStatus.type === 'success' ? 'bg-green-50 text-green-800 border border-green-400' : 'bg-red-50 text-red-800 border border-red-400'}`}>
                  {addEventStatus.type === 'success' ? <Check size={16} className="text-green-600 flex-shrink-0" /> : <X size={16} className="text-red-600 flex-shrink-0" />}
                  <span>{addEventStatus.message}</span>
                </div>
              )}
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-md mt-4 transition-colors flex items-center justify-center gap-2 disabled:opacity-60" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                {isSubmitting ? 'Adding Event...' : 'Add Event'}
              </button>
            </form>
          </div>

          {/* Events Management */}
          <div className="space-y-8">
            {/* Upcoming Meets - UPDATED with Delete button */}
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Calendar size={24} /> Upcoming Meets
              </h3>
              {upcomingMeets.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No upcoming meets scheduled</p>
              ) : (
                <div className="space-y-4">
                  {upcomingMeets.map((meet) => (
                    <div key={meet._id} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">{meet.eventName}</h4>
                      <div className="text-sm text-gray-600 space-y-1 mb-3">
                        <div className="flex items-center gap-2"><Calendar size={14} /> {new Date(meet.date).toLocaleDateString()} at {meet.time}</div>
                        <div className="flex items-center gap-2"><MapPin size={14} /> {meet.venue}</div>
                        <div className="flex items-center gap-2"><Users size={14} /> {meet.registeredCount} registered</div>
                      </div>
                      <p className="text-sm text-gray-700 mb-3">{meet.description}</p>
                      <div className="flex gap-2 flex-wrap">
                        <button 
                          onClick={() => handleViewRegisteredStudents(meet)} 
                          className="flex items-center gap-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors text-sm"
                        >
                          <Eye size={14} /> View Students
                        </button>
                        <button 
                          onClick={() => handleSendEmailToAll(meet)} 
                          className="flex items-center gap-1 px-3 py-2 bg-green-50 text-green-600 rounded-md hover:bg-green-100 transition-colors text-sm"
                        >
                          <Mail size={14} /> Email All
                        </button>
                        <button 
                          onClick={() => handleDeleteEvent(meet)} 
                          className="flex items-center gap-1 px-3 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors text-sm"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Previously Held Meets - UPDATED with Delete button */}
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Clock size={24} /> Previously Held Meets
              </h3>
              {pastMeets.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No past meets recorded</p>
              ) : (
                <div className="space-y-4">
                  {pastMeets.map((meet) => (
                    <div key={meet._id} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">{meet.eventName}</h4>
                      <div className="text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-2"><Calendar size={14} /> {new Date(meet.date).toLocaleDateString()}</div>
                        <div className="flex items-center gap-2"><MapPin size={14} /> {meet.venue}</div>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-800 mb-2">Registered Students ({meet.registeredCount})</h5>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleViewRegisteredStudents(meet)} 
                            className="flex items-center gap-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors text-sm"
                          >
                            <Eye size={14} /> View Students
                          </button>
                          <button 
                            onClick={() => handleDeleteEvent(meet)} 
                            className="flex items-center gap-1 px-3 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors text-sm"
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* DELETE CONFIRMATION MODAL - NEW */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle size={20} className="text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Delete Event</h3>
                  <p className="text-sm text-gray-500">This action cannot be undone</p>
                </div>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-700">
                  Are you sure you want to delete "<strong>{eventToDelete?.eventName}</strong>"?
                </p>
                {eventToDelete?.registeredCount > 0 && (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <div className="flex items-center gap-2">
                      <AlertTriangle size={16} className="text-yellow-600 flex-shrink-0" />
                      <p className="text-sm text-yellow-800">
                        This event has <strong>{eventToDelete.registeredCount} registered students</strong>. 
                        Deleting will remove all registrations.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={closeDeleteModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  onClick={() => confirmDeleteEvent(false)}
                  disabled={isDeleting}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isDeleting ? (
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
        </div>
      )}

      {/* Email Modal - Same as before */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">Send Email - {selectedEvent?.eventName}</h3>
                <button onClick={closeEmailModal} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>
            </div>
            <form onSubmit={handleEmailSubmit} className="p-6 overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <label className="block mb-2 text-gray-700 font-medium" htmlFor="emailSubject">
                    Email Subject
                  </label>
                  <input
                    type="text"
                    id="emailSubject"
                    value={emailData.subject}
                    onChange={(e) => setEmailData({...emailData, subject: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
                    required
                  />
                </div>
                
                <div>
                  <label className="block mb-2 text-gray-700 font-medium" htmlFor="emailMessage">
                    Email Message
                  </label>
                  <textarea
                    id="emailMessage"
                    rows="6"
                    value={emailData.message}
                    onChange={(e) => setEmailData({...emailData, message: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
                    placeholder="Enter your email message here..."
                    required
                  ></textarea>
                </div>
                
                <div>
                  <label className="block mb-2 text-gray-700 font-medium" htmlFor="googleFormLink">
                    Google Form Link (Optional)
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      id="googleFormLink"
                      value={emailData.googleFormLink}
                      onChange={(e) => setEmailData({...emailData, googleFormLink: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 pr-10"
                      placeholder="https://forms.google.com/..."
                    />
                    <ExternalLink size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Add a Google Form link for event registration or feedback
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={closeEmailModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSendingEmail}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isSendingEmail ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail size={16} />
                      Send Email ({selectedEvent?.registeredCount} recipients)
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Registered Students Modal - UPDATED with Unregister button */}
      {showRegisteredStudents && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">Registered Students - {selectedEvent?.eventName}</h3>
                <button onClick={() => setShowRegisteredStudents(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto">
              {loadingStudents ? (
                <div className="text-center py-8">
                  <Loader2 size={32} className="animate-spin mx-auto text-indigo-600" />
                  <p className="text-gray-600 mt-2">Loading registered students...</p>
                </div>
              ) : (
                registeredStudents.length > 0 ? (
                  <div className="space-y-3">
                    {registeredStudents.map((student) => (
                      <div key={student._id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{student.fullName}</div>
                            <div className="text-sm text-gray-600">{student.email}</div>
                            <div className="text-sm text-gray-500">Pass Out Year: {student.passOutYear}</div>
                            {student.registeredAt && (
                              <div className="text-xs text-gray-400 mt-1">
                                Registered: {new Date(student.registeredAt).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => handleUnregisterStudent(student, selectedEvent)}
                            className="flex items-center gap-1 px-3 py-1 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors text-sm ml-3"
                            title="Unregister student"
                          >
                            <X size={14} />
                            Unregister
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">No students have registered for this event yet.</p>
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* UNREGISTER CONFIRMATION MODAL - NEW */}
{showUnregisterModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg max-w-md w-full">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
            <AlertTriangle size={20} className="text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Unregister Student</h3>
            <p className="text-sm text-gray-500">Remove student from event registration</p>
          </div>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-700">
            Are you sure you want to unregister <strong>{studentToUnregister?.student?.fullName}</strong> from 
            "<strong>{studentToUnregister?.event?.eventName}</strong>"?
          </p>
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="text-sm text-blue-800">
              <p><strong>Student Details:</strong></p>
              <p>• Email: {studentToUnregister?.student?.email}</p>
              <p>• Pass Out Year: {studentToUnregister?.student?.passOutYear}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={closeUnregisterModal}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            disabled={isUnregistering}
          >
            Cancel
          </button>
          <button
            onClick={confirmUnregisterStudent}
            disabled={isUnregistering}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isUnregistering ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Unregistering...
              </>
            ) : (
              <>
                <X size={16} />
                Unregister
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  </div>
)}


      {/* Footer - Same as before */}
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
export default AlumniMeetManagement;
