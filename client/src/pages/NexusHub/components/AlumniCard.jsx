import React from 'react';
import { motion } from 'framer-motion';
import { Building, Briefcase, Medal, Calendar } from 'lucide-react';

const AlumniCard = ({ 
  name, 
  department, 
  passoutYear, 
  currentRole, 
  company, 
  achievements, 
  profilePhoto = "https://via.placeholder.com/100?text=Alumni",
  delay = 0,
  highlighted = false 
}) => {
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: delay * 0.1 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className={`relative rounded-xl overflow-hidden border shadow-md ${
        highlighted 
          ? 'border-primary-color bg-gradient-to-br from-indigo-50 to-white shadow-indigo-100' 
          : 'border-gray-200 bg-white'
      }`}
    >
      {highlighted && (
        <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary-color rounded-full opacity-20"></div>
      )}
      
      <div className="p-6 relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
          <div className={`w-20 h-20 rounded-full overflow-hidden flex-shrink-0 border-2 ${
            highlighted ? 'border-primary-color' : 'border-gray-200'
          }`}>
            <img 
              src={profilePhoto} 
              alt={name} 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://via.placeholder.com/100?text=Alumni";
              }}
            />
          </div>
          
          <div>
            <h3 className="text-xl font-bold text-gray-900">{name}</h3>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
              <p className="text-sm text-gray-600">{department}</p>
              <div className="flex items-center text-sm text-gray-600">
                <Calendar size={14} className="mr-1" />
                <span>{passoutYear}</span>
              </div>
            </div>
          </div>
        </div>

        {achievements && (
          <div className="mb-4">
            <div className="flex items-center mb-1">
              <Medal size={16} className="text-amber-500 mr-2" />
              <h4 className="font-medium text-gray-800">Key Achievements</h4>
            </div>
            <p className="text-sm text-gray-600 pl-6">{achievements}</p>
          </div>
        )}
        
        <div className="flex flex-col gap-1 mt-3">
          {currentRole && (
            <div className="flex items-center">
              <Briefcase size={16} className="text-gray-500 mr-2" />
              <span className="text-sm text-gray-700">{currentRole}</span>
            </div>
          )}
          
          {company && (
            <div className="flex items-center">
              <Building size={16} className="text-gray-500 mr-2" />
              <span className="text-sm text-gray-700">{company}</span>
            </div>
          )}
        </div>
      </div>
      
      {highlighted && (
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-primary-color">
            Featured
          </span>
        </div>
      )}
    </motion.div>
  );
};

export default AlumniCard; 