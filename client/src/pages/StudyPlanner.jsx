import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { fetchPlans, fetchStudyStats, createPlan, updatePlan, deletePlan } from '../features/studySlice';
import { pageVariants, containerVariants, itemVariants } from '../animations/variants';
import GlassCard from '../components/GlassCard';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import { format, addDays, startOfWeek } from 'date-fns';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts';

const emptyForm = {
  subject: '', topic: '', scheduled_date: new Date().toISOString().split('T')[0],
  start_time: '', duration_minutes: 60, notes: '', priority: 'medium',
};

const SUBJECT_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#06b6d4'];

export default function StudyPlanner() {
  const dispatch = useDispatch();
  const { plans, stats, loading } = useSelector(s => s.study);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editPlan, setEditPlan] = useState(null);
  const [weekOffset, setWeekOffset] = useState(0);

  useEffect(() => {
    dispatch(fetchPlans());
    dispatch(fetchStudyStats());
  }, [dispatch]);

  const weekStart = addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), weekOffset * 7);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getPlansForDay = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return plans.filter(p => {
      const pDate = p.scheduled_date?.split('T')[0] || p.scheduled_date;
      return pDate === dateStr;
    });
  };

  const totalHoursThisWeek = stats.reduce((s, st) => s + (parseFloat(st.total_minutes) || 0) / 60, 0);

  const radarData = stats.map(s => ({
    subject: s.subject,
    sessions: parseInt(s.completed_sessions) || 0,
    fullMark: 10,
  }));

  const openCreate = (date = null) => {
    setEditPlan(null);
    setForm({ ...emptyForm, scheduled_date: date ? format(date, 'yyyy-MM-dd') : emptyForm.scheduled_date });
    setShowModal(true);
  };

  const openEdit = (plan) => {
    setEditPlan(plan);
    setForm({
      subject: plan.subject, topic: plan.topic,
      scheduled_date: plan.scheduled_date?.split('T')[0] || plan.scheduled_date,
      start_time: plan.start_time || '', duration_minutes: plan.duration_minutes,
      notes: plan.notes || '', priority: plan.priority,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const action = editPlan
      ? updatePlan({ id: editPlan._id || editPlan.id, data: form })
      : createPlan(form);
    const r = await dispatch(action);
    if ((editPlan ? updatePlan : createPlan).fulfilled.match(r)) {
      toast.success(editPlan ? 'Session updated' : 'Study session scheduled 📚');
      setShowModal(false);
      dispatch(fetchStudyStats());
    }
  };

  const toggleComplete = async (plan) => {
    const r = await dispatch(updatePlan({ id: plan._id || plan.id, data: { completed: !plan.completed } }));
    if (updatePlan.fulfilled.match(r)) {
      toast.success(plan.completed ? 'Marked incomplete' : 'Session completed! 🎉');
    }
  };

  const subjectColorMap = {};
  const uniqueSubjects = [...new Set(plans.map(p => p.subject))];
  uniqueSubjects.forEach((s, i) => { subjectColorMap[s] = SUBJECT_COLORS[i % SUBJECT_COLORS.length]; });

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Study Planner</h1>
          <p className="text-white/40 text-sm mt-1">
            {Math.round(totalHoursThisWeek * 10) / 10}h studied this week · {stats.length} subjects
          </p>
        </div>
        <button onClick={() => openCreate()} className="btn-primary">+ Add Session</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar View */}
        <GlassCard className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">Week Calendar</h3>
            <div className="flex items-center gap-2">
              <button onClick={() => setWeekOffset(w => w - 1)} className="btn-ghost px-2 py-1.5 text-xs">←</button>
              <span className="text-xs text-white/40">
                {format(weekStart, 'MMM d')} – {format(addDays(weekStart, 6), 'MMM d, yyyy')}
              </span>
              <button onClick={() => setWeekOffset(w => w + 1)} className="btn-ghost px-2 py-1.5 text-xs">→</button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day, i) => {
              const dayPlans = getPlansForDay(day);
              const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
              return (
                <div key={i} className="min-h-32">
                  <div className={`text-center py-1.5 rounded-lg mb-2 text-xs font-medium ${
                    isToday ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'text-white/40'
                  }`}>
                    <div>{format(day, 'EEE')}</div>
                    <div className="text-sm font-bold">{format(day, 'd')}</div>
                  </div>
                  <div className="space-y-1">
                    {dayPlans.map(plan => (
                      <motion.div key={plan._id || plan.id}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => openEdit(plan)}
                        className="p-1.5 rounded-lg text-xs cursor-pointer transition-all"
                        style={{
                          background: `${subjectColorMap[plan.subject] || '#6366f1'}20`,
                          borderLeft: `2px solid ${subjectColorMap[plan.subject] || '#6366f1'}`,
                          opacity: plan.completed ? 0.5 : 1,
                          textDecoration: plan.completed ? 'line-through' : 'none',
                        }}>
                        <div className="font-medium text-white/80 truncate">{plan.subject}</div>
                        <div className="text-white/40 truncate">{plan.duration_minutes}m</div>
                      </motion.div>
                    ))}
                    <button onClick={() => openCreate(day)}
                      className="w-full text-center text-white/20 hover:text-white/50 text-xs py-1 rounded hover:bg-white/5 transition-all">
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>

        {/* Subject Radar */}
        <GlassCard className="p-5">
          <h3 className="section-title mb-4">Subject Balance</h3>
          {radarData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.08)" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.5)' }} />
                <Radar name="Sessions" dataKey="sessions" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-white/30 text-sm">Add study sessions</div>
          )}
          <div className="mt-4 space-y-2">
            {stats.map((s, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: SUBJECT_COLORS[i % SUBJECT_COLORS.length] }} />
                  <span className="text-white/60">{s.subject}</span>
                </div>
                <span className="text-white/40 font-mono">
                  {Math.round(parseFloat(s.total_minutes || 0) / 60 * 10) / 10}h / {s.sessions} sessions
                </span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Sessions List */}
      <GlassCard className="p-5">
        <h3 className="section-title mb-4">Upcoming Sessions</h3>
        {plans.filter(p => !p.completed).length === 0 ? (
          <div className="text-center py-8 text-white/30">No pending sessions</div>
        ) : (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-2">
            {plans.filter(p => !p.completed).slice(0, 10).map(plan => (
              <motion.div key={plan._id || plan.id} variants={itemVariants}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-all group">
                <button onClick={() => toggleComplete(plan)}
                  className="w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 border-white/20 hover:border-indigo-400 transition-all" />
                <div className="w-2 h-8 rounded-full flex-shrink-0"
                  style={{ backgroundColor: subjectColorMap[plan.subject] || '#6366f1' }} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white">{plan.subject} — <span className="text-white/60">{plan.topic}</span></div>
                  <div className="text-xs text-white/30">
                    {format(new Date(plan.scheduled_date), 'EEE, MMM d')}
                    {plan.start_time && ` at ${plan.start_time}`}
                    · {plan.duration_minutes}min
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  <button onClick={() => openEdit(plan)} className="btn-ghost px-2 py-1 text-xs">✏</button>
                  <button onClick={async () => {
                    await dispatch(deletePlan(plan._id || plan.id));
                    toast.success('Session removed');
                  }} className="btn-danger px-2 py-1 text-xs">✕</button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </GlassCard>

      {/* Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}
        title={editPlan ? 'Edit Study Session' : 'Add Study Session'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-wider">Subject *</label>
              <input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                className="input-glass" placeholder="e.g. Mathematics" required />
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-wider">Topic *</label>
              <input value={form.topic} onChange={e => setForm(f => ({ ...f, topic: e.target.value }))}
                className="input-glass" placeholder="e.g. Integration" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-wider">Date *</label>
              <input type="date" value={form.scheduled_date}
                onChange={e => setForm(f => ({ ...f, scheduled_date: e.target.value }))} className="input-glass" required />
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-wider">Start Time</label>
              <input type="time" value={form.start_time}
                onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))} className="input-glass" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-wider">Duration (min)</label>
              <input type="number" min="15" max="480" value={form.duration_minutes}
                onChange={e => setForm(f => ({ ...f, duration_minutes: parseInt(e.target.value) }))} className="input-glass" />
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-wider">Priority</label>
              <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} className="input-glass">
                <option value="low" className="bg-dark-800">Low</option>
                <option value="medium" className="bg-dark-800">Medium</option>
                <option value="high" className="bg-dark-800">High</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-wider">Notes</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              className="input-glass resize-none" rows={2} placeholder="Study notes or resources" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="btn-ghost">Cancel</button>
            <button type="submit" className="btn-primary">{editPlan ? 'Update' : 'Schedule Session'}</button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
}
