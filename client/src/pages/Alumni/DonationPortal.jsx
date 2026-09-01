import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAlumniAuth } from '../../context/AlumniAuthContext.jsx';
import LoadingScreen from "../../components/LoadingScreen.jsx";
import apiAlumni from './api.js';
import { getRazorpayOptions, formatAmount, validatePaymentResponse } from '../../config/razorpay.js';

function DonationPortal() {
  const { alumni, logout, loading: authLoading } = useAlumniAuth();
  const [loading, setLoading] = useState(true);
  const [alumniData, setAlumniData] = useState(null);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    amount: '',
    purpose: '',
    message: '',
    anonymous: false,
    paymentMethod: 'online'
  });

  const [paymentLoading, setPaymentLoading] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  const avatarColors = ['646cff', 'f97316', '10b981', '3b82f6', 'ef4444', 'a855f7'];
  
  const getAvatarUrl = (fullName) => {
    if (!fullName) return '';
    return `https://api.dicebear.com/6.x/initials/svg?seed=${encodeURIComponent(fullName)}&backgroundColor=${getRandomColor(fullName)}`;
  };
  
  const getRandomColor = (fullName) => {
    if (!fullName) return avatarColors[0];
    const index = [...fullName].reduce((acc, char) => acc + char.charCodeAt(0), 0) % avatarColors.length;
    return avatarColors[index];
  };

  // Load Razorpay script
  useEffect(() => {
    const loadRazorpayScript = () => {
      return new Promise((resolve) => {
        if (window.Razorpay) {
          setRazorpayLoaded(true);
          resolve(true);
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => {
          setRazorpayLoaded(true);
          resolve(true);
        };
        script.onerror = () => {
          console.error('Failed to load Razorpay script');
          // Don't block the UI if Razorpay fails to load
          setRazorpayLoaded(true);
          resolve(false);
        };
        document.body.appendChild(script);
      });
    };

    loadRazorpayScript();
  }, []);

  useEffect(() => {
    const fetchAlumniProfile = async () => { 
      if (authLoading) return;
      
      const start = Date.now();
      try {
        const response = await apiAlumni.get('/profile');
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
          console.error('Failed to fetch alumni profile:', error);
          navigate('/alumni-login');
          setLoading(false);
        }, delay);
      }
    };

    if (!authLoading) {
      fetchAlumniProfile();
    }
  }, [navigate, authLoading]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle payment success
  const handlePaymentSuccess = async (paymentResponse, donationId) => {
    try {
      // Verify payment with backend
      const verificationResponse = await apiAlumni.post('/donations/verify-payment', {
        donationId,
        paymentId: paymentResponse.razorpay_payment_id,
        orderId: paymentResponse.razorpay_order_id,
        signature: paymentResponse.razorpay_signature
      });

      if (verificationResponse.status === 200) {
        alert('Payment successful! Thank you for your donation.');
        navigate('/alumni-home');
      } else {
        throw new Error('Payment verification failed');
      }
    } catch (error) {
      console.error('Payment verification failed:', error);
      alert('Payment verification failed. Please contact support.');
    }
  };

  // Handle payment failure
  const handlePaymentFailure = (error) => {
    console.error('Payment failed:', error);
    alert('Payment failed. Please try again.');
    setPaymentLoading(false);
  };

  // Initialize Razorpay payment
  const initializePayment = async () => {
    if (!window.Razorpay) {
      alert('Payment system is not available. Please try refreshing the page or contact support.');
      return;
    }

    try {
      setPaymentLoading(true);

      // First create donation record
      const donationData = {
        ...formData,
        alumniName: alumniData.fullName,
        alumniEmail: alumniData.email,
        alumniCompany: alumniData.companyName,
        alumniPosition: alumniData.jobPosition,
        donationDate: new Date().toISOString(),
        status: 'pending'
      };

      const donationResponse = await apiAlumni.post('/donations', donationData);
      
      if (donationResponse.status !== 201) {
        throw new Error('Failed to create donation record');
      }

      const donationId = donationResponse.data.data.donationId;
      const amount = parseInt(formData.amount);

      // Create Razorpay order
      const orderResponse = await apiAlumni.post('/donations/create-order', {
        amount: amount * 100, // Convert to paise
        currency: 'INR',
        donationId: donationId
      });

      if (orderResponse.status !== 200) {
        throw new Error('Failed to create payment order');
      }

      const orderData = orderResponse.data.data;

      // Configure Razorpay options
      const options = getRazorpayOptions(amount, formData.purpose, alumniData.fullName, alumniData.email);
      options.order_id = orderData.id;

      // Handle payment success
      options.handler = (response) => {
        handlePaymentSuccess(response, donationId);
      };

      // Handle payment failure
      options.modal.ondismiss = () => {
        handlePaymentFailure('Payment cancelled by user');
      };

      // Open Razorpay checkout
      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', (response) => {
        handlePaymentFailure(response.error);
      });

      razorpay.open();
      setPaymentLoading(false);

    } catch (error) {
      console.error('Payment initialization failed:', error);
      alert('Failed to initialize payment. Please try again.');
      setPaymentLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!alumniData) {
      console.error('Alumni data not loaded');
      return;
    }

    // Check if Razorpay is available for online payments
    if (formData.paymentMethod === 'online' && !window.Razorpay) {
      alert('Payment system is not available. Please try refreshing the page or contact support.');
      return;
    }

    if (formData.paymentMethod === 'online') {
      await initializePayment();
    } else {
      // Handle offline payment (cheque/DD)
      try {
        setLoading(true);
        
        const donationData = {
          ...formData,
          alumniName: alumniData.fullName,
          alumniEmail: alumniData.email,
          alumniCompany: alumniData.companyName,
          alumniPosition: alumniData.jobPosition,
          donationDate: new Date().toISOString(),
          status: 'pending'
        };
        
        const response = await apiAlumni.post('/donations', donationData);
        
        if (response.status === 201) {
          alert('Donation request submitted successfully! You will receive instructions for offline payment via email.');
          navigate('/alumni-home');
        }
      } catch (error) {
        console.error('Failed to submit donation:', error);
        alert('Failed to submit donation. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleLogout = async () => {
    try {
        await apiAlumni.post('/logout', {}, { withCredentials: true });
        logout();
    } catch (error) {
        console.error('Logout failed:', error);
        logout();
    }
  }; 

  if (loading) {
    return <LoadingScreen message="Loading Donation Portal..." />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      {/* Navbar */}
      <nav className="bg-white shadow fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center">
          <a href="/alumni-home" className="text-2xl font-bold text-indigo-600 no-underline">Alumni Hub</a>
          <div className="flex items-center gap-8">
            <Link to="/alumni-home" className="text-gray-600 font-medium hover:text-indigo-600 transition-colors no-underline">Home</Link>
            <Link to="/alumni-faq" className="text-gray-600 font-medium hover:text-indigo-600 transition-colors no-underline">Q&A</Link>
            <Link to="/alumni-mentorship" className="text-gray-600 font-medium hover:text-indigo-600 transition-colors no-underline">Add Mentorship</Link>
            <Link to="/alumni-internship" className="text-gray-600 font-medium hover:text-indigo-600 transition-colors no-underline">Add Internsip</Link>
            <Link to="/alumni-meet" className="text-gray-600 font-medium hover:text-indigo-600 transition-colors no-underline">Alumni Meet</Link>
            <Link to="/alumni-event" className="text-gray-600 font-medium hover:text-indigo-600 transition-colors no-underline">Alumni Event</Link>
            <Link to="/alumni-donation" className="text-indigo-600 font-medium hover:text-indigo-700 transition-colors no-underline">Donation Portal</Link>
            <button onClick={handleLogout} className="text-gray-700 border border-gray-300 px-4 py-1.5 rounded-md ml-4 hover:text-indigo-600 hover:border-indigo-600 hover:bg-gray-50 transition-all no-underline font-medium">
              Logout
            </button>
          </div>
        </div>
      </nav>
      
      <main className="max-w-7xl mx-auto mt-24 mb-8 px-8 w-full">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-8 mb-8 text-white shadow-lg">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Support Northbridge Institute of Engineering & Technology</h1>
            <p className="text-xl text-indigo-100 mb-6">
              Your contribution helps us build a better future for students and strengthen our alumni community
            </p>
            <div className="flex justify-center space-x-8 text-center">
              <div>
                <div className="text-3xl font-bold">500+</div>
                <div className="text-indigo-200">Alumni Donors</div>
              </div>
              <div>
                <div className="text-3xl font-bold">₹50L+</div>
                <div className="text-indigo-200">Total Raised</div>
              </div>
              <div>
                <div className="text-3xl font-bold">100+</div>
                <div className="text-indigo-200">Projects Funded</div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Donation Form */}
          <div className="lg:col-span-2">
            <section className="bg-white rounded-lg p-8 shadow">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Make a Donation</h2>
              
              <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Amount Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Donation Amount</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    {[500, 1000, 2500, 5000, 10000, 25000, 50000, 100000].map((amount) => (
                      <button
                        key={amount}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, amount: amount.toString() }))}
                        className={`p-3 border rounded-lg text-center font-medium transition-colors ${
                          formData.amount === amount.toString()
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                            : 'border-gray-300 hover:border-indigo-300'
                        }`}
                      >
                        ₹{amount.toLocaleString()}
                      </button>
                    ))}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500">₹</span>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter custom amount"
                      min="100"
                    />
                    
                  </div>
                </div>

                {/* Purpose Selection */}
                <div>
                  <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 mb-1">Purpose of Donation</label>
                  <select
                    id="purpose"
                    name="purpose"
                    value={formData.purpose}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  >
                    <option value="">Select purpose</option>
                    <option value="infrastructure">Infrastructure Development</option>
                    <option value="scholarship">Student Scholarships</option>
                    <option value="research">Research & Innovation</option>
                    <option value="library">Library Resources</option>
                    <option value="sports">Sports Facilities</option>
                    <option value="events">Alumni Events</option>
                    <option value="general">General Fund</option>
                  </select>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Payment Method</label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="online"
                        checked={formData.paymentMethod === 'online'}
                        onChange={handleChange}
                        className="mr-3"
                      />
                      <span>Online Payment (UPI/Card/Net Banking)</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cheque"
                        checked={formData.paymentMethod === 'cheque'}
                        onChange={handleChange}
                        className="mr-3"
                      />
                      <span>Cheque/DD (Offline)</span>
                    </label>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message (Optional)</label>
                  <textarea
                    id="message"
                    name="message"
                    rows={3}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Leave a message for the college community..."
                  />
                </div>

                {/* Anonymous Donation */}
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="anonymous"
                      checked={formData.anonymous}
                      onChange={handleChange}
                      className="mr-3"
                    />
                    <span className="text-sm text-gray-700">Make this donation anonymous</span>
                  </label>
                </div>

                 <div className="flex justify-end">
                   <button
                     type="submit"
                     className="px-8 py-3 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                     disabled={loading || paymentLoading || !formData.amount || !formData.purpose}
                   >
                     {loading || paymentLoading ? 'Processing...' : 
                      formData.paymentMethod === 'online' ? 'Proceed to Payment' : 'Submit Donation Request'}
                   </button>
                 </div>
                 
                 {/* Loading indicator for Razorpay */}
                 {!razorpayLoaded && formData.paymentMethod === 'online' && (
                   <div className="mt-4 p-3 bg-blue-50 rounded text-sm text-blue-700">
                     <div className="flex items-center">
                       <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700 mr-2"></div>
                       Loading payment system...
                     </div>
                   </div>
                 )}
              </form>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Donations */}
            <section className="bg-white rounded-lg p-6 shadow">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Donations</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <div>
                    <div className="font-medium text-gray-900">Anonymous</div>
                    <div className="text-sm text-gray-500">Infrastructure Development</div>
                  </div>
                  <div className="text-indigo-600 font-bold">₹25,000</div>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <div>
                    <div className="font-medium text-gray-900">Dr. Rajesh Kumar</div>
                    <div className="text-sm text-gray-500">Student Scholarships</div>
                  </div>
                  <div className="text-indigo-600 font-bold">₹50,000</div>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <div>
                    <div className="font-medium text-gray-900">Priya Sharma</div>
                    <div className="text-sm text-gray-500">Research & Innovation</div>
                  </div>
                  <div className="text-indigo-600 font-bold">₹15,000</div>
                </div>
              </div>
            </section>

            {/* Impact Stories */}
            <section className="bg-white rounded-lg p-6 shadow">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Your Impact</h3>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-green-800 font-medium">New Computer Lab</div>
                  <div className="text-sm text-green-600">Funded by alumni donations - 50+ students benefit daily</div>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-blue-800 font-medium">Merit Scholarships</div>
                  <div className="text-sm text-blue-600">25 students received full tuition support this year</div>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="text-purple-800 font-medium">Research Equipment</div>
                  <div className="text-sm text-purple-600">Advanced lab equipment for cutting-edge research</div>
                </div>
              </div>
            </section>

            {/* Contact Info */}
            <section className="bg-white rounded-lg p-6 shadow">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Need Help?</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div>📧 donations@example.in</div>
                <div>📞 +91 123-456-7890</div>
                <div>🏢 Development Office</div>
              </div>
            </section>
          </div>
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
                <li><a href="/TermsOfService" className="text-gray-400 hover:text-white transition-colors duration-200 no-underline">Terms Of Service</a></li>
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

export default DonationPortal;
