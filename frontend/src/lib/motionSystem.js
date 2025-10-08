// motionSystem.js - Reusable Framer Motion variants and transitions
// Respects prefers-reduced-motion for accessibility

import { useReducedMotion } from "framer-motion";

export const useMotionSafe = () => {
  const shouldReduce = useReducedMotion();
  return { shouldReduce };
};

export const fadeInUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 8 },
};

export const modalSlide = {
  initial: { opacity: 0, y: 24, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 24, scale: 0.98 },
};

export const floatLoop = {
  animate: {
    y: [0, -6, 0],
    transition: { duration: 3, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" },
  },
};

export const buttonTap = { whileTap: { scale: 0.96 } };

export const shake = {
  animate: { x: [-8, 8, -6, 6, -3, 3, 0], transition: { duration: 0.7 } },
};

export const successDraw = {
  initial: { pathLength: 0 },
  animate: { pathLength: 1, transition: { duration: 0.6, ease: "easeOut" } },
};

export const floatParticle = {
  initial: { opacity: 0 },
  animate: { opacity: [0.2, 0.8, 0.2], transition: { duration: 4, repeat: Infinity } },
};

export const motionTimings = {
  short: { duration: 0.12 },
  medium: { duration: 0.3 },
  long: { duration: 0.6 },
};

// Container variants for stagger children
export const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

// Slide in from sides
export const slideInLeft = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

export const slideInRight = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

// Scale variants
export const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
};

// Pulse animation for recording indicators
export const pulse = {
  animate: {
    scale: [1, 1.1, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// Waveform bar animation
export const waveformBar = (delay = 0) => ({
  animate: {
    scaleY: [0.3, 1, 0.5, 0.8, 0.4],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      delay,
      ease: "easeInOut",
    },
  },
});

// Success checkmark draw
export const checkmarkDraw = {
  initial: { pathLength: 0, opacity: 0 },
  animate: {
    pathLength: 1,
    opacity: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

// Confetti particle
export const confettiParticle = (direction = 1) => ({
  initial: { opacity: 1, y: 0, x: 0, rotate: 0 },
  animate: {
    opacity: [1, 1, 0],
    y: [-10, -50, -100],
    x: [0, direction * 30, direction * 60],
    rotate: [0, direction * 180, direction * 360],
    transition: { duration: 1.5, ease: "easeOut" },
  },
});

// Progress bar fill
export const progressFill = {
  initial: { scaleX: 0 },
  animate: { scaleX: 1 },
  transition: { duration: 2, ease: "easeInOut" },
};
