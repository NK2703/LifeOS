import { motion, AnimatePresence } from 'framer-motion';
import { modalVariants, overlayVariants } from '../animations/variants';

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-50"
            style={{ background: 'rgba(6,9,24,0.85)', backdropFilter: 'blur(8px)' }}
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              className={`glass-card w-full ${sizes[size]} p-6 relative`}
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={e => e.stopPropagation()}
              style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.6), 0 0 40px rgba(99,102,241,0.15)' }}
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-display font-bold text-white">{title}</h2>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
                >
                  ✕
                </button>
              </div>
              {children}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
