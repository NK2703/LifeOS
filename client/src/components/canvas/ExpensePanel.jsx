import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import {
  addExpenseAsync,
  deleteExpenseAsync,
} from '../../features/careerSlice';

const CATEGORIES = [
  'Course Fee',
  'Exam Fee',
  'Books & Materials',
  'Coaching',
  'Transport',
  'Software Tools',
  'Certification',
  'Miscellaneous',
];

const CAT_ICONS = {
  'Course Fee':        '📚',
  'Exam Fee':          '📝',
  'Books & Materials': '📖',
  'Coaching':          '👨‍🏫',
  'Transport':         '🚌',
  'Software Tools':    '💻',
  'Certification':     '🏅',
  'Miscellaneous':     '💰',
};

const CAT_COLORS = {
  'Course Fee':        '#6366f1',
  'Exam Fee':          '#f472b6',
  'Books & Materials': '#34d399',
  'Coaching':          '#fb923c',
  'Transport':         '#60a5fa',
  'Software Tools':    '#a78bfa',
  'Certification':     '#f59e0b',
  'Miscellaneous':     '#94a3b8',
};

export default function ExpensePanel({ visible }) {
  const dispatch = useDispatch();
  const { expenses, totalSpent, byCategory } = useSelector((s) => s.career);
  const [form, setForm] = useState({ category: 'Course Fee', amount: '', note: '' });
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.amount || Number(form.amount) <= 0) return;
    setAdding(true);
    await dispatch(
      addExpenseAsync({ ...form, amount: Number(form.amount) })
    );
    setForm({ category: 'Course Fee', amount: '', note: '' });
    setAdding(false);
  };

  const fmt = (n) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ x: 120, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 120, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 28 }}
          className="fixed bottom-6 right-5 z-40 w-80"
        >
          {/* Header toggle */}
          <button
            id="expense-panel-toggle"
            onClick={() => setOpen((p) => !p)}
            className="w-full flex items-center justify-between px-5 py-3.5 rounded-2xl text-sm font-semibold text-white btn-3d"
            style={{
              background: 'rgba(99,102,241,0.18)',
              border: '1px solid rgba(99,102,241,0.35)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}
          >
            <span className="flex items-center gap-2">
              <span>💳</span> Career Expenses
            </span>
            <span className="text-xs text-indigo-300 font-bold">{fmt(totalSpent)}</span>
          </button>

          {/* Expandable body */}
          <AnimatePresence>
            {open && (
              <motion.div
                key="expense-body"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden mt-2 rounded-2xl"
                style={{
                  background: 'rgba(9,11,26,0.85)',
                  border: '1px solid rgba(99,102,241,0.2)',
                  backdropFilter: 'blur(24px)',
                  WebkitBackdropFilter: 'blur(24px)',
                }}
              >
                <div className="p-4 space-y-4">
                  {/* Category breakdown bars */}
                  {byCategory.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs text-white/40 uppercase tracking-wider">By Category</p>
                      {byCategory.slice(0, 5).map((cat) => {
                        const pct = totalSpent > 0 ? (cat.total / totalSpent) * 100 : 0;
                        const color = CAT_COLORS[cat._id] || '#94a3b8';
                        return (
                          <div key={cat._id}>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-white/70">
                                {CAT_ICONS[cat._id] || '💰'} {cat._id}
                              </span>
                              <span style={{ color }}>{fmt(cat.total)}</span>
                            </div>
                            <div className="h-1 rounded-full bg-white/5">
                              <div
                                className="h-full rounded-full transition-all duration-700"
                                style={{ width: `${pct}%`, background: color }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Recent expenses */}
                  {expenses.slice(0, 4).length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-xs text-white/40 uppercase tracking-wider">Recent</p>
                      {expenses.slice(0, 4).map((exp) => (
                        <div
                          key={exp._id}
                          className="flex items-center justify-between py-1.5 px-2 rounded-xl"
                          style={{ background: 'rgba(255,255,255,0.04)' }}
                        >
                          <span className="text-xs text-white/70 flex items-center gap-1.5">
                            <span>{CAT_ICONS[exp.category] || '💰'}</span>
                            <span className="truncate max-w-[120px]">{exp.note || exp.category}</span>
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold" style={{ color: CAT_COLORS[exp.category] || '#94a3b8' }}>
                              {fmt(exp.amount)}
                            </span>
                            <button
                              onClick={() => dispatch(deleteExpenseAsync(exp._id))}
                              className="text-white/20 hover:text-red-400 text-xs transition-colors"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add expense form */}
                  <form onSubmit={handleAdd} className="space-y-2">
                    <p className="text-xs text-white/40 uppercase tracking-wider">Add Expense</p>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="input-glass text-xs w-full"
                      style={{ padding: '8px 12px' }}
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c} style={{ background: '#0f0c29' }}>{CAT_ICONS[c]} {c}</option>
                      ))}
                    </select>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="₹ Amount"
                        value={form.amount}
                        onChange={(e) => setForm({ ...form, amount: e.target.value })}
                        className="input-glass text-xs flex-1"
                        style={{ padding: '8px 12px' }}
                        min="1"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Note"
                        value={form.note}
                        onChange={(e) => setForm({ ...form, note: e.target.value })}
                        className="input-glass text-xs flex-1"
                        style={{ padding: '8px 12px' }}
                      />
                    </div>
                    <button
                      type="submit"
                      id="add-expense-btn"
                      disabled={adding}
                      className="btn-primary w-full text-xs py-2 btn-3d"
                    >
                      {adding ? 'Adding…' : '+ Add Expense'}
                    </button>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
