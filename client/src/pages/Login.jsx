import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { loginUser, clearError } from '../features/authSlice';
import toast from 'react-hot-toast';

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector(s => s.auth);
  const [form, setForm] = useState({ email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    const result = await dispatch(loginUser(form));
    if (loginUser.fulfilled.match(result)) {
      toast.success('Welcome back! 🚀');
      navigate('/dashboard');
    } else {
      toast.error(result.payload || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.3), transparent)' }} />
        <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 10, repeat: Infinity, delay: 2 }}
          className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.3), transparent)' }} />
      </div>

      <motion.div
        className="w-full max-w-md px-4"
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center text-3xl animate-pulse-glow"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
            whileHover={{ rotate: 10, scale: 1.1 }}
          >
            ⬡
          </motion.div>
          <h1 className="text-3xl font-display font-bold gradient-text">LifeOS</h1>
          <p className="text-white/40 mt-2">Your Personal Life Command Center</p>
        </div>

        {/* Form card */}
        <div className="glass-card p-8">
          <h2 className="text-xl font-display font-bold text-white mb-6">Sign In</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">Email</label>
              <input type="email" required value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="input-glass" placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">Password</label>
              <input type="password" required value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className="input-glass" placeholder="••••••••" />
            </div>

            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-red-400 text-sm px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
                {error}
              </motion.div>
            )}

            <motion.button
              type="submit" disabled={loading}
              className="btn-primary w-full justify-center flex items-center gap-2"
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
            >
              {loading ? (
                <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                  ◎
                </motion.span>
              ) : 'Sign In →'}
            </motion.button>
          </form>

          <p className="text-center text-white/40 text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-medium">Create one free</Link>
          </p>
        </div>

        {/* Demo hint */}
        <p className="text-center text-white/20 text-xs mt-4">
          First time? Register with any email and password (min 6 chars)
        </p>
      </motion.div>
    </div>
  );
}
