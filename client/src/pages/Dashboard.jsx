import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { fetchTasks, fetchTaskStats } from '../features/taskSlice';
import { fetchGoals, fetchGoalStats } from '../features/goalSlice';
import { fetchTodayScore, calculateScore } from '../features/performanceSlice';
import { fetchSummary } from '../features/financeSlice';
import { setRecommendations, setRecommendationsLoading } from '../features/uiSlice';
import { aiService } from '../services';
import StatWidget from '../components/StatWidget';
import GlassCard from '../components/GlassCard';
import ProgressRing from '../components/ProgressRing';
import PriorityBadge from '../components/PriorityBadge';
import { containerVariants, itemVariants, pageVariants } from '../animations/variants';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { format, subDays } from 'date-fns';

const SCORE_COLORS = {
  S: '#FFD700', A: '#00D4AA', B: '#4FACFE', C: '#F7971E', D: '#FF6B6B', F: '#FF0000'
};

export default function Dashboard() {
  const dispatch = useDispatch();
  const { user } = useSelector(s => s.auth);
  const { items: tasks, stats: taskStats, loading: tasksLoading } = useSelector(s => s.tasks);
  const { items: goals } = useSelector(s => s.goals);
  const { today: todayScore, grade, history, streak } = useSelector(s => s.performance);
  const { summary: financeSummary, monthlyTotals } = useSelector(s => s.finance);
  const { recommendations } = useSelector(s => s.ui);

  useEffect(() => {
    dispatch(fetchTasks());
    dispatch(fetchTaskStats());
    dispatch(fetchGoals());
    dispatch(fetchGoalStats());
    dispatch(fetchTodayScore());
    dispatch(fetchSummary({}));
    dispatch(calculateScore());

    // Load AI recommendations
    dispatch(setRecommendationsLoading(true));
    aiService.getRecommendations()
      .then(res => dispatch(setRecommendations(res.data.data.recommendations)))
      .catch(() => dispatch(setRecommendationsLoading(false)));
  }, [dispatch]);

  const pendingTasks = tasks.filter(t => t.status !== 'completed' && t.status !== 'archived');
  const completedToday = tasks.filter(t =>
    t.completed_at && new Date(t.completed_at).toDateString() === new Date().toDateString()
  );
  const activeGoals = goals.filter(g => g.status === 'active');
  const avgGoalProgress = activeGoals.length > 0
    ? activeGoals.reduce((s, g) => s + parseFloat(g.progress || 0), 0) / activeGoals.length
    : 0;

  // Finance summary numbers
  const currentMonthIncome = financeSummary
    ?.filter(r => r.type === 'income')
    .reduce((s, r) => s + parseFloat(r.total), 0) || 0;
  const currentMonthExpense = financeSummary
    ?.filter(r => r.type === 'expense')
    .reduce((s, r) => s + parseFloat(r.total), 0) || 0;

  // Chart data
  const chartData = monthlyTotals?.map(m => ({
    name: m.month,
    income: parseFloat(m.income),
    expense: parseFloat(m.expense),
  })) || [];

  const scoreValue = Math.round(todayScore?.total_score || 0);
  const gradeLabel = grade?.grade || '—';
  const gradeColor = SCORE_COLORS[gradeLabel] || '#6366f1';

  const priorityData = [
    { name: 'Critical', value: pendingTasks.filter(t => t.priority === 'critical').length, color: '#ef4444' },
    { name: 'High', value: pendingTasks.filter(t => t.priority === 'high').length, color: '#f59e0b' },
    { name: 'Medium', value: pendingTasks.filter(t => t.priority === 'medium').length, color: '#3b82f6' },
    { name: 'Low', value: pendingTasks.filter(t => t.priority === 'low').length, color: 'rgba(255,255,255,0.2)' },
  ].filter(d => d.value > 0);

  return (
    <motion.div
      variants={pageVariants} initial="initial" animate="animate" exit="exit"
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <motion.h1
            className="text-2xl font-display font-bold text-white"
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
          >
            Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'},{' '}
            <span className="gradient-text">{user?.name?.split(' ')[0] || 'there'}</span> 👋
          </motion.h1>
          <p className="text-white/40 text-sm mt-1">
            {format(new Date(), 'EEEE, MMMM d, yyyy')} · {streak > 0 ? `🔥 ${streak} day streak` : 'Start your streak today'}
          </p>
        </div>
        {/* Performance Score Hero */}
        <motion.div
          className="glass-card px-6 py-4 flex items-center gap-4"
          initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          style={{ borderColor: `${gradeColor}40`, boxShadow: `0 0 30px ${gradeColor}20` }}
        >
          <div className="text-center">
            <motion.div
              className="text-4xl font-display font-black"
              style={{ color: gradeColor }}
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, delay: 0.3 }}
            >
              {scoreValue}
            </motion.div>
            <div className="text-xs text-white/40 mt-0.5">Today's Score</div>
          </div>
          <div className="border-l border-white/10 pl-4">
            <div className="text-2xl font-bold" style={{ color: gradeColor, textShadow: `0 0 20px ${gradeColor}60` }}>
              {gradeLabel}
            </div>
            <div className="text-xs text-white/40">{grade?.label || 'No data'}</div>
          </div>
        </motion.div>
      </div>

      {/* Stats Row */}
      <motion.div variants={containerVariants} initial="hidden" animate="visible"
        className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div variants={itemVariants}>
          <StatWidget icon="✓" label="Tasks Pending" value={pendingTasks.length}
            sub={`${completedToday.length} done today`} color="#6366f1" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatWidget icon="◎" label="Active Goals" value={activeGoals.length}
            sub={`${Math.round(avgGoalProgress)}% avg progress`} color="#8b5cf6" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatWidget icon="◆" label="Monthly Income"
            value={`₹${currentMonthIncome.toLocaleString()}`}
            sub={`₹${currentMonthExpense.toLocaleString()} spent`} color="#10b981" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatWidget icon="🔥" label="Day Streak" value={streak}
            sub="consecutive days" color="#f59e0b" />
        </motion.div>
      </motion.div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Finance Chart */}
        <GlassCard className="lg:col-span-2 p-5">
          <div className="section-header">
            <h3 className="section-title">Income vs Expense</h3>
            <span className="text-xs text-white/30">Last 6 months</span>
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f64f59" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#f64f59" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 11 }} />
                <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: 'rgba(13,17,23,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} />
                <Area type="monotone" dataKey="income" stroke="#10b981" fill="url(#incomeGrad)" strokeWidth={2} name="Income" />
                <Area type="monotone" dataKey="expense" stroke="#f64f59" fill="url(#expenseGrad)" strokeWidth={2} name="Expense" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-52 flex items-center justify-center text-white/30">
              Add finance records to see trends
            </div>
          )}
        </GlassCard>

        {/* Task Priority Breakdown */}
        <GlassCard className="p-5">
          <div className="section-header">
            <h3 className="section-title">Task Priority</h3>
          </div>
          {priorityData.length > 0 ? (
            <>
              <div className="flex justify-center">
                <PieChart width={160} height={160}>
                  <Pie data={priorityData} cx={75} cy={75} innerRadius={45} outerRadius={75}
                    paddingAngle={3} dataKey="value">
                    {priorityData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'rgba(13,17,23,0.95)', borderRadius: 8 }} />
                </PieChart>
              </div>
              <div className="space-y-2 mt-2">
                {priorityData.map((d, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                      <span className="text-white/60">{d.name}</span>
                    </div>
                    <span className="font-mono text-white/80">{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-40 flex items-center justify-center text-white/30 text-sm">No pending tasks</div>
          )}
        </GlassCard>
      </div>

      {/* Goals + Recommendations row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Goals Progress */}
        <GlassCard className="p-5">
          <div className="section-header">
            <h3 className="section-title">Active Goals</h3>
            <a href="/goals" className="text-indigo-400 text-sm hover:text-indigo-300">View all →</a>
          </div>
          {activeGoals.length > 0 ? (
            <div className="grid grid-cols-3 gap-4">
              {activeGoals.slice(0, 6).map(goal => (
                <ProgressRing key={goal.id}
                  value={parseFloat(goal.progress || 0)}
                  size={72} strokeWidth={5}
                  color={parseFloat(goal.progress) >= 70 ? '#10b981' : parseFloat(goal.progress) >= 40 ? '#6366f1' : '#f59e0b'}
                  label={goal.title.length > 12 ? goal.title.substring(0, 12) + '…' : goal.title}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-white/30">No active goals. Create one!</div>
          )}
        </GlassCard>

        {/* AI Recommendations */}
        <GlassCard className="p-5">
          <div className="section-header">
            <h3 className="section-title">🤖 AI Insights</h3>
          </div>
          {recommendations.length > 0 ? (
            <div className="space-y-3">
              {recommendations.slice(0, 3).map((rec, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-3 p-3 rounded-xl transition-all hover:bg-white/5"
                  style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                  <span className="text-2xl flex-shrink-0">{rec.icon}</span>
                  <div>
                    <div className="text-sm font-semibold text-white">{rec.title}</div>
                    <div className="text-xs text-white/40 mt-0.5 leading-relaxed">{rec.message}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-white/30 text-sm">Add data to get AI recommendations</div>
          )}
        </GlassCard>
      </div>

      {/* Recent Tasks */}
      <GlassCard className="p-5">
        <div className="section-header">
          <h3 className="section-title">Recent Tasks</h3>
          <a href="/tasks" className="text-indigo-400 text-sm hover:text-indigo-300">View all →</a>
        </div>
        {tasks.length > 0 ? (
          <div className="space-y-2">
            {tasks.slice(0, 5).map(task => (
              <div key={task.id}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all">
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  task.status === 'completed'
                    ? 'bg-indigo-500 border-indigo-500'
                    : 'border-white/20'
                }`}>
                  {task.status === 'completed' && <span className="text-white text-xs">✓</span>}
                </div>
                <span className={`text-sm flex-1 ${task.status === 'completed' ? 'line-through text-white/30' : 'text-white/80'}`}>
                  {task.title}
                </span>
                <PriorityBadge priority={task.priority} />
                {task.deadline && (
                  <span className="text-xs text-white/30">
                    {format(new Date(task.deadline), 'MMM d')}
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-white/30 text-sm">No tasks yet. Create your first task!</div>
        )}
      </GlassCard>
    </motion.div>
  );
}
