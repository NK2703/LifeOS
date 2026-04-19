import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import {
  addTodoAsync,
  updateTodoAsync,
  deleteTodoAsync,
} from '../../features/careerSlice';

const PRIORITY_COLORS = { low: '#34d399', medium: '#f59e0b', high: '#f472b6' };
const PRIORITY_LABELS = { low: '▽', medium: '◈', high: '▲' };

export default function TodoPanel({ visible }) {
  const dispatch = useDispatch();
  const { todos } = useSelector((s) => s.career);
  const [open, setOpen] = useState(true);
  const [input, setInput] = useState('');
  const [priority, setPriority] = useState('medium');

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    await dispatch(addTodoAsync({ text: input.trim(), priority }));
    setInput('');
  };

  const done = todos.filter((t) => t.done).length;
  const pct = todos.length > 0 ? Math.round((done / todos.length) * 100) : 0;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ x: -120, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -120, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 28, delay: 0.08 }}
          className="fixed bottom-6 left-5 z-40 w-80"
        >
          {/* Header toggle */}
          <button
            id="todo-panel-toggle"
            onClick={() => setOpen((p) => !p)}
            className="w-full flex items-center justify-between px-5 py-3.5 rounded-2xl text-sm font-semibold text-white btn-3d"
            style={{
              background: 'rgba(139,92,246,0.18)',
              border: '1px solid rgba(139,92,246,0.35)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}
          >
            <span className="flex items-center gap-2">
              <span>🗺️</span> Career To-Do
            </span>
            <span className="text-xs text-purple-300 font-bold">
              {done}/{todos.length} · {pct}%
            </span>
          </button>

          {/* Expandable body */}
          <AnimatePresence>
            {open && (
              <motion.div
                key="todo-body"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden mt-2 rounded-2xl"
                style={{
                  background: 'rgba(9,11,26,0.85)',
                  border: '1px solid rgba(139,92,246,0.2)',
                  backdropFilter: 'blur(24px)',
                  WebkitBackdropFilter: 'blur(24px)',
                }}
              >
                <div className="p-4 space-y-3">
                  {/* Progress bar */}
                  {todos.length > 0 && (
                    <div>
                      <div className="flex justify-between text-xs text-white/40 mb-1.5">
                        <span>Journey Progress</span>
                        <span>{pct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/5">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: 'linear-gradient(90deg, #8b5cf6, #c471ed)' }}
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.6 }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Todo list */}
                  <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                    {todos.length === 0 && (
                      <p className="text-xs text-white/30 text-center py-4">
                        Add your first career goal below ↓
                      </p>
                    )}
                    <AnimatePresence>
                      {todos.map((todo) => (
                        <motion.div
                          key={todo._id}
                          layout
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="flex items-center gap-2 py-2 px-2.5 rounded-xl group"
                          style={{ background: 'rgba(255,255,255,0.04)' }}
                        >
                          {/* Checkbox */}
                          <button
                            onClick={() =>
                              dispatch(updateTodoAsync({ id: todo._id, data: { done: !todo.done } }))
                            }
                            className="flex-shrink-0 w-5 h-5 rounded-full border flex items-center justify-center transition-all duration-200"
                            style={{
                              borderColor: PRIORITY_COLORS[todo.priority],
                              background: todo.done ? PRIORITY_COLORS[todo.priority] : 'transparent',
                            }}
                          >
                            {todo.done && <span className="text-white text-xs">✓</span>}
                          </button>

                          {/* Text */}
                          <span
                            className={`flex-1 text-xs transition-all duration-200 ${
                              todo.done ? 'line-through text-white/30' : 'text-white/80'
                            }`}
                          >
                            <span
                              className="mr-1 text-xs"
                              style={{ color: PRIORITY_COLORS[todo.priority] }}
                            >
                              {PRIORITY_LABELS[todo.priority]}
                            </span>
                            {todo.text}
                          </span>

                          {/* Delete */}
                          <button
                            onClick={() => dispatch(deleteTodoAsync(todo._id))}
                            className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-400 text-xs transition-all duration-200 flex-shrink-0"
                          >
                            ✕
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  {/* Add todo form */}
                  <form onSubmit={handleAdd} className="space-y-2">
                    <input
                      type="text"
                      id="career-todo-input"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Add a career goal…"
                      className="input-glass text-xs w-full"
                      style={{ padding: '8px 12px' }}
                    />
                    <div className="flex gap-2">
                      {['low', 'medium', 'high'].map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setPriority(p)}
                          className="flex-1 text-xs py-1.5 rounded-lg capitalize transition-all duration-200"
                          style={{
                            background:
                              priority === p
                                ? `${PRIORITY_COLORS[p]}30`
                                : 'rgba(255,255,255,0.04)',
                            border: `1px solid ${priority === p ? PRIORITY_COLORS[p] : 'rgba(255,255,255,0.1)'}`,
                            color: priority === p ? PRIORITY_COLORS[p] : 'rgba(255,255,255,0.4)',
                          }}
                        >
                          {PRIORITY_LABELS[p]} {p}
                        </button>
                      ))}
                    </div>
                    <button
                      type="submit"
                      id="add-todo-btn"
                      className="w-full text-xs py-2 rounded-xl font-semibold transition-all duration-200 btn-3d"
                      style={{
                        background: 'linear-gradient(135deg, #8b5cf6, #c471ed)',
                        boxShadow: '0 4px 20px rgba(139,92,246,0.4)',
                      }}
                    >
                      + Add Goal
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
