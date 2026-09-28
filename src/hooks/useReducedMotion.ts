import { useState, useEffect } from 'react';

/**
 * Custom hook to detect user's reduced motion preference
 * Respects prefers-reduced-motion media query for accessibility
 * @returns boolean indicating if reduced motion is preferred
 */
export const useReducedMotion = (): boolean => {
  const [reducedMotion, setReducedMotion] = useState(false);
  
  useEffect(() => {
    // Check if matchMedia is supported
    if (typeof window === 'undefined' || !window.matchMedia) {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    // Set initial value
    setReducedMotion(mediaQuery.matches);
    
    // Create handler for changes
    const handler = (event: MediaQueryListEvent) => {
      setReducedMotion(event.matches);
    };
    
    // Add event listener
    mediaQuery.addEventListener('change', handler);
    
    // Cleanup
    return () => {
      mediaQuery.removeEventListener('change', handler);
    };
  }, []);
  
  return reducedMotion;
};
