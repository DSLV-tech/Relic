import { useEffect, useRef } from 'react';

import { MAX_TICK_DELTA_MS, TICK_MS } from '../data/balance';
import { useGameStore } from '../store/gameStore';

/**
 * Game loop disaccoppiato dal render di React.
 *
 * `requestAnimationFrame` si ferma quando la scheda è in background — che è
 * esattamente quello che vogliamo: il tempo trascorso viene poi recuperato
 * dal progresso offline invece che da un `setInterval` che il browser
 * strozza in modo imprevedibile.
 */
export const useGameLoop = (enabled = true): void => {
  const tick = useGameStore((state) => state.tick);
  const accumulator = useRef(0);
  const lastFrame = useRef(0);
  const frameId = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;

    lastFrame.current = performance.now();

    const step = (now: number): void => {
      const delta = Math.min(MAX_TICK_DELTA_MS, now - lastFrame.current);
      lastFrame.current = now;
      accumulator.current += delta;

      // Passo fisso: la simulazione è deterministica e indipendente dagli FPS.
      let guard = 0;
      while (accumulator.current >= TICK_MS && guard < 20) {
        tick(TICK_MS);
        accumulator.current -= TICK_MS;
        guard += 1;
      }
      frameId.current = requestAnimationFrame(step);
    };

    frameId.current = requestAnimationFrame(step);
    return () => {
      if (frameId.current !== null) cancelAnimationFrame(frameId.current);
    };
  }, [enabled, tick]);
};
