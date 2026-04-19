import { motion } from 'framer-motion';

const PRIORITY_CONFIG = {
  critical: { label: 'Critical', class: 'badge-critical', dot: '#ef4444' },
  high: { label: 'High', class: 'badge-high', dot: '#f59e0b' },
  medium: { label: 'Medium', class: 'badge-medium', dot: '#3b82f6' },
  low: { label: 'Low', class: 'badge-low', dot: 'rgba(255,255,255,0.3)' },
};

export default function PriorityBadge({ priority, showDot = true }) {
  const config = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.medium;
  return (
    <span className={config.class}>
      {showDot && (
        <span className="inline-block w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: config.dot }} />
      )}
      {config.label}
    </span>
  );
}
