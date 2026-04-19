import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Goals from './pages/Goals';
import Finance from './pages/Finance';
import StudyPlanner from './pages/StudyPlanner';
import Performance from './pages/Performance';
import CareerOdyssey from './pages/CareerOdyssey';

// Components
import Sidebar from './components/Sidebar';
import ThemeSwitcher from './components/ThemeSwitcher';

// Redux
import { toggleSidebar, setTheme } from './features/uiSlice';
import { fetchTodayScore } from './features/performanceSlice';

// Protected route wrapper
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useSelector(s => s.auth);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

// Layout for authenticated pages
function AppLayout({ children }) {
  const { sidebarOpen } = useSelector(s => s.ui);
  const dispatch = useDispatch();

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => dispatch(toggleSidebar())} />
      )}
      {/* Main content */}
      <main
        className="flex-1 min-h-screen transition-all duration-300"
        style={{ marginLeft: sidebarOpen ? '256px' : '0', padding: '32px 28px' }}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => dispatch(toggleSidebar())}
              className="btn-ghost px-3 py-2 text-sm"
            >
              {sidebarOpen ? '◀' : '▶'}
            </button>
            <div className="text-xs text-white/20 hidden sm:block">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
          
          {/* Theme Switcher */}
          <div className="flex items-center gap-3">
            <ThemeSwitcher />
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}

export default function App() {
  const location = useLocation();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector(s => s.auth);
  const { theme } = useSelector(s => s.ui);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchTodayScore());
    }
  }, [isAuthenticated, dispatch]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const isAuthPage = ['/login', '/register'].includes(location.pathname);

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(13,17,23,0.95)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            fontSize: '14px',
            backdropFilter: 'blur(20px)',
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          duration: 3000,
        }}
      />

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Auth routes */}
          <Route path="/login" element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
          } />
          <Route path="/register" element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />
          } />

          {/* Protected routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <AppLayout><Dashboard /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/tasks" element={
            <ProtectedRoute>
              <AppLayout><Tasks /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/goals" element={
            <ProtectedRoute>
              <AppLayout><Goals /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/finance" element={
            <ProtectedRoute>
              <AppLayout><Finance /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/study" element={
            <ProtectedRoute>
              <AppLayout><StudyPlanner /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/performance" element={
            <ProtectedRoute>
              <AppLayout><Performance /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/career-odyssey" element={
            <ProtectedRoute>
              <CareerOdyssey />
            </ProtectedRoute>
          } />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </>
  );
}
