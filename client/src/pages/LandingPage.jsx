import React, { useState, useEffect, useRef } from 'react'; // Fixed useRef import
import { Link } from "react-router-dom";
import axios from 'axios';
import { 
  GraduationCap, 
  Briefcase, 
  Lightbulb, 
  Check, 
  ChevronRight, 
  Menu, 
  X,
} from 'lucide-react';
import AlumniMap from './MapComponent';
import AboutSection from '../components/AboutSection';
import VisionarySection from '../components/VisionarySection';

import { ThemeProvider } from 'styled-components';
import { theme } from '../components/styles/Theme';
import { GlobalStyles } from '../components/styles/GlobalStyles';

import img1 from "../assets/pexels-davegarcia-31070772.jpg";
import img2 from "../assets/pexels-kaca-pic-2153399808-37877709.jpg";
import img3 from "../assets/pexels-pixabay-159490.jpg";
import img4 from "../assets/photo-1541339907198-e08756dedf3f.avif";
import img5 from "../assets/photo-1658235081452-c2ded30b8d9f.avif";
import LogoVector from "../logos/LogoVector.png";


const VITE_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';


// Hero section background images
const heroImages = [
  img1,
  img2,
  img3,
  img4,
  img5
];


// Feature data
const features = [
  {
    id: 1,
    title: 'Academic Mentorship',
    description: 'Connect with alumni mentors who can guide you through your academic journey and help you excel in your studies.',
    icon: <GraduationCap className="w-10 h-10 text-indigo-600" />,
    color: 'bg-indigo-50',
    hoverColor: 'hover:bg-indigo-100',
    borderColor: 'border-indigo-200'
  },
  {
    id: 2,
    title: 'Career Guidance',
    description: 'Get personalized career advice from successful alumni working in your field of interest.',
    icon: <Briefcase className="w-10 h-10 text-blue-600" />,
    color: 'bg-blue-50',
    hoverColor: 'hover:bg-blue-100',
    borderColor: 'border-blue-200'
  },
  {
    id: 3,
    title: 'Startup Mentorship',
    description: 'Learn from alumni entrepreneurs who have built successful businesses and can help with your startup journey.',
    icon: <Lightbulb className="w-10 h-10 text-yellow-600" />,
    color: 'bg-yellow-50',
    hoverColor: 'hover:bg-yellow-100',
    borderColor: 'border-yellow-200'
  }
];

// Stats data
// const stats = [
//   { id: 1, number: '10,000+', label: 'Alumni Network', icon: <Users className="w-6 h-6 text-blue-500" /> },
//   { id: 2, number: '$2M+', label: 'Donations Raised', icon: <DollarSign className="w-6 h-6 text-green-500" /> },
//   { id: 3, number: '500+', label: 'Events Hosted', icon: <Calendar className="w-6 h-6 text-purple-500" /> },
//   { id: 4, number: '1,200+', label: 'Job Referrals', icon: <Award className="w-6 h-6 text-yellow-500" /> }
// ];

// Helper function for avatar URLs (using placeholder service)
const getAvatarUrl = (name) => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=646cff&color=fff&rounded=true`;
};

function App() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Hero image slider effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // Scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);


  // NODE-EMAILER FOR CONTACT FORM
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleContactChange = (e) => {
    const { name, value } = e.target;  // Changed from id to name
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await axios.post(`${VITE_API_URL}/landingpage/submit`, formData);
      setSubmitStatus({
        type: 'success',
        message: response.data.message
      });
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        message: ''
      });
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: error.response?.data?.message || 'Failed to send message. Please try again.'
      });
    } finally {
      setSubmitting(false);
    }
  };

// NodeEmailer for the subscribe button
const [email, setEmail] = useState('');
const [isSubscribed, setIsSubscribed] = useState(false);
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState(null);
  // New state variable to manage the notification
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "" // e.g., 'success', 'error'
  });
  // A function in the parent to handle closing the notification
  const handleCloseNotification = () => {
    setNotification({ ...notification, show: false });
  }

// Notification component
const Notification = ({ show, message, type, onClose }) => {
  if (!show) return null;

  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';

  return (
    <div className={`fixed top-4 right-4 ${bgColor} text-white p-4 rounded-lg shadow-lg z-50 flex items-center animate-slideInRight`}>
      {type === 'success' ? <Check className="mr-2" size={20} /> : <X className="mr-2" size={20} />}
      <span>{message}</span>
      <button onClick={onClose} className="ml-4">
        <X size={16} />
      </button>
    </div>
  );
}

const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setNotification({ show: false, message: '', type: '' }); // Clear any previous notification
    
    // ... rest of your validation logic
    if (!email) {
      setError('Please enter an email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${VITE_API_URL}/landingpage/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          // Set error notification
          setNotification({
            show: true,
            message: 'This email is already subscribed!',
            type: 'error'
          });
        } else {
          // Set a generic error notification
          setNotification({
            show: true,
            message: data.error || 'Already Subscribed!',
            type: 'error'
          });
        }
        throw new Error(data.message || 'Already Subscribed');
      }

      setIsSubscribed(true);
      setEmail('');
      // Set success notification
      setNotification({
        show: true,
        message: 'Already Subscribed!',
        type: 'success'
      });
      
    } catch (error) {
      // The 409 error is handled by the notification, so we just log other errors.
      if (error.message !== 'Already Subscribed') { // or any other message
          console.error('Full subscription error:', error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

// In your JSX render:
{error && (
  <div className="text-red-500 text-sm mt-2">
    {error}
  </div>
)}

  // Success stories from backend
    const [allStories, setAllStories] = useState([]);
    const [displayedStories, setDisplayedStories] = useState([]);
    const [loading, setLoading] = useState(true);
    // const [error, setError] = useState(null);
  
    // Fetch all stories on component mount
    useEffect(() => {
      const fetchStories = async () => {
        try {
          const response = await fetch(`${VITE_API_URL}/landingpage/success-stories`);
          if (!response.ok) throw new Error('Failed to fetch');
          const data = await response.json();
          setAllStories(data);
          // Display initial random 3 stories
          updateDisplayedStories(data);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
  
      fetchStories();
    }, []);
  
    // Set up rotation every 7 seconds
    useEffect(() => {
      if (allStories.length <= 3) return; // No rotation needed if <= 3 stories
  
      const rotationInterval = setInterval(() => {
        updateDisplayedStories(allStories);
      }, 7000);
  
      return () => clearInterval(rotationInterval);
    }, [allStories]);
  
    // Helper function to select 3 random stories
    const updateDisplayedStories = (stories) => {
      const shuffled = [...stories].sort(() => 0.5 - Math.random());
      setDisplayedStories(shuffled.slice(0, 3));
    };

    if (loading) return (
      <div className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-xl p-8 animate-pulse">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 rounded-full bg-gray-300"></div>
                <div className="ml-4 space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-300 rounded"></div>
                <div className="h-4 bg-gray-300 rounded w-5/6"></div>
                <div className="h-4 bg-gray-300 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
    if (error) return <div className="text-center py-10 text-red-500">Error: {error}</div>;

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
    <div className="min-h-screen bg-white">
      {/* Navigation */}
         <nav
        className={`fixed w-full z-50 transition-all duration-300 ${
          scrolled ? "bg-white shadow-md py-2 opacity-100" : "bg-transparent py-4 opacity-0 pointer-events-none"
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className={`flex items-center transition-all duration-300 ${scrolled ? 'ml-0' : 'ml-0'}`}>
              {/* <img
                src={LogoVector}
                alt="Logo"
                className={`h-14 w-auto mr-2 transition-opacity duration-300 ${scrolled ? 'opacity-100' : 'opacity-0'}`}
              /> */}
              <GraduationCap
                className={`h-14 w-9 transition-all duration-300 ${scrolled ? "text-indigo-600 ml-0" : "text-white ml-0"}`}
              />
              <span
                className={`transition-all duration-300 text-2xl font-bold ${scrolled ? "ml-2 text-gray-800" : "ml-2 text-white"}`}
              >
                Back2Campus
              </span>
            </div>
              
              {/* Desktop Navigation */}
               <div className="hidden md:flex items-center space-x-8">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  document
                    .getElementById("features")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className={`${
                  scrolled
                    ? "text-gray-600 hover:text-indigo-600"
                    : "text-white hover:text-indigo-600"
                } transition-colors duration-300`}
              >
                Features
              </a>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  document
                    .getElementById("stories")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className={`${
                  scrolled
                    ? "text-gray-600 hover:text-indigo-600"
                    : "text-white hover:text-indigo-600"
                } transition-colors duration-300`}
              >
                Success Stories
              </a>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  document
                    .getElementById("collegeInfo")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className={`${
                  scrolled
                    ? "text-gray-600 hover:text-indigo-600"
                    : "text-white hover:text-indigo-600"
                } transition-colors duration-300`}
              >
                College Info
              </a>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  document
                    .getElementById("map")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className={`${
                  scrolled
                    ? "text-gray-600 hover:text-indigo-600"
                    : "text-white hover:text-indigo-600"
                } transition-colors duration-300`}
              >
                Map
              </a>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  document
                    .getElementById("contact")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className={`${
                  scrolled
                    ? "text-gray-600 hover:text-indigo-600"
                    : "text-white hover:text-indigo-600"
                } transition-colors duration-300`}
              >
                Contact
              </a>
              <Link to="/NexusHub">
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition-colors duration-300">
                  Nexus HUB
                </button>
              </Link>
              <Link to="/alumni-login">
                <button className="bg-white text-indigo-600 border border-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-md transition-colors duration-300">
                  Alumni Login
                </button>
              </Link>
            </div>
              
              {/* Mobile menu button */}
             <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`${
                  scrolled ? "text-gray-800" : "text-white"
                } focus:outline-none`}
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
            
            {/* Mobile Navigation */}
            {isMenuOpen && (
            <div className="md:hidden mt-4 bg-white rounded-lg shadow-lg p-4 absolute left-4 right-4 transition-all duration-300 transform origin-top">
              <div className="flex flex-col space-y-4">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    document
                      .getElementById("features")
                      ?.scrollIntoView({ behavior: "smooth" });
                    setIsMenuOpen(false);
                  }}
                  className="text-gray-600 hover:text-indigo-600 transition-colors duration-300"
                >
                  Features
                </a>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    document
                      .getElementById("stories")
                      ?.scrollIntoView({ behavior: "smooth" });
                    setIsMenuOpen(false);
                  }}
                  className="text-gray-600 hover:text-indigo-600 transition-colors duration-300"
                >
                  Success Stories
                </a>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    document
                      .getElementById("collegeInfo")
                      ?.scrollIntoView({ behavior: "smooth" });
                    setIsMenuOpen(false);
                  }}
                  className="text-gray-600 hover:text-indigo-600 transition-colors duration-300"
                >
                  College Info
                </a>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    document
                      .getElementById("map")
                      ?.scrollIntoView({ behavior: "smooth" });
                    setIsMenuOpen(false);
                  }}
                  className="text-gray-600 hover:text-indigo-600 transition-colors duration-300"
                >
                  Map
                </a>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    document
                      .getElementById("contact")
                      ?.scrollIntoView({ behavior: "smooth" });
                    setIsMenuOpen(false);
                  }}
                  className="text-gray-600 hover:text-indigo-600 transition-colors duration-300"
                >
                  Contact
                </a>
                <Link to="/NexusHub">
                  <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition-colors duration-300">
                    Nexus HUB
                  </button>
                </Link>
                <Link to="/alumni-login">
                  <button className="bg-white text-indigo-600 border border-indigo-700 hover:bg-indigo-600 px-4 py-2 rounded-md transition-colors duration-300">
                    Alumni Login
                  </button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image Slider */}
        {heroImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
              index === currentImageIndex ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="absolute inset-0 bg-black opacity-60"></div>
            <img
              src={image}
              alt={""}
              className="w-full h-full object-cover p-12 md:p-18"
              style={{ objectPosition: "center 30%" }}
            />
            
          </div>
          
        ))}
        
        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
          <p className="text-xl sm:text-2xl text-gray-200 mb-2 animate-fade-in">
            Welcome to
          </p>
          <div className="flex items-center justify-center mb-6 animate-fade-in">
            {/* <img
              src={LogoVector}
              alt="Logo"
              className="h-12 w-auto mr-4"
            /> */}
            <GraduationCap className="h-20 w-auto mr-4 text-white" />
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white">
              Back2Campus
            </h1>
          </div>
          <p className="text-xl sm:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto animate-fade-in-delay">
            Be part of a vibrant alumni network where connections are made,
            opportunities are shared, and legacies are built. <br/>
            This demo showcases the alumni platform we are currently developing for our college community.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fade-in-delay-2">
            {/* <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-md text-lg font-medium transition-colors duration-300 transform hover:scale-105">
              Join the Network
            </button>
            <button className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-indigo-600 px-8 py-3 rounded-md text-lg font-medium transition-all duration-300">
              Learn More
            </button> */}
          </div>
        </div>
        
        {/* Scroll down indicator */}
        <div className="absolute bottom-8 left-50% transform -translate-x-1/2 animate-bounce">
          <a className="text-white flex flex-col items-center">
            <span className="text-s mb-2">Scroll Down</span>
            <ChevronRight className="w-6 h-6 transform rotate-90" />
          </a>
        </div>
      </section>

      {/* About Section - ADD THIS */}
        <AboutSection />

      {/* Vision and Mission */}
      <VisionarySection/>

      {/* Features Section */}
      <section id="features" className="py-12 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              What We Offer
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform provides a range of services designed to help
              students & alumni to connect, grow, and give back to their
              community.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.id}
                className={`${feature.color} ${feature.hoverColor} border ${feature.borderColor} rounded-xl p-8 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-lg`}
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="stories" className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Success Stories
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover inspiring stories from alumni who have gained valuable
              benefits through our network and resources, shaping their personal
              and professional journeys.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {displayedStories.length > 0 ? (
              displayedStories.map((story, index) => (
                <div
                  key={story.fullName || index}
                  className="bg-gray-50 rounded-xl p-8 shadow-sm transition-all duration-300 hover:shadow-lg"
                >
                  <div className="flex items-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mr-4">
                      <img
                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${story.fullName}`}
                        alt="Avatar"
                        className="w-13 h-13 rounded-full"
                      />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">
                        {story.fullName}
                      </h4>
                      <p className="text-gray-600">
                        {story.jobPosition} ({story.passOutYear})
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-700 italic">"{story.successStory}"</p>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center py-10 text-gray-500">
                No success stories found yet.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {/* <section className="py-16 bg-indigo-700 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {stats.map((stat) => (
              <div key={stat.id} className="bg-indigo-800 rounded-lg p-6 transform transition-transform duration-300 hover:scale-105">
                <div className="flex justify-center mb-4">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold mb-2">{stat.number}</div>
                <div className="text-indigo-200">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* CTA Section */}
      {/* <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">Ready to Connect with Your Alumni Network?</h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-3xl mx-auto">
            Join thousands of alumni who are already benefiting from our platform. Sign up today and start building meaningful connections.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="bg-white text-indigo-600 hover:bg-indigo-50 px-8 py-3 rounded-md text-lg font-medium transition-colors duration-300 transform hover:scale-105">
              Join Now
            </button>
            <button className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-indigo-600 px-8 py-3 rounded-md text-lg font-medium transition-all duration-300">
              Request Demo
            </button>
          </div>
        </div>
      </section> */}

      {/* College Info Section */}
      {/* <section id="collegeInfo" className="py-16 px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-center font-bold text-4xl text-gray-800 mb-12 relative">
            Welcome to Our College
            <span className="absolute bottom-[-10px] left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-indigo-400 to-indigo-500"></span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-4">
            <div className="bg-white p-8 rounded-xl shadow-md hover:-translate-y-1 hover:shadow-lg">
              <h3 className="text-2xl text-gray-800 mb-4 relative pb-2">
                Academics
                <span className="absolute bottom-0 left-0 w-12 h-0.5 bg-indigo-400"></span>
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Ranked among top universities with outstanding faculty and research opportunities.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md hover:-translate-y-1 hover:shadow-lg">
              <h3 className="text-2xl text-gray-800 mb-4 relative pb-2">
                Student Life
                <span className="absolute bottom-0 left-0 w-12 h-0.5 bg-indigo-400"></span>
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Vibrant campus culture with over 100+ student organizations and activities.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md hover:-translate-y-1 hover:shadow-lg">
              <h3 className="text-2xl text-gray-800 mb-4 relative pb-2">
                Global Network
                <span className="absolute bottom-0 left-0 w-12 h-0.5 bg-indigo-400"></span>
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Join our network of 50,000+ alumni spread across 75+ countries.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md hover:-translate-y-1 hover:shadow-lg">
              <h3 className="text-2xl text-gray-800 mb-4 relative pb-2">
                Innovation Hub
                <span className="absolute bottom-0 left-0 w-12 h-0.5 bg-indigo-400"></span>
              </h3>
              <p className="text-gray-600 leading-relaxed">
                State-of-the-art facilities and cutting-edge research centers.
              </p>
            </div>
          </div>
        </div>
      </section> */}

      {/* MAP Section */}
      <section id="map" className="py-16 px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-center font-bold text-4xl text-gray-800 mb-4 relative">
            Our Alumni Around the World
            <span className="absolute bottom-[-10px] left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-indigo-400 to-indigo-500"></span>
          </h2>

          <p className="text-center text-gray-600 mb-8 text-lg">
            Explore how our graduates are making a global impact, driving change
            and success in diverse fields around the world.
          </p>

          <div className="rounded-xl overflow-hidden shadow-xl relative z-0">
            <AlumniMap />
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Get in Touch
              </h2>
              <p className="text-xl text-gray-600">
                Have questions or need more information? Reach out to us.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="p-8 bg-indigo-700 text-white">
                  {/* Contact Information Card - Orange background */}
                  <h3 className="text-2xl font-bold mb-6">
                    Contact Information
                  </h3>
                  <p className="mb-8">
                    Fill out the form and our team will get back to you within
                    24 hours.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <svg
                        className="w-6 h-6 mr-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        ></path>
                      </svg>
                      <a href="tel:+1231231234">
                        <span>+91 1231231234</span>
                      </a>
                    </div>
                    <div className="flex items-center">
                      <svg
                        className="w-6 h-6 mr-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        ></path>
                      </svg>
                      <a href="mailto:info@xyz.in">
                        <span>info@xyz.in</span>
                      </a>
                    </div>
                    <div className="flex items-center">
                      <svg
                        className="w-6 h-6 mr-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        ></path>
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        ></path>
                      </svg>
                      <a
                        href="https://maps.app.goo.gl/NJSN3xfAA9ZM2efKA"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <span>
                          123 Innovation Avenue, Tech Park Road, XYZ City - 400 001, Maharashtra
                        </span>
                      </a>
                    </div>
                  </div>
                </div>
                <div className="p-8">
                  <form onSubmit={handleContactSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label
                          htmlFor="firstName"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          First Name
                        </label>
                        <input
                          type="text"
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleContactChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                          required
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="lastName"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Last Name
                        </label>
                        <input
                          type="text"
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleContactChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleContactChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="message"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Message
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows={4}
                        value={formData.message}
                        onChange={handleContactChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        required
                        minLength="10"
                      ></textarea>
                    </div>
                    {submitStatus && (
                      <div
                        className={`p-3 rounded-md ${
                          submitStatus.type === "success"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {submitStatus.message}
                      </div>
                    )}
                    <button
                      type="submit"
                      disabled={submitting}
                      className={`w-full bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-md transition-colors duration-300 ${
                        submitting ? "opacity-70 cursor-not-allowed" : ""
                      }`}
                    >
                      {submitting ? "Sending..." : "Send Message"}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <GraduationCap className="h-8 w-8 text-white" />
                <span className="ml-2 text-xl font-bold">Back2Campus</span>
              </div>
              <p className="text-gray-400 mb-4">
                Connecting students & alumni for a stronger community and
                brighter future.
              </p>
              <div className="flex space-x-4">
                <a
                  href="https://example.com/facebook"
                  className="text-gray-400 hover:text-white transition-colors duration-300"
                  target="_null"
                >
                  <svg
                    className="w-7 h-7"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"></path>
                  </svg>
                </a>
                <a
                  href="https://example.com/twitter"
                  className="text-gray-400 hover:text-white transition-colors duration-300"
                  target="_null"
                >
                  <svg
                    className="w-7 h-7"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                  </svg>
                </a>
                <a
                  href="https://example.com/linkedin"
                  className="text-gray-400 hover:text-white transition-colors duration-300"
                  target="_null"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path>
                  </svg>
                </a>
                <a
                  href="https://example.com/instagram"
                  className="text-gray-400 hover:text-white transition-colors duration-300"
                  target="_null"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"></path>
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="https://www.example.com/"
                    className="text-gray-400 hover:text-white transition-colors duration-300"
                  >
                    College Website
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.example.com/irf"
                    className="text-gray-400 hover:text-white transition-colors duration-300"
                  >
                    College IRF
                  </a>
                </li>
                <li>
                  <Link
                    to="/FAQ"
                    className="text-gray-400 hover:text-white transition-colors duration-300"
                  >
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link
                    to="/PrivacyPolicy"
                    className="text-gray-400 hover:text-white transition-colors duration-300"
                  >
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/Accessibility"
                    className="text-gray-400 hover:text-white transition-colors duration-300"
                  >
                    Accessibility
                  </Link>
                </li>
                <li>
                  <Link
                    to="/CookiePolicy"
                    className="text-gray-400 hover:text-white transition-colors duration-300"
                  >
                    Cookie Policy
                  </Link>
                </li>
                <li>
                  <Link
                    to="/TermsOfService"
                    className="text-gray-400 hover:text-white transition-colors duration-300"
                  >
                    Terms Of Service 
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Subscribe</h3>
              <p className="text-gray-400 mb-4">
                Stay updated with our latest news and events.
              </p>
              <form className="flex" onSubmit={handleSubmit}>
                <input
                  type="email"
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="px-4 py-2 w-full text-gray-800 placeholder-gray-500 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white border border-gray-300"
                  required
                  disabled={isSubscribed}
                />
                <button
                  type="submit"
                  className={`px-4 py-2 rounded-r-md transition-colors duration-300 ${
                    isSubscribed
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-indigo-600 hover:bg-indigo-700"
                  } text-white`}
                  disabled={isLoading || isSubscribed}
                >
                  {isLoading
                    ? "Processing..."
                    : isSubscribed
                    ? "Subscribed!"
                    : "Subscribe"}
                </button>
              </form>
              {/* Add the new Notification component */}
              {/* Display a local error message below the form */}
              {error && <div className="text-red-500 mt-2">{error}</div>}
              <Notification
                show={notification.show}
                message={notification.message}
                type={notification.type}
                onClose={() => setNotification({ ...notification, show: false })}
              />
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>
              &copy; {new Date().getFullYear()} Back2Campus. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
   </ThemeProvider>
  );
}

export default App;
