import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

/**
 * Common page layout component for feature pages
 * @param {Object} props Component props
 * @param {React.ReactNode} props.children - Page content
 * @param {string} props.title - Page title
 * @param {string} props.description - Page description
 * @param {string} props.className - Additional classes for the main content area
 * @param {string} props.bgClass - Background gradient class (default from-blue-50)
 */
const PageLayout = ({ children, title, description, className = "", bgClass = "from-blue-50" }) => {
  return (
    <div className={`min-h-screen bg-gradient-to-b ${bgClass} to-white`}>
      {/* Header with Back Button */}
      <div className="pt-20 px-4 md:px-8 lg:px-16 max-w-7xl mx-auto">
        <Link 
          to="/" 
          className="inline-flex items-center text-primary-color hover:text-indigo-700 transition-colors mb-6"
        >
          <ChevronLeft size={20} className="mr-1" />
          <span>Back to Home</span>
        </Link>
        
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-near-black mb-4">
            {title}
          </h1>
          {description && (
            <p className="text-lg text-gray-600 max-w-3xl">
              {description}
            </p>
          )}
        </div>
      </div>
      
      {/* Main Content */}
      <main className={`px-4 md:px-8 lg:px-16 pb-16 max-w-7xl mx-auto ${className}`}>
        {children}
      </main>
    </div>
  );
};

export default PageLayout; 