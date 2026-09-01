import React, { useState, useEffect } from "react";
import {
  Bell,
  MapPin,
  User,
  Briefcase,
  Home,
  Check,
  History,
  CheckCircle2,
  Trash2,
  AlertTriangle,
  Calendar,
  Users,
  Building,
  Mail,
  Send,
  X,
  Eye,
} from "lucide-react";
import LoadingScreen from "../../components/LoadingScreen";

// API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'; // Change this to your backend URL
const API_ENDPOINTS = {
  getAllPrograms: `${API_BASE_URL}/admin/internship`,
  approveProgram: (id) => `${API_BASE_URL}/admin/internship/${id}/approve`,
  markComplete: (id) => `${API_BASE_URL}/admin/internship/${id}/complete`,
  deleteProgram: (id) => `${API_BASE_URL}/admin/internship/${id}`,
};

// API service functions
const apiService = {
  // Fetch all programs
  getAllPrograms: async () => {
    try {
      const response = await fetch(API_ENDPOINTS.getAllPrograms);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch programs");
      }

      return data.data; // Return the programs array
    } catch (error) {
      console.error("Error fetching programs:", error);
      throw error;
    }
  },

  // Approve a program
  approveProgram: async (id) => {
    try {
      const response = await fetch(API_ENDPOINTS.approveProgram(id), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to approve program");
      }

      return data.data; // Return the updated program
    } catch (error) {
      console.error("Error approving program:", error);
      throw error;
    }
  },

  // Mark program as complete
  markProgramComplete: async (id) => {
    try {
      const response = await fetch(API_ENDPOINTS.markComplete(id), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to mark program complete");
      }

      return data.data; // Return the updated program
    } catch (error) {
      console.error("Error marking program complete:", error);
      throw error;
    }
  },

  // Delete a program
  deleteProgram: async (id) => {
    try {
      const response = await fetch(API_ENDPOINTS.deleteProgram(id), {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete program");
      }

      return data; // Return success message
    } catch (error) {
      console.error("Error deleting program:", error);
      throw error;
    }
  },
};

function App() {
  // Updated state management - removed completed tab
  const [programs, setPrograms] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [programToDelete, setProgramToDelete] = useState(null);

  // Right section states
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailFormUrl, setEmailFormUrl] = useState("");
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [showApplicantsModal, setShowApplicantsModal] = useState(false);
  const [selectedApplicants, setSelectedApplicants] = useState(null);
  const [expandedApplicants, setExpandedApplicants] = useState({});

  // Fetch programs on component mount
  useEffect(() => {
    // Introduce a mandatory 1-second delay before loading content
    const timer = setTimeout(() => {
      fetchPrograms();
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getAllPrograms();
      setPrograms(data);
    } catch (err) {
      setError(err.message);
      console.error("Failed to fetch programs:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter programs based on status - removed completed programs from main tabs
  const pendingPrograms = programs.filter(
    (p) => !p.isApproved && !p.isMarkAsComplete
  );
  const approvedPrograms = programs.filter(
    (p) => p.isApproved && !p.isMarkAsComplete
  );
  const completedPrograms = programs.filter((p) => p.isMarkAsComplete);

  // Updated handler functions with API calls
  const handleApprove = async (id) => {
    try {
      setLoading(true);
      const updatedProgram = await apiService.approveProgram(id);

      // Update the programs state with the new data
      setPrograms(programs.map((p) => (p._id === id ? updatedProgram : p)));

      console.log("Program approved successfully");
    } catch (err) {
      setError(err.message);
      console.error("Failed to approve program:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (id) => {
    try {
      setLoading(true);
      const updatedProgram = await apiService.markProgramComplete(id);

      // Update the programs state with the new data
      setPrograms(programs.map((p) => (p._id === id ? updatedProgram : p)));

      console.log("Program marked as complete successfully");
    } catch (err) {
      setError(err.message);
      console.error("Failed to mark program complete:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id) => {
    setProgramToDelete(id);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setLoading(true);
      await apiService.deleteProgram(programToDelete);

      // Remove the deleted program from state
      setPrograms(programs.filter((p) => p._id !== programToDelete));

      console.log("Program deleted successfully");
    } catch (err) {
      setError(err.message);
      console.error("Failed to delete program:", err);
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
      setProgramToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setProgramToDelete(null);
  };

  // Right section handlers
  const handleCompletedInternshipDelete = (id) => {
    setPrograms(programs.filter((p) => p._id !== id));
  };

  const handleEmailClick = (internship) => {
    setSelectedInternship(internship);
    setShowEmailModal(true);
  };

  const handleSendEmail = async () => {
    if (emailFormUrl.trim()) {
      try {
        setLoading(true);

        const response = await fetch(
          `${API_BASE_URL}/admin/internship/${selectedInternship._id}/send-email`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              formUrl: emailFormUrl,
              subject: `Important: ${selectedInternship.title} - Action Required`, // Optional custom subject
              message: "", // Optional custom message
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to send emails");
        }

        setShowEmailModal(false);
        setEmailFormUrl("");
        setSelectedInternship(null);
      } catch (error) {
        console.error("Error sending emails:", error);
        setError(`Failed to send emails: ${error.message}`);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleViewApplicants = (program) => {
    setSelectedApplicants(program);
    setShowApplicantsModal(true);
  };

  const toggleApplicants = (programId) => {
    setExpandedApplicants((prev) => ({
      ...prev,
      [programId]: !prev[programId],
    }));
  };

  // Updated to only handle pending and approved tabs
  const getCurrentPrograms = () => {
    switch (activeTab) {
      case "pending":
        return pendingPrograms;
      case "approved":
        return approvedPrograms;
      default:
        return pendingPrograms;
    }
  };

  // Loading state
  if (loading) {
    return <LoadingScreen message="Loading Internship Management..." />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800">
      {/* Header */}
      <header className="bg-indigo-600 text-white py-6 mb-8 relative">
        <button
          className="absolute left-12 top-1/2 transform -translate-y-1/2 bg-transparent border border-white text-white py-2 px-4 rounded-md flex items-center gap-2 hover:bg-white/10 transition-all duration-200"
          onClick={() => (window.location.href = "/admin-home")}
        >
          <Home size={16} />
          Home
        </button>
        <h1 className="text-center text-2xl font-bold">
          Internship Management Dashboard
        </h1>
      </header>

      {/* Error Display */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 w-full mb-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle size={20} />
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-700 hover:text-red-900"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Section - Internship Programs List */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold mb-6 text-gray-800">
              Internship Programs
            </h2>

            {/* Tabs - Removed completed tab */}
            <div className="flex gap-2 mb-6 bg-white rounded-lg shadow p-2 md:flex-row flex-col">
              <button
                className={`flex items-center gap-2 py-3 px-6 rounded-lg font-medium transition-all duration-200 flex-1
                  ${
                    activeTab === "pending"
                      ? "text-white bg-indigo-600 shadow-md"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                onClick={() => setActiveTab("pending")}
              >
                <Bell size={18} />
                Pending ({pendingPrograms.length})
              </button>
              <button
                className={`flex items-center gap-2 py-3 px-6 rounded-lg font-medium transition-all duration-200 flex-1
                  ${
                    activeTab === "approved"
                      ? "text-white bg-indigo-600 shadow-md"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                onClick={() => setActiveTab("approved")}
              >
                <CheckCircle2 size={18} />
                Approved ({approvedPrograms.length})
              </button>
            </div>

            {/* Program List */}
            <div className="bg-white rounded-lg shadow">
              {getCurrentPrograms().length === 0 ? (
                <div className="text-center py-16 text-gray-500">
                  <div className="flex justify-center mb-4">
                    {activeTab === "pending" && (
                      <Bell size={48} className="text-gray-300" />
                    )}
                    {activeTab === "approved" && (
                      <CheckCircle2 size={48} className="text-gray-300" />
                    )}
                  </div>
                  <h3 className="text-xl font-medium text-gray-700 mb-2">
                    No {activeTab} requests
                  </h3>
                  <p>
                    There are currently no {activeTab} internship requests to
                    display.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 max-h-[500px] overflow-y-auto">
                  {getCurrentPrograms().map((program) => (
                    <div
                      key={program._id}
                      className="p-6 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {program.title}
                            </h3>
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                program.isApproved
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {program.isApproved ? "Approved" : "Pending"}
                            </span>
                          </div>

                          <p className="text-gray-600 mb-4">
                            {program.description}
                          </p>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-500 mb-4">
                            <div className="flex items-center gap-2">
                              <User size={16} />
                              <span>{program.alumniName}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Building size={16} />
                              <span>{program.companyName}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Briefcase size={16} />
                              <span>{program.alumniPosition}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar size={16} />
                              <span>{program.deadline}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin size={16} />
                              <span>{program.mode}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users size={16} />
                              <span>{program.limit} participants</span>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 ml-4">
                          {!program.isApproved && (
                            <button
                              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                              onClick={() => handleApprove(program._id)}
                              disabled={loading}
                            >
                              <Check size={16} />
                              {loading ? "Approving..." : "Approve"}
                            </button>
                          )}

                          {program.isApproved && (
                            <button
                              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                              onClick={() => handleComplete(program._id)}
                              disabled={loading}
                            >
                              <CheckCircle2 size={16} />
                              {loading ? "Completing..." : "Complete"}
                            </button>
                          )}

                          <button
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => handleDeleteClick(program._id)}
                            title="Delete internship"
                            disabled={loading}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Section - Email Management & Previous Internships */}
          <div className="lg:col-span-1">
            <h2 className="text-xl font-semibold mb-6 text-gray-800">
              Communication & History
            </h2>

            {/* Email Students Section */}
            <div className="bg-white rounded-lg shadow mb-6">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-800">
                  Send Emails by Internship
                </h3>
              </div>

              <div className="divide-y divide-gray-200 max-h-[221px] overflow-y-auto">
                {programs
                  .filter((p) => p.isApproved && !p.isMarkAsComplete)
                  .map((program) => (
                    <div key={program._id} className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 text-sm">
                            {program.title}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1">
                            {program.participants?.length || 0} applicants •{" "}
                            {program.date}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {program.participants &&
                            program.participants.length > 0 && (
                              <button
                                onClick={() => handleViewApplicants(program)}
                                className="flex items-center gap-1 px-2 py-1 text-gray-600 hover:text-indigo-600 hover:bg-gray-100 rounded-lg transition-colors text-sm"
                                title="View applicants"
                              >
                                <Eye size={14} />
                              </button>
                            )}

                          <button
                            className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                            onClick={() => handleEmailClick(program)}
                          >
                            <Mail size={14} />
                            Email
                          </button>
                        </div>
                      </div>

                      {/* Expandable Applicants List */}
                      {expandedApplicants[program._id] &&
                        program.participants && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <h5 className="text-sm font-medium text-gray-700 mb-2">
                              Applicants:
                            </h5>
                            <div className="grid gap-1">
                              {program.participants.map((email, idx) => (
                                <span
                                  key={idx}
                                  className="text-sm text-gray-600"
                                >
                                  {email}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                    </div>
                  ))}

                {programs.filter((p) => !p.isMarkAsComplete).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Mail size={32} className="text-gray-300 mx-auto mb-2" />
                    <p className="text-sm">No internships available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Previously Held Internships Section - Now shows completed programs */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-800">
                  Previously Held Internships
                </h3>
              </div>

              <div className="divide-y divide-gray-200 max-h-[221px] overflow-y-auto">
                {completedPrograms.map((internship) => (
                  <div key={internship._id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium text-gray-900 text-sm">
                            {internship.title}
                          </h4>
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                            Completed
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1 space-y-1">
                          <p>Mentor: {internship.fullName}</p>
                          <p>Company: {internship.companyName}</p>
                          <p>
                            Date: {internship.date} •{" "}
                            {internship.participants?.length || 0} participants
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        {/* {internship.participants &&
                          internship.participants.length > 0 && (
                            <button
                              onClick={() => handleViewApplicants(internship)}
                              className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="View participants"
                            >
                              <Eye size={14} />
                            </button>
                          )} */}
                        <button
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={() => handleDeleteClick(internship._id)}
                          title="Delete internship"
                          disabled={loading}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {completedPrograms.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <History size={32} className="text-gray-300 mx-auto mb-2" />
                    <p className="text-sm">No previous internships found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* All modals remain unchanged */}
      {/* View Applicants Modal */}
      {/* View Applicants Modal */}
      {showApplicantsModal && selectedApplicants && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-800">
                View Applicants
              </h3>
              <button
                className="p-1 text-gray-400 hover:text-gray-600"
                onClick={() => setShowApplicantsModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Internship: {selectedApplicants.title}
              </p>
              <p className="text-sm text-gray-600 mb-4">
                Total Applicants: {selectedApplicants.participants?.length || 0}
              </p>

              <div className="h-[300px] overflow-y-auto border border-gray-200 rounded-lg">
                <div className="divide-y divide-gray-200">
                  {selectedApplicants.participants?.length > 0 ? (
                    selectedApplicants.participants.map((email, idx) => (
                      <div
                        key={idx}
                        className="p-3 hover:bg-gray-50 flex items-center justify-between"
                      >
                        <span className="text-sm text-gray-700">{email}</span>
                        <span className="text-xs text-gray-500">
                          #{idx + 1}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-center text-gray-500">
                      No applicants found
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Email Modal */}
      {/* Email Modal */}
      {showEmailModal && selectedInternship && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-800">Send Email</h3>
              <button
                className="p-1 text-gray-400 hover:text-gray-600"
                onClick={() => setShowEmailModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Internship: {selectedInternship.title}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                Recipients: {selectedInternship.participants?.length || 0}{" "}
                students
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Google Form URL *
              </label>
              <input
                type="url"
                value={emailFormUrl}
                onChange={(e) => setEmailFormUrl(e.target.value)}
                placeholder="https://forms.google.com/..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex gap-4 justify-end">
              <button
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                onClick={() => setShowEmailModal(false)}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleSendEmail}
                disabled={!emailFormUrl.trim() || loading}
              >
                <Send size={16} />
                {loading ? "Sending..." : "Send Email"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <AlertTriangle size={24} />
              <h3 className="text-lg font-medium">Confirm Deletion</h3>
            </div>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this internship program? This
              action cannot be undone.
            </p>
            <div className="flex gap-4 justify-end">
              <button
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                onClick={handleDeleteCancel}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleDeleteConfirm}
                disabled={loading}
              >
                <Trash2 size={16} />
                {loading ? "Deleting..." : "Delete"}
              </button>
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
}

export default App;
