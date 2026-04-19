import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { fetchRecords, fetchSummary, createRecord, deleteRecord } from '../features/financeSlice';
import { pageVariants, containerVariants, itemVariants } from '../animations/variants';
import GlassCard from '../components/GlassCard';
import Modal from '../components/Modal';
import StatWidget from '../components/StatWidget';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

const EXPENSE_CATEGORIES = ['Food', 'Transport', 'Entertainment', 'Education', 'Health', 'Shopping', 'Bills', 'Rent', 'Other'];
const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Investment', 'Business', 'Gift', 'Other'];

const emptyForm = {
  type: 'expense', amount: '', category: 'Food', description: '',
  date: new Date().toISOString().split('T')[0], recurring: false,
};

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#06b6d4'];

export default function Finance() {
  const dispatch = useDispatch();
  const { records, summary, monthlyTotals, loading } = useSelector(s => s.finance);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    dispatch(fetchRecords());
    dispatch(fetchSummary({}));
  }, [dispatch]);

  const filtered = records.filter(r => typeFilter === 'all' ? true : r.type === typeFilter);

  const totalIncome = summary?.filter(r => r.type === 'income').reduce((s, r) => s + parseFloat(r.total), 0) || 0;
  const totalExpense = summary?.filter(r => r.type === 'expense').reduce((s, r) => s + parseFloat(r.total), 0) || 0;
  const savings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.round((savings / totalIncome) * 100) : 0;

  // Expense by category for pie chart
  const expenseByCategory = {};
  summary?.filter(r => r.type === 'expense').forEach(r => {
    expenseByCategory[r.category] = (expenseByCategory[r.category] || 0) + parseFloat(r.total);
  });
  const pieData = Object.entries(expenseByCategory).map(([name, value]) => ({ name, value: Math.round(value) }));

  // Monthly bar chart data
  const barData = monthlyTotals?.map(m => ({
    month: m.month,
    income: parseFloat(m.income || 0),
    expense: parseFloat(m.expense || 0),
    savings: parseFloat(m.income || 0) - parseFloat(m.expense || 0),
  })) || [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    const r = await dispatch(createRecord(form));
    if (createRecord.fulfilled.match(r)) {
      toast.success(`${form.type === 'income' ? 'Income' : 'Expense'} added ✓`);
      setShowModal(false);
      setForm(emptyForm);
      dispatch(fetchSummary({}));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this record?')) return;
    await dispatch(deleteRecord(id));
    dispatch(fetchSummary({}));
    toast.success('Record deleted');
  };

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Finance Tracker</h1>
          <p className="text-white/40 text-sm mt-1">Monthly overview · {format(new Date(), 'MMMM yyyy')}</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">+ Add Record</button>
      </div>

      {/* Stats */}
      <motion.div variants={containerVariants} initial="hidden" animate="visible"
        className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div variants={itemVariants}>
          <StatWidget icon="↑" label="Income" value={`₹${totalIncome.toLocaleString()}`} color="#10b981" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatWidget icon="↓" label="Expenses" value={`₹${totalExpense.toLocaleString()}`} color="#ef4444" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatWidget icon="◆" label="Savings" value={`₹${savings.toLocaleString()}`}
            color={savings >= 0 ? '#10b981' : '#ef4444'} />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatWidget icon="%" label="Savings Rate" value={`${savingsRate}%`}
            color={savingsRate >= 20 ? '#10b981' : savingsRate >= 10 ? '#f59e0b' : '#ef4444'} />
        </motion.div>
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="lg:col-span-2 p-5">
          <h3 className="section-title mb-4">Monthly Trends</h3>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 11 }} />
                <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: 'rgba(13,17,23,0.95)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)' }} />
                <Bar dataKey="income" fill="#10b981" radius={[4,4,0,0]} name="Income" />
                <Bar dataKey="expense" fill="#ef4444" radius={[4,4,0,0]} name="Expense" />
                <Bar dataKey="savings" fill="#6366f1" radius={[4,4,0,0]} name="Savings" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-52 flex items-center justify-center text-white/30">Add finance records to see trends</div>
          )}
        </GlassCard>

        <GlassCard className="p-5">
          <h3 className="section-title mb-4">Expense Breakdown</h3>
          {pieData.length > 0 ? (
            <>
              <PieChart width={180} height={180} className="mx-auto">
                <Pie data={pieData} cx={85} cy={85} innerRadius={50} outerRadius={80}
                  paddingAngle={3} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'rgba(13,17,23,0.95)', borderRadius: 8 }} />
              </PieChart>
              <div className="space-y-1.5 mt-2">
                {pieData.slice(0, 4).map((d, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-white/60 truncate">{d.name}</span>
                    </div>
                    <span className="font-mono text-white/70">₹{d.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-48 flex items-center justify-center text-white/30 text-sm">No expenses this month</div>
          )}
        </GlassCard>
      </div>

      {/* Transactions */}
      <GlassCard className="p-5">
        <div className="section-header">
          <h3 className="section-title">Transactions</h3>
          <div className="flex gap-1">
            {['all', 'income', 'expense'].map(t => (
              <button key={t} onClick={() => setTypeFilter(t)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                  typeFilter === t ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'text-white/40 border border-transparent hover:text-white/60'
                }`}>{t}</button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="skeleton h-12 rounded-xl" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-8 text-white/30">No transactions. Add your first record!</div>
        ) : (
          <div className="space-y-2">
            {filtered.slice(0, 20).map(record => (
              <motion.div key={record._id || record.id}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all group">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
                  record.type === 'income' ? 'bg-emerald-500/20' : 'bg-red-500/20'
                }`}>
                  {record.type === 'income' ? '↑' : '↓'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">{record.description || record.category}</div>
                  <div className="text-xs text-white/30">{record.category} · {format(new Date(record.date), 'MMM d, yyyy')}</div>
                </div>
                <div className={`font-mono font-semibold text-sm ${record.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {record.type === 'income' ? '+' : '-'}₹{parseFloat(record.amount).toLocaleString()}
                </div>
                <button onClick={() => handleDelete(record._id || record.id)}
                  className="opacity-0 group-hover:opacity-100 btn-danger px-2 py-1 text-xs transition-all">✕</button>
              </motion.div>
            ))}
          </div>
        )}
      </GlassCard>

      {/* Add Record Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Finance Record">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {['income', 'expense'].map(t => (
              <button key={t} type="button"
                onClick={() => setForm(f => ({ ...f, type: t, category: t === 'income' ? 'Salary' : 'Food' }))}
                className={`py-2.5 rounded-xl text-sm font-semibold capitalize transition-all ${
                  form.type === t
                    ? t === 'income' ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300' : 'bg-red-500/20 border border-red-500/40 text-red-300'
                    : 'border border-white/10 text-white/40 hover:text-white/70'
                }`}>{t === 'income' ? '↑ Income' : '↓ Expense'}</button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-wider">Amount *</label>
              <input type="number" min="0" step="0.01" required value={form.amount}
                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                className="input-glass" placeholder="0.00" />
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-wider">Category</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="input-glass">
                {(form.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map(c => (
                  <option key={c} value={c} className="bg-dark-800">{c}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-wider">Description</label>
            <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="input-glass" placeholder="Optional note" />
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-wider">Date</label>
            <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="input-glass" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="btn-ghost">Cancel</button>
            <button type="submit" className="btn-primary">Add Record</button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
}
