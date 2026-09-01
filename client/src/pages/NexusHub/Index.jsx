import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Award,
  Briefcase,
  Users,
  Calendar,
  Lightbulb,
  ExternalLink,
  Menu,
  X,
  Network,
  ChevronRight,
  Mail,
  Linkedin,
  Twitter,
  Facebook,
} from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <NavbarIntegrated />
      <div className="flex-grow">
        <HeroSectionIntegrated />
        <InfoCardsSectionIntegrated />
      </div>
      <FooterIntegrated />
    </div>
  );
};

// Integrated Navbar Component
const NavbarIntegrated = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white shadow-md py-2 opacity-100"
          : "bg-transparent py-4"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <div className="flex items-center">
          <Network size={28} className="text-indigo-600 mr-2" />
          <Link
            to="/"
            className={`font-bold text-xl md:text-2xl tracking-tight flex items-center transition-colors duration-300 ${isScrolled ? "text-gray-900" : "text-gray-800"}`}
          >
            <span className="text-indigo-600 mr-1">Nexus</span>Hub
            <div className="w-2 h-2 bg-indigo-600 rounded-full ml-1 animate-pulse"></div>
          </Link>
        </div>

        <div className="hidden md:flex space-x-8">
          <Link
            to="/NexusHub"
            className="text-gray-600 hover:text-indigo-600 transition-colors duration-300 font-medium"
          >
            Home
          </Link>
          <Link
            to="/NexusHub/hall-Of-Fame"
            className="text-gray-600 hover:text-indigo-600 transition-colors duration-300 font-medium"
          >
            Hall of Fame
          </Link>
          <Link
            to="/NexusHub/alumni"
            className="text-gray-600 hover:text-indigo-600 transition-colors duration-300 font-medium"
          >
            Explore Alumni
          </Link>
          <Link
            to="/NexusHub/mentorship"
            className="text-gray-600 hover:text-indigo-600 transition-colors duration-300 font-medium"
          >
            Mentorship
          </Link>
          <Link
            to="/NexusHub/internships"
            className="text-gray-600 hover:text-indigo-600 transition-colors duration-300 font-medium"
          >
            Internships
          </Link>
          <Link
            to="/NexusHub/events"
            className="text-gray-600 hover:text-indigo-600 transition-colors duration-300 font-medium"
          >
            Events
          </Link>
        </div>

        <button
          className="md:hidden text-gray-800 hover:text-indigo-600 focus:outline-none transition-colors duration-300"
          onClick={toggleMenu}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <div
        className={`md:hidden absolute w-full bg-white shadow-lg transition-all duration-300 origin-top overflow-hidden ${
          isMenuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 py-4 space-y-4 flex flex-col">
          <Link
            to="/NexusHub/hall-Of-Fame"
            className="text-gray-600 hover:text-indigo-600 transition-colors duration-300"
          >
            Hall of Fame
          </Link>
          <Link
            to="/NexusHub/alumni"
            className="text-gray-600 hover:text-indigo-600 transition-colors duration-300"
          >
            Explore Alumni
          </Link>
          <Link
            to="/NexusHub/mentorship"
            className="text-gray-600 hover:text-indigo-600 transition-colors duration-300"
          >
            Mentorship
          </Link>
          <Link
            to="/NexusHub/internships"
            className="text-gray-600 hover:text-indigo-600 transition-colors duration-300"
          >
            Internships
          </Link>
          <Link
            to="/NexusHub/events"
            className="text-gray-600 hover:text-indigo-600 transition-colors duration-300"
          >
            Events
          </Link>
        </div>
      </div>
    </nav>
  );
};

// Integrated Hero Section Component
const HeroSectionIntegrated = () => {
  const sphereRef = useRef(null);
  const [activeFeatureIndex, setActiveFeatureIndex] = useState(0);

  const featureIcons = [
    {
      id: 1,
      icon: <BookOpen size={30} />,
      name: "Knowledge Hub",
      description:
        "Access a wealth of resources uploaded by alumni to boost your learning and career preparation.",
    },
    {
      id: 2,
      icon: <Award size={30} />,
      name: "Hall of Fame",
      description:
        "Celebrate extraordinary achievements and success stories from our alumni community.",
    },
    {
      id: 3,
      icon: <Briefcase size={30} />,
      name: "Internships",
      description:
        "Discover and apply for internship opportunities shared by our alumni network.",
    },
    {
      id: 4,
      icon: <Users size={30} />,
      name: "Alumni",
      description:
        "Connect with graduates to gain insights and build professional relationships.",
    },
    {
      id: 5,
      icon: <Calendar size={30} />,
      name: "Events",
      description:
        "Stay updated on networking events and workshops hosted by Nexus Hub.",
    },
    {
      id: 6,
      icon: <Lightbulb size={30} />,
      name: "Mentorship",
      description:
        "Connect with experienced alumni for personalized guidance and support.",
    },
  ];

  useEffect(() => {
    const sphere = sphereRef.current;
    if (!sphere) return;

    let rotateX = 0;
    let rotateY = 0;
    let requestId;

    const handleMouseMove = (e) => {
      if (!sphere) return;

      const mouseX = (e.clientX / window.innerWidth - 0.5) * 10;
      const mouseY = (e.clientY / window.innerHeight - 0.5) * 10;

      rotateX = mouseY;
      rotateY = -mouseX;

      requestId = requestAnimationFrame(updateSphereRotation);
    };

    const updateSphereRotation = () => {
      if (!sphere) return;

      sphere.style.transform = `
        rotateX(${rotateX}deg) 
        rotateY(${rotateY}deg) 
        rotateZ(0deg)
      `;
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (requestId) {
        cancelAnimationFrame(requestId);
      }
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeatureIndex((prevIndex) =>
        prevIndex === featureIcons.length - 1 ? 0 : prevIndex + 1,
      );
    }, 2500);

    return () => clearInterval(interval);
  }, [featureIcons.length]);

  const calculateIconPosition = (index, totalIcons, activeIndex) => {
    const angleDifference = (2 * Math.PI) / totalIcons;
    const baseAngle = Math.PI / 2;

    const relativePosition = (index - activeIndex + totalIcons) % totalIcons;
    const angle = baseAngle - relativePosition * angleDifference;

    const radius = 100;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;

    const isActive = index === activeIndex;
    const opacity = isActive ? 1 : 0.7;
    const scale = isActive ? 1.2 : 0.8;

    return { x, y, opacity, scale, isActive };
  };

  return (
    <section className="min-h-screen pt-20 overflow-hidden bg-gray-50 flex items-center">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 flex flex-col md:flex-row items-center">
        <div className="w-full md:w-1/2 py-6 md:pr-12 z-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6 animate-fade-in">
            Welcome to <span className="text-indigo-600">Nexus</span> Hub
          </h1>

          <p className="text-lg text-gray-600 mb-8 max-w-lg animate-slide-right delay-200">
            The future of student-alumni connection is here. Access resources,
            discover opportunities, and connect with successful graduates who've
            walked your path.
          </p>

          <div className="flex flex-wrap gap-4 mb-12 animate-fade-in delay-300">
            <a
              href="/NexusHub/Features"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-8 py-3 rounded-md transition-all duration-300 transform hover:scale-105"
            >
              Explore Features
            </a>
            <Link
              to="/NexusHub/GetStarted"
              className="bg-white text-indigo-600 border border-indigo-600 hover:bg-indigo-50 font-medium px-8 py-3 rounded-md shadow-sm hover:shadow transition-all duration-300 transform hover:scale-105"
            >
              About
            </Link>
          </div>
        </div>

        <div className="w-full md:w-1/2 mt-12 md:mt-0 relative sphere-container">
          <div
            ref={sphereRef}
            className="relative mx-auto w-80 h-80 md:w-[26rem] md:h-[26rem] sphere"
            style={{
              transformStyle: "preserve-3d",
            }}
          >
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  "linear-gradient(135deg, rgba(238, 242, 255, 0.7), rgba(199, 210, 254, 0.9))",
                boxShadow:
                  "0 0 50px rgba(79, 70, 229, 0.3), inset 0 0 30px rgba(255, 255, 255, 0.5)",
              }}
            >
              <div
                className="absolute inset-0 rounded-full animate-pulse"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(224, 231, 255, 0))",
                  opacity: 0.6,
                  animationDuration: "3s",
                }}
              ></div>
            </div>

            {featureIcons.map((feature, index) => {
              const { x, y, opacity, scale, isActive } = calculateIconPosition(
                index,
                featureIcons.length,
                activeFeatureIndex,
              );

              return (
                <div
                  key={feature.id}
                  className="absolute transition-all duration-700 ease-in-out"
                  style={{
                    transform: `translate(-50%, -50%) translate3d(${x}px, ${y}px, 0) scale(${scale})`,
                    top: "50%",
                    left: "50%",
                    opacity,
                  }}
                >
                  <div
                    className={`bg-white rounded-full p-5 shadow-lg ${isActive ? "animate-pulse" : ""}`}
                    style={{
                      transition: "all 0.5s ease-out",
                      boxShadow: isActive
                        ? "0 0 25px rgba(79, 70, 229, 0.6)"
                        : "0 0 15px rgba(79, 70, 229, 0.3)",
                    }}
                  >
                    <div className="text-indigo-600 w-12 h-12 flex items-center justify-center">
                      {feature.icon}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-8">
            <h3
              className="text-xl font-bold text-indigo-600 transition-all duration-500 animate-fade-in"
              key={featureIcons[activeFeatureIndex].id}
            >
              {featureIcons[activeFeatureIndex].name}
            </h3>
            <p className="text-sm md:text-base text-gray-600 mt-2 max-w-md mx-auto">
              {featureIcons[activeFeatureIndex].description}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

// New Informational Cards Section Component
const InfoCardsSectionIntegrated = () => {
  const [animationTriggered, setAnimationTriggered] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const section = document.getElementById("info-cards");
      if (!section || animationTriggered) return;

      const sectionPosition = section.getBoundingClientRect();

      if (
        sectionPosition.top < window.innerHeight &&
        sectionPosition.bottom >= 0
      ) {
        setAnimationTriggered(true);
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [animationTriggered]);

  const infoCards = [
    {
      id: 1,
      title: "Northbridge Institute of Engineering & Technology",
      description:
        "Northbridge Institute of Engineering & Technology is a fictional engineering college created for demonstration purposes. The institute represents a modern academic campus offering undergraduate and postgraduate programs across multiple engineering disciplines, supported by laboratories, learning spaces, student facilities, and a collaborative academic environment focused on innovation and practical learning. The campus encourages students to participate in technical clubs, competitions, research projects, and industry-oriented activities.",
      bgColor: "bg-indigo-50",
      hoverBgColor: "hover:bg-indigo-100",
      borderColor: "border-indigo-200",
      numberColor: "text-indigo-600",
    },
    {
      id: 2,
      title: "Northbridge Innovation & Entrepreneurship Center",
      description:
        "The Northbridge Innovation & Entrepreneurship Center is a fictional startup and innovation hub used as part of this demo platform. It represents a campus initiative designed to support student projects, early-stage startups, research ideas, mentorship programs, industry collaboration, networking, and entrepreneurial development. The center provides students with opportunities to transform creative ideas into practical solutions through workshops, expert guidance, and collaborative programs.",
      bgColor: "bg-blue-50",
      hoverBgColor: "hover:bg-blue-100",
      borderColor: "border-blue-200",
      numberColor: "text-blue-600",
    },
    {
      id: 3,
      title: "Team Back2Campus – Vision & Mission",
      description: (
        <>
          <strong className="block mb-2">Vision</strong>
          <p className="mb-4">
            To create a connected student-alumni community where mentorship,
            collaboration, and shared experiences contribute to academic and
            professional growth.
          </p>

          <strong className="block mb-2">Mission</strong>
          <p>
            To provide a platform that helps students and alumni connect through
            mentorship, career opportunities, events, knowledge sharing, and
            meaningful professional relationships.
          </p>
        </>
      ),
      bgColor: "bg-purple-50",
      hoverBgColor: "hover:bg-purple-100",
      borderColor: "border-purple-200",
      numberColor: "text-purple-600",
    },
  ];

  return (
    <section id="info-cards" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            About Nexus Hub
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Learn more about our institution, innovation foundation, & the team
            behind Nexus Hub.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8 max-w-7xl mx-auto">
          {infoCards.map((card, index) => (
            <div
              key={card.id}
              className={`
                rounded-xl border ${card.borderColor} p-8 shadow-sm transition-all duration-300
                ${card.bgColor} ${card.hoverBgColor} hover:-translate-y-2 hover:shadow-lg
                ${animationTriggered ? "animate-fade-in" : "opacity-0"}
              `}
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="flex items-start mb-4">
                <div
                  className={`w-12 h-12 rounded-full ${card.bgColor} border-2 ${card.borderColor} flex flex-shrink-0 items-center justify-center font-bold text-xl ${card.numberColor} mr-4`}
                >
                  {card.id}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 leading-tight">
                  {card.title}
                </h3>
              </div>

              <div className="text-gray-600 mb-6 space-y-2 leading-relaxed">
                {card.description}
              </div>

              <Link
                to={`/info/${card.id}`}
                className={`inline-flex items-center py-2 px-4 rounded-md bg-white border ${card.borderColor} ${card.numberColor} hover:bg-gray-50 transition-colors duration-300 font-medium`}
              >
                Learn More
                <ChevronRight size={16} className="ml-1" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Integrated Footer Component
const FooterIntegrated = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center mb-4">
              <Network size={24} className="text-indigo-400 mr-2" />
              <span className="font-bold text-xl">
                <span className="text-indigo-400">Nexus</span>Hub
              </span>
            </div>
            <p className="text-gray-400 text-sm">
              Connecting students with alumni for guidance, opportunities, and
              networking.
            </p>
          </div>

          <div className="col-span-1 md:col-span-1">
            <h3 className="text-lg font-semibold mb-4 text-white">Features</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/NexusHub/hall-of-fame"
                  className="text-gray-400 hover:text-indigo-400 transition-colors duration-300"
                >
                  Hall of Fame
                </Link>
              </li>
              <li>
                <Link
                  to="/NexusHub/internship"
                  className="text-gray-400 hover:text-indigo-400 transition-colors duration-300"
                >
                  Internships
                </Link>
              </li>
              <li>
                <Link
                  to="/NexusHub/alumni"
                  className="text-gray-400 hover:text-indigo-400 transition-colors duration-300"
                >
                  Explore Alumni
                </Link>
              </li>
              <li>
                <Link
                  to="/NexusHub/mentorship"
                  className="text-gray-400 hover:text-indigo-400 transition-colors duration-300"
                >
                  Mentorship
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-span-1 md:col-span-1">
            <h3 className="text-lg font-semibold mb-4 text-white">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/PrivacyPolicy"
                  className="text-gray-400 hover:text-indigo-400 transition-colors duration-300"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/TermsOfService"
                  className="text-gray-400 hover:text-indigo-400 transition-colors duration-300"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  to="/CookiePolicy"
                  className="text-gray-400 hover:text-indigo-400 transition-colors duration-300"
                >
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/Accessibility"
                  className="text-gray-400 hover:text-indigo-400 transition-colors duration-300"
                >
                  Accessibility
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-span-1 md:col-span-1">
            <h3 className="text-lg font-semibold mb-4 text-white">
              Connect With Us
            </h3>
            <div className="flex items-center mb-3">
              <Mail size={16} className="mr-2 text-gray-400" />
              <a
                href="mailto:support@example.com"
                className="text-gray-400 hover:text-indigo-400 transition-colors duration-300"
              >
                support@example.com
              </a>
            </div>
            <div className="flex space-x-4 mt-4">
              <a
                href="https://www.example.com/back2campus"
                className="text-gray-400 hover:text-indigo-400 transition-colors duration-300"
              >
                <Linkedin size={20} />
              </a>
              <a
                href="https://example.com/back2campus"
                className="text-gray-400 hover:text-indigo-400 transition-colors duration-300"
              >
                <Twitter size={20} />
              </a>
              <a
                href="https://www.example.com/back2campus"
                className="text-gray-400 hover:text-indigo-400 transition-colors duration-300"
              >
                <Facebook size={20} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400 text-sm">
          © 2026 Back2Campus. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Index;
