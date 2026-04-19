// Framer Motion animation variants for consistent, premium transitions across LifeOS

// Page-level transitions
export const pageVariants = {
  initial: { opacity: 0, y: 20, scale: 0.98 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] }
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.98,
    transition: { duration: 0.25 }
  },
};

// Stagger children (for lists/cards)
export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

export const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] },
  },
};

// Card hover (used with whileHover)
export const cardHover = {
  scale: 1.02,
  transition: { duration: 0.2, ease: 'easeOut' },
};

// Modal
export const modalVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: { duration: 0.2 },
  },
};

// Overlay backdrop
export const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

// Sidebar item
export const sidebarItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.07, duration: 0.3 },
  }),
};

// Number counter animation
export const numberVariants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 300, damping: 20 },
  },
};

// Floating badge/notification
export const floatVariants = {
  animate: {
    y: [0, -8, 0],
    transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
  },
};

// Shimmer/shine effect
export const shineVariants = {
  animate: {
    x: ['-200%', '200%'],
    transition: { duration: 3, repeat: Infinity, ease: 'linear' },
  },
};

// Score gauge animation
export const gaugeVariants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: (progress) => ({
    pathLength: progress,
    opacity: 1,
    transition: { duration: 1.5, ease: [0.4, 0, 0.2, 1], delay: 0.3 },
  }),
};

// Slide from right (notifications panel)
export const slideFromRight = {
  hidden: { x: '100%', opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 300, damping: 30 },
  },
  exit: {
    x: '100%',
    opacity: 0,
    transition: { duration: 0.25 },
  },
};
