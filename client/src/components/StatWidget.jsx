import { motion } from 'framer-motion';

export default function StatWidget({ icon, label, value, sub, color = '#6366f1', trend, loading }) {
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
          style={{ background: `${color}20`, border: `1px solid ${color}30` }}
        >
          {icon}
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            trend > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
          }`}>
            {trend > 0 ? '▲' : '▼'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      {loading ? (
        <div className="space-y-2">
          <div className="skeleton h-7 w-20 rounded" />
          <div className="skeleton h-3 w-24 rounded" />
        </div>
      ) : (
        <div>
          <motion.div
            className="text-2xl font-display font-bold text-white"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 300 }}
            style={{ color }}
          >
            {value}
          </motion.div>
          <div className="text-sm font-medium text-white/60 mt-0.5">{label}</div>
          {sub && <div className="text-xs text-white/30 mt-1">{sub}</div>}
        </div>
      )}
    </div>
  );
}
