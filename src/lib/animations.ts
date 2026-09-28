import { Variants } from 'framer-motion';

/**
 * Animation timing constants (in milliseconds)
 */
export const animationTimings = {
  fast: 200,      // Button hovers, quick transitions
  normal: 300,    // Card hovers, standard transitions
  slow: 600,      // Fade-ins, slide-ups
  verySlow: 1000, // Hero animations, complex sequences
  counter: 2000,  // KPI counter animations
} as const;

/**
 * Easing functions for animations
 */
export const easings = {
  smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  linear: 'linear',
} as const;

/**
 * Reusable Framer Motion animation variants
 */

// Fade in animation
export const fadeInVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: animationTimings.slow / 1000,
      ease: easings.smooth,
    },
  },
};

// Slide up animation
export const slideUpVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: animationTimings.slow / 1000,
      ease: easings.smooth,
    },
  },
};

// Slide in from left
export const slideInLeftVariants: Variants = {
  hidden: { opacity: 0, x: -50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.8,
      ease: easings.smooth,
    },
  },
};

// Slide in from right
export const slideInRightVariants: Variants = {
  hidden: { opacity: 0, x: 50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.8,
      ease: easings.smooth,
    },
  },
};

// Scale in animation
export const scaleInVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: animationTimings.slow / 1000,
      ease: easings.smooth,
    },
  },
};

// Stagger children animation
export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

// Card hover animation
export const cardHoverVariants: Variants = {
  rest: {
    scale: 1,
    y: 0,
  },
  hover: {
    scale: 1.02,
    y: -8,
    transition: {
      duration: animationTimings.normal / 1000,
      ease: easings.smooth,
    },
  },
};

// Floating animation (for dashboard preview)
export const floatingVariants: Variants = {
  animate: {
    y: [-10, 10, -10],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// Orbit glow animation
export const orbitGlowVariants: Variants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 8,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

/**
 * Helper function to create staggered animation delays
 * @param index - Index of the item in the list
 * @param baseDelay - Base delay in milliseconds
 * @returns Delay in seconds
 */
export const getStaggerDelay = (index: number, baseDelay: number = 100): number => {
  return (index * baseDelay) / 1000;
};

/**
 * Helper function to check if animations should be reduced
 * @param reducedMotion - Boolean from useReducedMotion hook
 * @returns Animation configuration object
 */
export const getAnimationConfig = (reducedMotion: boolean) => {
  if (reducedMotion) {
    return {
      initial: { opacity: 1 },
      animate: { opacity: 1 },
      transition: { duration: 0 },
    };
  }
  return {};
};
