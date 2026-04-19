import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchTasks, createTask, updateTask, deleteTask, setFilter } from '../features/taskSlice';
import { pageVariants, containerVariants, itemVariants } from '../animations/variants';
import GlassCard from '../components/GlassCard';
import Modal from '../components/Modal';
import PriorityBadge from '../components/PriorityBadge';
import toast from 'react-hot-toast';
import { format, isPast } from 'date-fns';

const STATUSES = ['all', 'todo', 'in_progress', 'completed'];
const PRIORITIES = ['low', 'medium', 'high', 'critical'];

const emptyForm = { title: '', description: '', priority: 'medium', status: 'todo', deadline: '' };

export default function Tasks() {
  const dispatch = useDispatch();
  const { items: tasks, loading, activeFilter } = useSelector(s => s.tasks);
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');

  useEffect(() => { dispatch(fetchTasks()); }, [dispatch]);

  const filtered = tasks.filter(t => {
    if (activeFilter !== 'all' && t.status !== activeFilter) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const openCreate = () => { setEditTask(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (task) => {
    setEditTask(task);
    setForm({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      status: task.status,
      deadline: task.deadline ? task.deadline.split('T')[0] : '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title is required');
    const data = { ...form, deadline: form.deadline || null };
    if (editTask) {
      const r = await dispatch(updateTask({ id: editTask._id || editTask.id, data }));
      if (updateTask.fulfilled.match(r)) { toast.success('Task updated'); setShowModal(false); }
    } else {
      const r = await dispatch(createTask(data));
      if (createTask.fulfilled.match(r)) { toast.success('Task created 🎯'); setShowModal(false); }
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this task?')) return;
    await dispatch(deleteTask(id));
    toast.success('Task deleted');
  };

  const toggleComplete = (task) => {
    const newStatus = task.status === 'completed' ? 'todo' : 'completed';
    dispatch(updateTask({ id: task._id || task.id, data: { status: newStatus } }));
    if (newStatus === 'completed') toast.success('Task completed! +points ⭐');
  };

  const statusColors = { todo: '#6366f1', in_progress: '#f59e0b', completed: '#10b981', archived: '#6b7280' };

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Task Manager</h1>
          <p className="text-white/40 text-sm mt-1">{tasks.length} tasks · {tasks.filter(t => t.status === 'completed').length} completed</p>
        </div>
        <motion.button onClick={openCreate} className="btn-primary flex items-center gap-2"
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          + New Task
        </motion.button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search tasks…" className="input-glass max-w-xs" />
        <div className="flex gap-1">
          {STATUSES.map(s => (
            <button key={s} onClick={() => dispatch(setFilter(s))}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                activeFilter === s ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'text-white/40 hover:text-white/70 border border-transparent'
              }`}>
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="skeleton h-16 rounded-xl" />)}
        </div>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-2">
          <AnimatePresence>
            {filtered.length === 0 ? (
              <div className="text-center py-16 text-white/30">
                <div className="text-4xl mb-3">✓</div>
                <p>No tasks found. Create your first task!</p>
              </div>
            ) : filtered.map(task => {
              const isOverdue = task.deadline && isPast(new Date(task.deadline)) && task.status !== 'completed';
              return (
                <motion.div key={task._id || task.id} variants={itemVariants}
                  layout exit={{ opacity: 0, scale: 0.9, height: 0 }}
                  className="glass-card p-4 flex items-center gap-4 group cursor-pointer"
                  style={isOverdue ? { borderColor: 'rgba(239,68,68,0.3)' } : {}}>
                  {/* Complete toggle */}
                  <button
                    onClick={() => toggleComplete(task)}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      task.status === 'completed' ? 'bg-indigo-500 border-indigo-500' : 'border-white/30 hover:border-indigo-400'
                    }`}>
                    {task.status === 'completed' && <span className="text-white text-xs">✓</span>}
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-sm font-medium ${
                        task.status === 'completed' ? 'line-through text-white/30' : 'text-white'
                      }`}>{task.title}</span>
                      <PriorityBadge priority={task.priority} />
                      {isOverdue && <span className="badge-critical">Overdue</span>}
                    </div>
                    {task.description && (
                      <p className="text-xs text-white/30 mt-0.5 truncate">{task.description}</p>
                    )}
                  </div>

                  {/* Status + Deadline */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {task.deadline && (
                      <span className={`text-xs ${isOverdue ? 'text-red-400' : 'text-white/30'}`}>
                        📅 {format(new Date(task.deadline), 'MMM d')}
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-full text-xs capitalize"
                      style={{ background: `${statusColors[task.status]}20`, color: statusColors[task.status] }}>
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={() => openEdit(task)} className="btn-ghost px-2 py-1.5 text-xs">✏</button>
                    <button onClick={() => handleDelete(task._id || task.id)} className="btn-danger px-2 py-1.5 text-xs">✕</button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Create/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}
        title={editTask ? 'Edit Task' : 'Create New Task'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-wider">Title *</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="input-glass" placeholder="Task title" required />
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-wider">Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="input-glass resize-none" rows={2} placeholder="Optional description" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-wider">Priority</label>
              <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                className="input-glass">
                {PRIORITIES.map(p => <option key={p} value={p} className="bg-dark-800">{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-wider">Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                className="input-glass">
                {['todo', 'in_progress', 'completed', 'archived'].map(s => (
                  <option key={s} value={s} className="bg-dark-800">{s.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-wider">Deadline</label>
            <input type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
              className="input-glass" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="btn-ghost">Cancel</button>
            <button type="submit" className="btn-primary">{editTask ? 'Update' : 'Create Task'}</button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
}
