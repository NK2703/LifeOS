import { useRef, useCallback, useEffect, useState } from 'react';

/**
 * useScrollPos — custom hook that tracks scroll percentage within
 * a scroll container and returns a normalised [0, 1] value.
 *
 * Usage:
 *   const { scrollT, scrollRef } = useScrollPos({ onChange });
 *   <div ref={scrollRef} style={{ overflowY: 'scroll' }}>...</div>
 *
 * @param {object}   options
 * @param {function} options.onChange  — optional callback(t: number) on every scroll event
 * @param {number}   options.initial   — starting scroll position [0, 1], default 0
 * @returns {{ scrollT: number, scrollRef: React.RefObject }}
 */
export default function useScrollPos({ onChange, initial = 0 } = {}) {
  const scrollRef = useRef(null);
  const [scrollT, setScrollT] = useState(initial);

  // Keep onChange stable reference
  const onChangeRef = useRef(onChange);
  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const { scrollTop, scrollHeight, clientHeight } = el;
    const maxScroll = scrollHeight - clientHeight;
    const t = maxScroll > 0 ? Math.min(scrollTop / maxScroll, 1) : 0;

    setScrollT(t);
    onChangeRef.current?.(t);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    el.addEventListener('scroll', handleScroll, { passive: true });

    // Restore scroll position to match initial value
    if (initial > 0) {
      const { scrollHeight, clientHeight } = el;
      el.scrollTop = initial * (scrollHeight - clientHeight);
    }

    return () => el.removeEventListener('scroll', handleScroll);
  }, [handleScroll, initial]);

  return { scrollT, scrollRef };
}
