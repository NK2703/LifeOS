import { useEffect, useRef, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  fetchCareer,
  savePositionAsync,
  fetchRoadmap,
  setChosenPath,
  addMilestone,
} from '../features/careerSlice';
import Scene from '../3d/Scene';
import ExpensePanel from '../components/canvas/ExpensePanel';
import TodoPanel from '../components/canvas/TodoPanel';
import useScrollPos from '../hooks/useScrollPos';
import ThemeSwitcher from '../components/ThemeSwitcher';

const CAREER_PATHS = [
  { id: 'B.Com',            label: 'B.Com',                 icon: '📊', color: '#a78bfa' },
  { id: 'B.Tech',           label: 'B.Tech CS',             icon: '💻', color: '#60a5fa' },
  { id: 'BSc',              label: 'BSc Science',           icon: '🔬', color: '#34d399' },
  { id: 'BA',               label: 'BA Arts',               icon: '🎨', color: '#f472b6' },
  { id: 'MBBS',             label: 'MBBS',                  icon: '⚕️',  color: '#f87171' },
  { id: 'BBA',              label: 'BBA',                   icon: '🏢', color: '#fbbf24' },
  { id: 'LLB',              label: 'LLB Law',               icon: '⚖️', color: '#f59e0b' },
  { id: 'B.Arch',           label: 'B.Arch',                icon: '🏗️', color: '#6ee7b7' },
  { id: 'BFA',              label: 'BFA Fine Arts',         icon: '🎨', color: '#e879f9' },
  { id: 'BSc Agriculture',  label: 'BSc Agriculture',       icon: '🌱', color: '#4ade80' },
];

// How often (ms) to auto-save position to MongoDB
const SAVE_DEBOUNCE_MS = 2000;

export default function CareerOdyssey() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { scrollPosition, chosenPath, unlockedMilestones, milestones, loading } = useSelector((s) => s.career);
  const { theme } = useSelector((s) => s.ui);

  const [hudVisible, setHudVisible] = useState(false);
  const [pathSelectorOpen, setPathSelectorOpen] = useState(false);
  const [activeMilestone, setActiveMilestone] = useState(null);

  const saveTimerRef = useRef(null);
  const unlockedRef = useRef(new Set(unlockedMilestones));

  // Use new reusable scroll hook
  const { scrollT, scrollRef } = useScrollPos({
    initial: scrollPosition,
    onChange: (t) => {
      setHudVisible(t > 0.08);

      // Check milestone unlocks dynamically against loaded milestones
      if (milestones && milestones.length > 0) {
        milestones.forEach((m) => {
          if (t >= m.t - 0.02 && !unlockedRef.current.has(m.label)) {
            unlockedRef.current.add(m.label);
            dispatch(addMilestone(m.label));
            setActiveMilestone(m.label);
            setTimeout(() => setActiveMilestone(null), 3000);
          }
        });
      }

      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        dispatch(
          savePositionAsync({
            scrollPosition: t,
            unlockedMilestones: [...unlockedRef.current],
          })
        );
      }, SAVE_DEBOUNCE_MS);
    }
  });

  // ── Initial data fetch ────────────────────────────────────────────────────
  useEffect(() => {
    dispatch(fetchCareer());
  }, [dispatch]);

  // Fetch roadmap data whenever the chosenPath changes
  useEffect(() => {
    if (chosenPath && chosenPath !== 'Unselected') {
      dispatch(fetchRoadmap(chosenPath));
    }
  }, [chosenPath, dispatch]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => clearTimeout(saveTimerRef.current);
  }, []);

  // ── Milestone currently near character ───────────────────────────────────
  const nearestMilestone = (milestones || []).reduce((closest, m) => {
    const d = Math.abs(scrollT - m.t);
    return d < Math.abs(scrollT - (closest?.t ?? -1)) ? m : closest;
  }, null);

  return (
    <div 
      ref={scrollRef}
      className="career-odyssey-root"
      aria-label="Career journey scroll container"
    >
      {/* ── Sticky 3D Canvas ──────────────────────────────────────────────── */}
      <div className="canvas-sticky-wrapper">
        <Scene scrollT={scrollT} milestones={milestones} theme={theme} />

        {/* Top bar overlay */}
        <div className="canvas-top-bar">
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-ghost px-3 py-2 text-xs flex items-center gap-2"
          >
            ← Dashboard
          </button>

          <div className="flex items-center gap-3">
            <ThemeSwitcher />
            
            {/* Current milestone label */}
            <AnimatePresence mode="wait">
              {nearestMilestone && scrollT > 0.01 && (
                <motion.div
                  key={nearestMilestone.label}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="text-xs font-semibold px-3 py-1.5 rounded-full"
                  style={{
                    background: `${nearestMilestone.color}22`,
                    border: `1px solid ${nearestMilestone.color}55`,
                    color: nearestMilestone.color,
                    backdropFilter: 'blur(12px)',
                  }}
                >
                  {nearestMilestone.label}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Career path selector */}
            <div className="relative">
              <button
                id="career-path-selector"
                onClick={() => setPathSelectorOpen((p) => !p)}
                className="btn-3d text-xs px-4 py-2 rounded-xl font-semibold"
                style={{
                  background: 'rgba(139,92,246,0.2)',
                  border: '1px solid rgba(139,92,246,0.4)',
                  backdropFilter: 'blur(12px)',
                  color: '#c4b5fd',
                }}
              >
                🎯 {chosenPath === 'Unselected' ? 'Choose Path' : chosenPath}
              </button>

              <AnimatePresence>
                {pathSelectorOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    className="absolute right-0 top-11 z-50 w-56 rounded-2xl overflow-hidden"
                    style={{
                      background: 'rgba(9,11,26,0.95)',
                      border: '1px solid rgba(139,92,246,0.3)',
                      backdropFilter: 'blur(24px)',
                      boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
                    }}
                  >
                    {CAREER_PATHS.map((p) => (
                      <motion.button
                        whileHover={{
                          scale: 1.02,
                          backgroundColor: 'rgba(255,255,255,0.1)',
                          boxShadow: `0 0 15px ${p.color}40`,
                        }}
                        key={p.id}
                        onClick={() => {
                          dispatch(setChosenPath(p.id));
                          dispatch(savePositionAsync({ chosenPath: p.id }));
                          // fetchRoadmap triggered via useEffect above
                          setPathSelectorOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-colors duration-150"
                        style={{ color: chosenPath === p.id ? p.color : 'rgba(255,255,255,0.7)' }}
                      >
                        <span>{p.icon}</span>
                        <span className="font-medium">{p.label}</span>
                        {chosenPath === p.id && <span className="ml-auto text-xs">✓</span>}
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Progress bar at top */}
        <div className="scroll-progress-bar">
          <motion.div
            className="scroll-progress-fill"
            style={{ scaleX: scrollT, transformOrigin: 'left' }}
          />
        </div>

        {/* Milestone unlock toast */}
        <AnimatePresence>
          {activeMilestone && (
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className="milestone-toast"
            >
              <span className="text-lg">🎉</span>
              <span className="text-sm font-semibold text-white">Milestone unlocked!</span>
              <span className="text-xs text-white/60">{activeMilestone}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scroll hint arrow */}
        <AnimatePresence>
          {scrollT < 0.03 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="scroll-hint"
            >
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="flex flex-col items-center gap-1"
              >
                <span className="text-white/40 text-xs tracking-widest">SCROLL TO JOURNEY</span>
                <span className="text-white/30 text-2xl">↓</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Glass HUD panels ─────────────────────────────────────────────── */}
        <TodoPanel visible={hudVisible} />
        <ExpensePanel visible={hudVisible} />
      </div>

      {/* ── Tall scroll container (creates the scroll space) ──────────────── */}
      <div style={{ height: '600vh', pointerEvents: 'none' }} />

      {/* Loading overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: 'rgba(9,11,26,0.9)', backdropFilter: 'blur(8px)' }}
          >
            <div className="text-center">
              <div
                className="w-20 h-20 mx-auto mb-5 rounded-full animate-spin"
                style={{
                  background: 'conic-gradient(from 0deg, #6366f1, #8b5cf6, #c471ed, transparent)',
                }}
              />
              <p className="text-white/60 text-sm tracking-wider">Loading Your Career Journey…</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
