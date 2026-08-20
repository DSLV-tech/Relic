import { memo } from 'react';

import { usePrestigePreview } from '../../store/selectors';
import { Sprite } from '../ui/Sprite';

export interface PrestigeCalloutProps {
  readonly onOpen: () => void;
}

/**
 * Richiamo compatto per il Salto Temporale. Nella v0.3 il pannello intero
 * stava sempre nel tab Banco, sotto la piega, occupando spazio per un'azione
 * che si compie una volta ogni ciclo. Ora compare solo quando è disponibile.
 */
export const PrestigeCallout = memo<PrestigeCalloutProps>(function PrestigeCallout({ onOpen }) {
  const { available } = usePrestigePreview();
  if (available <= 0) return null;

  return (
    <button
      type="button"
      onClick={onOpen}
      className="animate-quest-ring flex shrink-0 items-center gap-1.5 rounded-lg border border-violet-500/70 bg-violet-700/25 px-2.5 py-1.5 text-violet-100 transition active:scale-[0.97]"
    >
      <Sprite id="vortice_temporale" size={20} className="animate-spin [animation-duration:6s]" />
      <span className="text-[11px] font-semibold leading-none">
        Salto pronto
        <span className="ml-1 font-mono text-violet-300">+{available}</span>
      </span>
    </button>
  );
});
