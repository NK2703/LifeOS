import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink, useNavigate } from 'react-router-dom';
import { logout } from '../features/authSlice';
import { toggleSidebar } from '../features/uiSlice';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '⬡' },
  { path: '/tasks', label: 'Tasks', icon: '✓' },
  { path: '/goals', label: 'Goals', icon: '◎' },
  { path: '/study', label: 'Study Planner', icon: '◈' },
  { path: '/finance', label: 'Finance', icon: '◆' },
  { path: '/performance', label: 'Performance', icon: '▲' },
  { path: '/career-odyssey', label: 'Career Odyssey', icon: '🚀' },
];

export default function Sidebar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(s => s.auth);
  const { sidebarOpen } = useSelector(s => s.ui);
  const { today } = useSelector(s => s.performance);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <AnimatePresence>
      {sidebarOpen && (
        <motion.aside
          initial={{ x: -280, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -280, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed left-0 top-0 h-full w-64 z-40 flex flex-col"
          style={{
            background: 'rgba(13,17,23,0.95)',
            borderRight: '1px solid rgba(255,255,255,0.06)',
            backdropFilter: 'blur(20px)',
          }}
        >
          {/* Logo */}
          <div className="p-6 pb-4">
            <motion.div
              className="flex items-center gap-3"
              whileHover={{ scale: 1.02 }}
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                ⬡
              </div>
              <div>
                <h1 className="font-display font-bold text-base text-white">LifeOS</h1>
                <p className="text-xs text-white/40">Personal Dashboard</p>
              </div>
            </motion.div>
          </div>

          {/* User Card */}
          <div className="px-4 mb-4">
            <div className="glass-card p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #6366f1, #c471ed)' }}>
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user?.name || 'User'}</p>
                <p className="text-xs text-white/40 truncate">{user?.email || ''}</p>
              </div>
              {today && (
                <div className="flex-shrink-0 text-right">
                  <div className="text-xs font-bold gradient-text">{Math.round(today.total_score)}</div>
                  <div className="text-xs text-white/40">pts</div>
                </div>
              )}
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
            {navItems.map((item, i) => (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `sidebar-item ${isActive ? 'active' : ''}`
                  }
                >
                  <span className="text-lg w-6 text-center">{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              </motion.div>
            ))}
          </nav>

          {/* Bottom */}
          <div className="p-4 border-t border-white/5">
            <button onClick={handleLogout} className="sidebar-item w-full">
              <span className="text-lg">⇥</span>
              <span>Logout</span>
            </button>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
