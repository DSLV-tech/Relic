import { useState } from 'react';

import { PRESTIGE_THRESHOLD } from '../../data/balance';
import { formatNumber, formatPercent } from '../../lib/format';
import { prestigeMultiplier } from '../../lib/math';
import { useGameStore } from '../../store/gameStore';
import { useDerived, usePrestigePreview, useResource } from '../../store/selectors';
import { Modal } from '../ui/Modal';
import { Sprite } from '../ui/Sprite';

export const PrestigePanel = (): JSX.Element => {
  const [confirming, setConfirming] = useState(false);
  const preview = usePrestigePreview();
  const derived = useDerived();
  const shards = useResource('frammenti');
  const prestige = useGameStore((state) => state.prestige);

  const ready = preview.available > 0;
  const progress = Math.min(1, preview.lifetime / PRESTIGE_THRESHOLD);

  return (
    <section className="flex flex-col gap-3 rounded-lg border border-violet-900/40 bg-gradient-to-b from-stone-900/70 to-stone-950/70 p-3">
      <header className="flex items-center gap-3">
        <Sprite id="vortice_temporale" size={40} className={ready ? 'animate-spin [animation-duration:6s]' : 'opacity-60'} />
        <div className="flex-1">
          <h2 className="text-sm font-semibold tracking-wide text-violet-200">Salto Temporale</h2>
          <p className="text-[11px] text-stone-500">
            Ciclo #{preview.count + 1} · moltiplicatore attuale ×{derived.prestigeMultiplier.toFixed(2)}
          </p>
        </div>
      </header>

      {!ready ? (
        <>
          <div className="h-2 overflow-hidden rounded bg-stone-800">
            <div
              className="h-full bg-gradient-to-r from-violet-800 to-violet-400 transition-[width] duration-300"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          <p className="text-[11px] text-stone-500">
            {formatNumber(preview.lifetime)} / {formatNumber(PRESTIGE_THRESHOLD)} essenza in questo
            ciclo ({formatPercent(progress)})
          </p>
        </>
      ) : (
        <>
          <div className="flex items-center justify-between rounded border border-violet-800/50 bg-violet-950/30 px-3 py-2">
            <span className="text-xs text-stone-400">Ricompensa</span>
            <span className="flex items-center gap-1.5 font-mono text-sm text-violet-200">
              <Sprite id="frammento_eternita" size={20} />+{preview.available}
            </span>
          </div>
          <p className="text-[11px] leading-snug text-stone-500">
            Il moltiplicatore passerebbe da ×{derived.prestigeMultiplier.toFixed(2)} a ×
            {prestigeMultiplier(shards + preview.available).toFixed(2)}. Perdi essenza, monete,
            potenziamenti e reliquie; tieni Frammenti e ricordi.
          </p>
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="rounded-lg border-2 border-violet-500 bg-violet-600/20 px-4 py-2 text-sm font-semibold text-violet-200 transition hover:bg-violet-600/35"
          >
            Attiva la macchina del tempo
          </button>
        </>
      )}

      <Modal open={confirming} title="Confermi il salto?" onClose={() => setConfirming(false)}>
        <div className="flex flex-col gap-4">
          <p className="text-sm text-stone-300">
            La bottega tornerà com'era il primo giorno. Manterrai{' '}
            <strong className="text-violet-300">{shards + preview.available} Frammenti</strong> e
            tutti i ricordi già sbloccati.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="flex-1 rounded border border-stone-700 px-4 py-2 text-sm text-stone-400 transition hover:bg-stone-800"
            >
              Non ancora
            </button>
            <button
              type="button"
              onClick={() => {
                prestige();
                setConfirming(false);
              }}
              className="flex-1 rounded border border-violet-500 bg-violet-600/25 px-4 py-2 text-sm font-semibold text-violet-100 transition hover:bg-violet-600/45"
            >
              Salta
            </button>
          </div>
        </div>
      </Modal>
    </section>
  );
};
