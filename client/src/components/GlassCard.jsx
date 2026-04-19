import { motion } from 'framer-motion';

export default function GlassCard({
  children,
  className = '',
  hover = false,
  glow = null,
  onClick,
  animate = false,
}) {
  const glowStyle = glow ? {
    boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 30px ${glow}, inset 0 1px 0 rgba(255,255,255,0.08)`,
  } : {};

  return (
    <motion.div
      className={`glass-card ${hover ? 'glass-card-hover' : ''} ${className}`}
      style={glowStyle}
      onClick={onClick}
      whileHover={hover ? { y: -2 } : undefined}
      initial={animate ? { opacity: 0, y: 20 } : undefined}
      animate={animate ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}
