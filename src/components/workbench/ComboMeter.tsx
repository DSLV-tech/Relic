import { memo } from 'react';

import { COMBO_MAX, COMBO_STEP } from '../../data/balance';
import { useGameStore } from '../../store/gameStore';

/**
 * Il termometro della combo. Sta sopra la reliquia perché l'occhio è già lì:
 * un indicatore in un angolo dello schermo non verrebbe mai guardato.
 */
export const ComboMeter = memo(function ComboMeter() {
  const combo = useGameStore((state) => state.combo);
  if (combo < 2) return <div className="h-7 shrink-0" aria-hidden />;

  const heat = Math.min(1, (combo - 1) / (COMBO_MAX - 1));
  const multiplier = 1 + (combo - 1) * COMBO_STEP;

  return (
    <div className="flex h-7 shrink-0 flex-col items-center justify-center gap-0.5">
      <p
        className="font-mono text-base font-black leading-none tabular-nums"
        style={{
          color: `hsl(${45 - heat * 45}, 95%, ${62 + heat * 12}%)`,
          textShadow: `0 0 ${6 + heat * 14}px hsla(${45 - heat * 45}, 95%, 60%, 0.75)`,
          transform: `scale(${1 + heat * 0.22})`,
        }}
      >
        ×{multiplier.toFixed(2)}
      </p>
      <div className="h-1 w-24 overflow-hidden rounded-full bg-stone-800">
        <div
          className="h-full rounded-full transition-[width] duration-100"
          style={{
            width: `${heat * 100}%`,
            background: `linear-gradient(90deg, hsl(45,90%,55%), hsl(${45 - heat * 45},95%,62%))`,
          }}
        />
      </div>
    </div>
  );
});
