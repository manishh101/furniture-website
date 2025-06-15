import React, { useEffect, useRef, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { DeviceUtils } from '../utils/scrollUtils';

// Animation variants for scroll-triggered elements
const scrollAnimationVariants = {
  hidden: { 
    opacity: 0,
    y: 30
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

/**
 * ScrollRevealElement - Component that animates when scrolled into view
 * Uses Intersection Observer API for efficient animation triggering
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Elements to animate
 * @param {string} props.className - Additional classes to add
 * @param {Object} props.customVariants - Custom animation variants
 * @param {string} props.animateFrom - Animation direction ('top', 'bottom', 'left', 'right')
 * @param {number} props.threshold - Intersection observer threshold (0-1)
 * @param {number} props.delay - Animation delay in seconds
 * @returns {JSX.Element} Animated element that reveals on scroll
 */
const ScrollRevealElement = ({ 
  children, 
  className = '', 
  customVariants,
  animateFrom = 'bottom',
  threshold = 0.1,
  delay = 0
}) => {
  const controls = useAnimation();
  const ref = useRef(null);
  const [isInView, setIsInView] = useState(false);
  
  // Determine animation direction
  const getDirectionalVariants = () => {
    if (customVariants) return customVariants;
    
    // Skip animations if user prefers reduced motion
    if (DeviceUtils.hasReducedMotion()) {
      return {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.3 } }
      };
    }
    
    const animations = {
      top: { hidden: { opacity: 0, y: -50 }, visible: { opacity: 1, y: 0 } },
      bottom: { hidden: { opacity: 0, y: 50 }, visible: { opacity: 1, y: 0 } },
      left: { hidden: { opacity: 0, x: -50 }, visible: { opacity: 1, x: 0 } },
      right: { hidden: { opacity: 0, x: 50 }, visible: { opacity: 1, x: 0 } },
      fade: { hidden: { opacity: 0 }, visible: { opacity: 1 } },
      scale: { hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1 } },
    };
    
    return animations[animateFrom] || animations.bottom;
  };
  
  // Setup variants with transition
  const variants = {
    ...getDirectionalVariants(),
    visible: {
      ...getDirectionalVariants().visible,
      transition: { 
        duration: 0.6, 
        ease: "easeOut",
        delay: delay
      }
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Only trigger animation once when element comes into view
        if (entry.isIntersecting && !isInView) {
          controls.start("visible");
          setIsInView(true);
        }
      },
      { threshold, rootMargin: "10px" }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [controls, threshold, isInView]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default ScrollRevealElement;
