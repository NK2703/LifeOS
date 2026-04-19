import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { setTheme } from '../features/uiSlice';

export default function ThemeSwitcher() {
  const dispatch = useDispatch();
  const { theme } = useSelector(s => s.ui);

  const toggleTheme = () => {
    dispatch(setTheme(theme === 'dark' ? 'light' : 'dark'));
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleTheme}
      className="relative flex items-center justify-center w-10 h-10 rounded-full border border-white/10 transition-all duration-300 overflow-hidden group"
      style={{
        background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
        backdropFilter: 'blur(10px)',
      }}
      aria-label="Toggle Theme"
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
      <span className="text-lg relative z-10 drop-shadow-sm">
        {theme === 'dark' ? '🌙' : '☀️'}
      </span>
    </motion.button>
  );
}
