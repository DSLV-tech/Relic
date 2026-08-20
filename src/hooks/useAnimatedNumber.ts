import { useEffect, useRef, useState } from 'react';

/**
 * Interpola verso il valore reale. In un incremental il numero che "corre"
 * verso l'alto vale metà della soddisfazione: senza, i salti sembrano bug.
 */
export const useAnimatedNumber = (target: number, speed = 0.18): number => {
  const [display, setDisplay] = useState(target);
  const frame = useRef<number | null>(null);
  const current = useRef(target);

  useEffect(() => {
    const step = (): void => {
      const diff = target - current.current;
      if (Math.abs(diff) < 0.5) {
        current.current = target;
        setDisplay(target);
        frame.current = null;
        return;
      }
      current.current += diff * speed;
      setDisplay(current.current);
      frame.current = requestAnimationFrame(step);
    };

    if (frame.current === null) frame.current = requestAnimationFrame(step);
    return () => {
      if (frame.current !== null) {
        cancelAnimationFrame(frame.current);
        frame.current = null;
      }
    };
  }, [target, speed]);

  return display;
};
