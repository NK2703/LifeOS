import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchGoals, createGoal, updateGoal, deleteGoal } from '../features/goalSlice';
import { pageVariants, containerVariants, itemVariants } from '../animations/variants';
import GlassCard from '../components/GlassCard';
import Modal from '../components/Modal';
import ProgressRing from '../components/ProgressRing';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const emptyForm = { title: '', description: '', type: 'short_term', category: 'personal', target_date: '', progress: 0 };
const CATEGORIES = ['personal', 'career', 'health', 'education', 'finance', 'relationships', 'creative'];

export default function Goals() {
  const dispatch = useDispatch();
  const { items: goals, loading } = useSelector(s => s.goals);
  const [showModal, setShowModal] = useState(false);
  const [editGoal, setEditGoal] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [statusFilter, setStatusFilter] = useState('active');
  const [progressInput, setProgressInput] = useState('');
  const [progressGoal, setProgressGoal] = useState(null);

  useEffect(() => { dispatch(fetchGoals()); }, [dispatch]);

  const filtered = goals.filter(g =>
    statusFilter === 'all' ? true : g.status === statusFilter
  );

  const openCreate = () => { setEditGoal(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (g) => {
    setEditGoal(g);
    setForm({
      title: g.title, description: g.description || '',
      type: g.type, category: g.category || 'personal',
      target_date: g.target_date || '', progress: g.progress || 0,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const action = editGoal
      ? updateGoal({ id: editGoal._id || editGoal.id, data: form })
      : createGoal(form);
    const r = await dispatch(action);
    if ((editGoal ? updateGoal : createGoal).fulfilled.match(r)) {
      toast.success(editGoal ? 'Goal updated' : 'Goal created 🎯');
      setShowModal(false);
    }
  };

  const updateProgress = async () => {
    if (!progressGoal || progressInput === '') return;
    const val = Math.min(100, Math.max(0, parseFloat(progressInput)));
    const r = await dispatch(updateGoal({ id: progressGoal._id || progressGoal.id, data: { progress: val } }));
    if (updateGoal.fulfilled.match(r)) {
      toast.success(`Progress updated to ${val}%`);
      setProgressGoal(null); setProgressInput('');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this goal?')) return;
    await dispatch(deleteGoal(id));
    toast.success('Goal deleted');
  };

  const goalTypeColor = { short_term: '#6366f1', long_term: '#8b5cf6' };
  const categoryIcons = {
    personal: '👤', career: '💼', health: '💪', education: '📚',
    finance: '💰', relationships: '❤️', creative: '🎨',
  };

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Goal Tracking</h1>
          <p className="text-white/40 text-sm mt-1">
            {goals.filter(g => g.status === 'active').length} active · {goals.filter(g => g.status === 'completed').length} achieved
          </p>
        </div>
        <motion.button onClick={openCreate} className="btn-primary" whileHover={{ scale: 1.03 }}>
          + New Goal
        </motion.button>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {['all', 'active', 'completed', 'paused'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
              statusFilter === s ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'text-white/40 hover:text-white/70 border border-transparent'
            }`}>{s}</button>
        ))}
      </div>

      {/* Goals Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="skeleton h-48 rounded-2xl" />)}
        </div>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.length === 0 ? (
            <div className="col-span-3 text-center py-16 text-white/30">
              <div className="text-4xl mb-3">◎</div>
              <p>No goals yet. Set your first goal!</p>
            </div>
          ) : filtered.map(goal => {
            const progress = parseFloat(goal.progress || 0);
            const ringColor = progress >= 80 ? '#10b981' : progress >= 50 ? '#6366f1' : '#f59e0b';
            const daysLeft = goal.target_date
              ? Math.ceil((new Date(goal.target_date) - new Date()) / (1000 * 60 * 60 * 24))
              : null;

            return (
              <motion.div key={goal._id || goal.id} variants={itemVariants}>
                <GlassCard hover className="p-5 group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{categoryIcons[goal.category] || '◎'}</span>
                      <div>
                        <div className="text-xs text-white/30 uppercase tracking-wider">{goal.category}</div>
                        <div className="text-xs font-semibold px-2 py-0.5 rounded-full mt-0.5 inline-block"
                          style={{ background: `${goalTypeColor[goal.type]}20`, color: goalTypeColor[goal.type] }}>
                          {goal.type.replace('_', ' ')}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => openEdit(goal)} className="btn-ghost px-2 py-1 text-xs">✏</button>
                      <button onClick={() => handleDelete(goal._id || goal.id)} className="btn-danger px-2 py-1 text-xs">✕</button>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <ProgressRing value={progress} size={72} strokeWidth={6} color={ringColor} />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white leading-snug">{goal.title}</h3>
                      {goal.description && <p className="text-xs text-white/30 mt-1 line-clamp-2">{goal.description}</p>}
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="progress-bar">
                      <motion.div className="progress-fill" initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }} transition={{ duration: 1, delay: 0.3 }}
                        style={{ background: ringColor }} />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      {goal.target_date && (
                        <span className={`${daysLeft !== null && daysLeft < 7 ? 'text-red-400' : 'text-white/30'}`}>
                          {daysLeft !== null
                            ? daysLeft > 0 ? `${daysLeft}d left` : 'Overdue'
                            : format(new Date(goal.target_date), 'MMM d')}
                        </span>
                      )}
                      <button onClick={() => { setProgressGoal(goal); setProgressInput(goal.progress.toString()); }}
                        className="text-indigo-400 hover:text-indigo-300 ml-auto">
                        Update →
                      </button>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Create/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}
        title={editGoal ? 'Edit Goal' : 'Create New Goal'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-wider">Title *</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="input-glass" placeholder="Goal title" required />
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-wider">Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="input-glass resize-none" rows={2} placeholder="What does success look like?" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-wider">Type</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="input-glass">
                <option value="short_term" className="bg-dark-800">Short Term</option>
                <option value="long_term" className="bg-dark-800">Long Term</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-wider">Category</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="input-glass">
                {CATEGORIES.map(c => <option key={c} value={c} className="bg-dark-800">{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-wider">Target Date</label>
              <input type="date" value={form.target_date} onChange={e => setForm(f => ({ ...f, target_date: e.target.value }))} className="input-glass" />
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-wider">Initial Progress (%)</label>
              <input type="number" min="0" max="100" value={form.progress}
                onChange={e => setForm(f => ({ ...f, progress: e.target.value }))} className="input-glass" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="btn-ghost">Cancel</button>
            <button type="submit" className="btn-primary">{editGoal ? 'Update Goal' : 'Create Goal'}</button>
          </div>
        </form>
      </Modal>

      {/* Update Progress Modal */}
      <Modal isOpen={!!progressGoal} onClose={() => setProgressGoal(null)}
        title="Update Progress" size="sm">
        <div className="space-y-4">
          {progressGoal && (
            <div className="flex items-center gap-4">
              <ProgressRing value={parseFloat(progressInput) || 0} size={64} strokeWidth={5} color="#6366f1" />
              <div>
                <div className="font-semibold text-white">{progressGoal.title}</div>
                <div className="text-xs text-white/40 mt-1">Current: {Math.round(progressGoal.progress)}%</div>
              </div>
            </div>
          )}
          <div>
            <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-wider">New Progress (%)</label>
            <input type="range" min="0" max="100" value={progressInput}
              onChange={e => setProgressInput(e.target.value)}
              className="w-full accent-indigo-500" />
            <div className="text-center text-lg font-bold text-indigo-400 mt-1">{progressInput}%</div>
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setProgressGoal(null)} className="btn-ghost">Cancel</button>
            <button onClick={updateProgress} className="btn-primary">Save Progress</button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}
