import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { fetchHistory, fetchTodayScore, calculateScore } from '../features/performanceSlice';
import { pageVariants, containerVariants, itemVariants } from '../animations/variants';
import GlassCard from '../components/GlassCard';
import ProgressRing from '../components/ProgressRing';
import toast from 'react-hot-toast';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadialBarChart, RadialBar,
} from 'recharts';
import { format } from 'date-fns';

const SCORE_COLORS = {
  S: '#FFD700', A: '#00D4AA', B: '#4FACFE', C: '#F7971E', D: '#FF6B6B', F: '#FF0000'
};

const getGrade = (score) => {
  if (score >= 90) return { grade: 'S', label: 'Exceptional', color: '#FFD700' };
  if (score >= 75) return { grade: 'A', label: 'Excellent', color: '#00D4AA' };
  if (score >= 60) return { grade: 'B', label: 'Good', color: '#4FACFE' };
  if (score >= 45) return { grade: 'C', label: 'Average', color: '#F7971E' };
  if (score >= 30) return { grade: 'D', label: 'Below Average', color: '#FF6B6B' };
  return { grade: 'F', label: 'Poor', color: '#FF0000' };
};

export default function Performance() {
  const dispatch = useDispatch();
  const { today, history, streak, grade, loading } = useSelector(s => s.performance);

  useEffect(() => {
    dispatch(fetchTodayScore());
    dispatch(fetchHistory({ days: 30 }));
  }, [dispatch]);

  const handleRecalculate = async () => {
    const r = await dispatch(calculateScore());
    if (calculateScore.fulfilled.match(r)) {
      toast.success('Score recalculated!');
    }
  };

  const scoreValue = Math.round(today?.total_score || 0);
  const gradeInfo = grade || getGrade(scoreValue);
  const gradeColor = gradeInfo.color || '#6366f1';

  const breakdown = typeof today?.breakdown === 'string'
    ? JSON.parse(today.breakdown || '{}')
    : today?.breakdown || {};

  const chartData = history.map(h => ({
    date: format(new Date(h.date), 'MMM d'),
    score: Math.round(h.total_score),
    tasks: Math.round(h.tasks_score),
    goals: Math.round(h.goals_score),
    study: Math.round(h.study_score),
  }));

  const radialData = [
    { name: 'Tasks', value: Math.round(today?.tasks_score || 0), fill: '#6366f1', max: 40 },
    { name: 'Goals', value: Math.round(today?.goals_score || 0), fill: '#8b5cf6', max: 25 },
    { name: 'Study', value: Math.round(today?.study_score || 0), fill: '#10b981', max: 25 },
    { name: 'Finance', value: Math.round(today?.finance_score || 0), fill: '#f59e0b', max: 10 },
  ];

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Performance Score</h1>
          <p className="text-white/40 text-sm mt-1">Track your daily productivity & habits</p>
        </div>
        <motion.button onClick={handleRecalculate} disabled={loading}
          className="btn-primary flex items-center gap-2" whileHover={{ scale: 1.03 }}>
          {loading ? '◎ Calculating...' : '↺ Recalculate Score'}
        </motion.button>
      </div>

      {/* Score Hero */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="p-6 flex flex-col items-center justify-center text-center md:col-span-1"
          style={{ borderColor: `${gradeColor}30`, boxShadow: `0 0 40px ${gradeColor}15` }}>
          <motion.div
            className="text-7xl font-display font-black mb-2"
            style={{ color: gradeColor, textShadow: `0 0 30px ${gradeColor}50` }}
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}>
            {gradeInfo.grade}
          </motion.div>
          <motion.div className="text-4xl font-bold text-white/80 mb-1"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            {scoreValue}/100
          </motion.div>
          <div className="text-white/40 text-sm mb-4">{gradeInfo.label}</div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-2xl">🔥</span>
            <span className="font-bold text-white">{streak}</span>
            <span className="text-white/40">day streak</span>
          </div>
        </GlassCard>

        {/* Score Breakdown */}
        <GlassCard className="p-5 md:col-span-2">
          <h3 className="section-title mb-4">Score Breakdown</h3>
          <div className="grid grid-cols-2 gap-4">
            {radialData.map((item, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3 p-3 rounded-xl"
                style={{ background: `${item.fill}10`, border: `1px solid ${item.fill}20` }}>
                <ProgressRing value={(item.value / item.max) * 100} size={56} strokeWidth={5}
                  color={item.fill} bgColor="rgba(255,255,255,0.05)" />
                <div>
                  <div className="text-lg font-bold" style={{ color: item.fill }}>{item.value}</div>
                  <div className="text-xs text-white/50">{item.name}</div>
                  <div className="text-xs text-white/30">max {item.max}</div>
                </div>
              </motion.div>
            ))}
          </div>
          {breakdown.penalties && breakdown.penalties.total > 0 && (
            <div className="mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
              <div className="text-xs text-red-400 font-semibold">
                Penalties: -{breakdown.penalties.total} pts
                {breakdown.penalties.missedDeadlines > 0 && ` (${breakdown.penalties.missedDeadlines} overdue tasks)`}
              </div>
            </div>
          )}
        </GlassCard>
      </div>

      {/* Score History Chart */}
      <GlassCard className="p-5">
        <h3 className="section-title mb-4">30-Day Score History</h3>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <defs>
                <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: 'rgba(13,17,23,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
                formatter={(value, name) => [`${value} pts`, name]}
              />
              <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2.5}
                dot={{ fill: '#6366f1', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: '#8b5cf6' }} name="Total Score" />
              <Line type="monotone" dataKey="tasks" stroke="#10b981" strokeWidth={1.5}
                strokeDasharray="4 4" dot={false} name="Tasks" />
              <Line type="monotone" dataKey="study" stroke="#f59e0b" strokeWidth={1.5}
                strokeDasharray="4 4" dot={false} name="Study" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-52 flex items-center justify-center text-white/30">
            No performance history yet. Click "Recalculate Score" to start.
          </div>
        )}
      </GlassCard>

      {/* Recent History Table */}
      <GlassCard className="p-5">
        <h3 className="section-title mb-4">Recent Scores</h3>
        {history.length === 0 ? (
          <div className="text-center py-8 text-white/30">No data yet</div>
        ) : (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-1">
            {history.slice().reverse().slice(0, 10).map((h, i) => {
              const g = getGrade(h.total_score);
              return (
                <motion.div key={i} variants={itemVariants}
                  className="flex items-center gap-4 px-3 py-2 rounded-xl hover:bg-white/5 transition-all">
                  <span className="text-sm font-bold w-6 text-center" style={{ color: g.color }}>{g.grade}</span>
                  <div className="flex-1">
                    <div className="text-sm text-white/70">{format(new Date(h.date), 'EEEE, MMMM d')}</div>
                  </div>
                  <div className="flex gap-4 text-xs text-white/40">
                    <span>T:{Math.round(h.tasks_score)}</span>
                    <span>G:{Math.round(h.goals_score)}</span>
                    <span>S:{Math.round(h.study_score)}</span>
                    <span>F:{Math.round(h.finance_score)}</span>
                  </div>
                  <div className="text-sm font-bold" style={{ color: g.color }}>
                    {Math.round(h.total_score)}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </GlassCard>
    </motion.div>
  );
}
