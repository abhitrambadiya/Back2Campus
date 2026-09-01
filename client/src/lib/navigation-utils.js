import React from 'react';
import { Link as RouterLink } from 'react-router-dom';

/**
 * Determines if a given path is an external link
 * @param {string} path - The path to check
 * @returns {boolean} - True if external link, false otherwise
 */
export const isExternalLink = (path) => {
  return path?.startsWith('http') || 
         path?.startsWith('mailto:') || 
         path?.startsWith('tel:') ||
         path?.startsWith('#');
};

/**
 * Custom Link component that renders either an anchor tag or a React Router Link
 * based on the destination URL
 */
export const SmartLink = ({ to, children, ...props }) => {
  // If it's an external link or hash link, use a regular anchor tag
  if (isExternalLink(to)) {
    return <a href={to} {...props}>{children}</a>;
  }
  
  // Otherwise use React Router's Link component
  return <RouterLink to={to} {...props}>{children}</RouterLink>;
}; 