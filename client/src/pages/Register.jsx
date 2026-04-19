import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { registerUser, clearError } from '../features/authSlice';
import toast from 'react-hot-toast';

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector(s => s.auth);
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    const result = await dispatch(registerUser(form));
    if (registerUser.fulfilled.match(result)) {
      toast.success('Account created! Welcome to LifeOS 🎉');
      navigate('/dashboard');
    } else {
      toast.error(result.payload || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-1/3 right-1/4 w-96 h-96 rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.3), transparent)' }} />
        <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 12, repeat: Infinity, delay: 3 }}
          className="absolute bottom-1/4 left-1/4 w-80 h-80 rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(0,212,255,0.15), transparent)' }} />
      </div>

      <motion.div className="w-full max-w-md px-4"
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}>

        <div className="text-center mb-8">
          <motion.div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center text-3xl"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
            whileHover={{ rotate: -10, scale: 1.1 }}>
            ⬡
          </motion.div>
          <h1 className="text-3xl font-display font-bold gradient-text">LifeOS</h1>
          <p className="text-white/40 mt-2">Start your productivity journey</p>
        </div>

        <div className="glass-card p-8">
          <h2 className="text-xl font-display font-bold text-white mb-6">Create Account</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">Full Name</label>
              <input type="text" required value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="input-glass" placeholder="Your name" />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">Email</label>
              <input type="email" required value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="input-glass" placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">Password</label>
              <input type="password" required minLength={6} value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className="input-glass" placeholder="Min 6 characters" />
            </div>

            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-red-400 text-sm px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
                {error}
              </motion.div>
            )}

            <motion.button type="submit" disabled={loading}
              className="btn-primary w-full justify-center flex items-center gap-2"
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
              {loading ? '◎ Creating...' : 'Get Started →'}
            </motion.button>
          </form>

          <p className="text-center text-white/40 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
