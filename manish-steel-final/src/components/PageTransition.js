import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { DeviceUtils } from '../utils/scrollUtils';

// Enhanced animation variants for professional page transitions
const pageVariants = {
  initial: {
    opacity: 0,
    y: 15,
    scale: 0.98,
  },
  in: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5, // Slightly faster for better UX
      ease: [0.22, 1, 0.36, 1], // Custom cubic-bezier for professional feel
      staggerChildren: 0.05
    }
  },
  out: {
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.3, // Slightly faster exit
      ease: [0.47, 0, 0.745, 0.715] // Quick exit animation
    }
  }
};

// Animation variants for children elements to create a staggered effect
const childVariants = {
  initial: { opacity: 0, y: 20 },
  in: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.4,
      ease: "easeOut"
    }
  }
};

/**
 * Enhanced PageTransition component - Creates smooth, professional transitions between pages
 * Uses Framer Motion for polished animation effects similar to evereststeel.com.np
 * 
 * Features:
 * - Respects reduced motion preferences
 * - Optimized for both mobile and desktop
 * - Staggered reveal of child elements
 * - Smooth fade transitions
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to animate
 * @returns {JSX.Element} Animated page wrapper
 */
const PageTransition = ({ children }) => {
  const location = useLocation();
  const reducedMotion = DeviceUtils.hasReducedMotion();
  
  // Simplified variants for users who prefer reduced motion
  const accessibleVariants = {
    initial: { opacity: 0 },
    in: { 
      opacity: 1,
      transition: { duration: 0.3 }
    },
    out: { 
      opacity: 0,
      transition: { duration: 0.2 }
    }
  };
  
  // Use appropriate variants based on user preferences
  const variants = reducedMotion ? accessibleVariants : pageVariants;
  
  // Force scroll to top when location changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={variants}
        className="w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default PageTransition;
