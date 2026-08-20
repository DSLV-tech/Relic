import { useCallback } from 'react';

type Pattern = 'tap' | 'success' | 'alert';

const PATTERNS: Readonly<Record<Pattern, number | readonly number[]>> = {
  tap: 8,
  success: [12, 40, 22],
  alert: [40, 60, 40, 60, 90],
};

/**
 * Feedback aptico. Su iOS Safari `vibrate` non esiste: la chiamata è un no-op
 * silenzioso, non un errore da gestire in ogni call site.
 */
export const useHaptics = (): ((pattern: Pattern) => void) =>
  useCallback((pattern: Pattern) => {
    if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return;
    navigator.vibrate(PATTERNS[pattern] as number | number[]);
  }, []);
