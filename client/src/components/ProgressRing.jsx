import { motion } from 'framer-motion';

export default function ProgressRing({
  value = 0,
  size = 80,
  strokeWidth = 6,
  color = '#6366f1',
  bgColor = 'rgba(255,255,255,0.08)',
  label,
  sublabel,
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(value, 100) / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {/* Background track */}
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke={bgColor} strokeWidth={strokeWidth}
          />
          {/* Progress arc */}
          <motion.circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: [0.4, 0, 0.2, 1], delay: 0.2 }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-sm font-bold font-mono" style={{ color }}>
            {Math.round(value)}%
          </span>
        </div>
      </div>
      {label && <div className="text-xs font-medium text-white/70 text-center">{label}</div>}
      {sublabel && <div className="text-xs text-white/30 text-center">{sublabel}</div>}
    </div>
  );
}
